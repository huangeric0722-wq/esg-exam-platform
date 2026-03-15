import { createClient } from "../../../utils/supabase";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function CommonMistakesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: commonMistakes, error } = await supabase
    .from("global_wrong_stats_view")
    .select("*");

  if (error) {
    console.error("Error fetching common mistakes:", error);
    return <div className="text-red-500">Error loading common mistakes.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto backdrop-blur-sm bg-gray-800/30 rounded-lg shadow-xl p-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-50">🔥 全站魔王題 TOP 10</h1>
        {
          commonMistakes && commonMistakes.length > 0 ? (
            <div className="space-y-4">
              {commonMistakes.map((mistake, index) => (
                <div
                  key={mistake.question_id}
                  className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 shadow-md transition-all duration-300 hover:shadow-lg hover:border-blue-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-extrabold text-blue-400">#{index + 1}</span>
                    <span className="px-3 py-1 bg-purple-600/70 text-sm font-semibold rounded-full text-white">
                      {mistake.category}
                    </span>
                  </div>
                  <p className="text-lg text-gray-200 mb-3 leading-relaxed">
                    {mistake.question}
                  </p>
                  <div className="text-right text-yellow-400 text-xl font-bold">
                    全站累計錯誤次數: {mistake.error_count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-lg">目前沒有魔王題數據。</p>
          )
        }
      </div>
    </div>
  );
}