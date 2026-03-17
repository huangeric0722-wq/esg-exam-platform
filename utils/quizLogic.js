/**
 * Quiz Logic Utilities
 * Implements core calculations and data transformations for the quiz.
 */

import { supabase } from "./supabase";

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param {Array} array 
 * @returns {Array} Shuffled array
 */
export const shuffleQuestions = (questions) => {
  return [...questions].sort(() => Math.random() - 0.5);
};

/**
 * Calculates the score based on user answers and correct answers.
 * Handles the logic where answers in JSON are letters (A, B, C, D) 
 * and options are strings starting with those letters.
 * @param {Array} questions 
 * @param {Array} selectedAnswers Indices of selected options
 * @returns {number} Count of correct answers
 */
export const calculateScore = (questions, selectedAnswers) => {
  return selectedAnswers.reduce((acc, curr, idx) => {
    if (curr === null) return acc;
    const q = questions[idx];
    return curr === q.answer ? acc + 1 : acc;
  }, 0);
};

/**
 * Filters and returns the list of questions answered incorrectly.
 * @param {Array} questions 
 * @param {Array} selectedAnswers 
 * @returns {Array} List of wrong questions
 */
export const getWrongQuestions = (questions, selectedAnswers) => {
  return questions.filter((q, idx) => {
    const selectedIdx = selectedAnswers[idx];
    if (selectedIdx === null) return true; // Unanswered is wrong
    return selectedIdx !== q.answer;
  });
};

/**
 * Formats seconds into a MM:SS or HH:MM:SS string.
 */
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * Fetches and shuffles questions from Supabase.
 * @returns {Promise<Array>} Shuffled list of questions or empty array if error
 */
export const fetchQuestionsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, category, question, options, answer, explanation");

    if (error) {
      console.error("Error fetching questions from Supabase:", error.message);
      return [];
    }

    // Shuffle and take 80 questions or all if fewer
    const shuffled = shuffleQuestions(data).slice(0, 5);
    return shuffled;
  } catch (error) {
    console.error("Unexpected error in fetchQuestionsFromSupabase:", error.message);
    return [];
  }
};
