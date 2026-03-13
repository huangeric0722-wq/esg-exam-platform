require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Supabase URL or Anon Key is missing. Please check your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const questionsFilePath = path.resolve(__dirname, "../questions.json");

async function seedSupabase() {
  try {
    const questionsData = JSON.parse(fs.readFileSync(questionsFilePath, "utf8"));

    console.log(`Attempting to insert ${questionsData.length} questions into Supabase...`);

    // Clear existing data (optional, for development)
    // const { error: deleteError } = await supabase.from("questions").delete().neq("id", 0);
    // if (deleteError) {
    //   console.error("Error clearing existing questions:", deleteError.message);
    //   return;
    // }
    // console.log("Cleared existing questions.");

    for (const q of questionsData) {
      // Assuming a default category or deriving it if needed. 
      // For now, let's just use a placeholder if not present.
      const category = q.category || "General ESG"; 
      
      const { data, error } = await supabase.from("questions").upsert(
        {
          id: q.id,
          category: category,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        },
        { onConflict: "id" } // Upsert based on id
      );

      if (error) {
        console.error(`Error inserting question ${q.id}:`, error.message);
      } else {
        console.log(`Successfully inserted/updated question ${q.id}.`);
      }
    }

    console.log("Supabase seeding complete.");
  } catch (error) {
    console.error("Error seeding Supabase:", error.message);
    process.exit(1);
  }
}

seedSupabase();
