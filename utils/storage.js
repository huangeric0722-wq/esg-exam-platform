import { supabase } from './supabase';

/**
 * Cloud Storage Interaction Utilities using Supabase
 * Replaces old LocalStorage logic for "Wrong Questions" book.
 */

/**
 * Fetches the list of wrong questions from Supabase for the current user.
 * Joins with local logic if needed, but primarily relies on DB.
 * Note: Since we only store question_id in wrong_questions table, 
 * we'll need to match them with the full question data.
 * @returns {Promise<Array>} List of objects containing question_id and error_count
 */
export const getWrongQuestionsFromCloud = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('wrong_questions')
    .select('question_id, error_count')
    .eq('user_id', user.id);

  if (error) {
    console.error('DB Error: Error fetching wrong questions:', JSON.stringify(error));
    return [];
  }

  return data; // Returns [{question_id, error_count}, ...]
};

/**
 * Removes a single question from the cloud wrong book.
 * @param {number} questionId The ID of the question to remove
 */
export const removeQuestionFromCloud = async (questionId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('DB Error: User not authenticated. Cannot remove wrong question.');
    return;
  }

  const { error } = await supabase
    .from('wrong_questions')
    .delete()
    .eq('user_id', user.id)
    .eq('question_id', questionId);

  if (error) {
    console.error('DB Error: Error removing wrong question:', JSON.stringify(error));
  }
};

/**
 * Clears all questions from the cloud wrong book for current user.
 */
export const clearWrongBookFromCloud = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('DB Error: User not authenticated. Cannot clear wrong book.');
    return;
  }

  const { error } = await supabase
    .from('wrong_questions')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('DB Error: Error clearing wrong book:', JSON.stringify(error));
  }
};

/**
 * Adds new wrong questions to Supabase, increments error_count if already exists.
 * @param {Array} newWrongQuestions Array of question objects
 */
export const saveNewWrongQuestionsToCloud = async (newWrongQuestions) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('DB Error: User not authenticated. Cannot save wrong questions.');
    return;
  }

  for (const q of newWrongQuestions) {
    // Check if the question already exists for this user
    const { data: existing, error: fetchError } = await supabase
      .from('wrong_questions')
      .select('id, error_count')
      .eq('user_id', user.id)
      .eq('question_id', q.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('DB Error: Error checking existing wrong question:', JSON.stringify(fetchError));
      continue;
    }

    if (existing) {
      // If exists, increment error_count
      const { error: updateError } = await supabase
        .from('wrong_questions')
        .update({ error_count: (existing.error_count || 1) + 1 })
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('DB Error: Error updating error_count:', JSON.stringify(updateError));
      }
    } else {
      // If not exists, insert new record
      const { error: insertError } = await supabase
        .from('wrong_questions')
        .insert({
          user_id: user.id,
          question_id: q.id,
          error_count: 1
        });

      if (insertError) {
        console.error('DB Error: Error inserting new wrong question:', JSON.stringify(insertError));
      }
    }
  }
};

/**
 * Fetches today's correct question count for the current user.
 * @returns {Promise<number>} Correct questions count or 0
 */
export const getTodayCorrectQuestionsCount = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from('user_progress')
    .select('correct_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine.
    console.error('DB Error: Error fetching today\'s progress:', JSON.stringify(error));
    return 0;
  }
  
  return data?.correct_count || 0;
};

/**
 * Increments today's correct question count for the current user by a given amount.
 * Creates a new record if one doesn't exist for today.
 * @param {number} incrementBy The amount to increment by
 */
export const incrementTodayCorrectQuestions = async (incrementBy = 1) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('DB Error: User not authenticated. Cannot increment progress.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // First, try to fetch the existing record
  const { data: existingProgress, error: fetchError } = await supabase
    .from('user_progress')
    .select('id, correct_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('DB Error: Error fetching existing progress for increment:', JSON.stringify(fetchError));
    return;
  }

  let upsertData;
  if (existingProgress) {
    // If record exists, update it
    upsertData = {
      id: existingProgress.id,
      user_id: user.id,
      date: today,
      correct_count: existingProgress.correct_count + incrementBy,
    };
  } else {
    // If no record exists, insert a new one
    upsertData = {
      user_id: user.id,
      date: today,
      correct_count: incrementBy,
    };
  }

  const { error: upsertError } = await supabase
    .from('user_progress')
    .upsert(upsertData, { onConflict: 'user_id, date', ignoreDuplicates: false });

  if (upsertError) {
    console.error('DB Error: Error upserting user progress:', JSON.stringify(upsertError));
  }
};
