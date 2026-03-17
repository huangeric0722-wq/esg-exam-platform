import { supabase } from './supabase';

/**
 * 獲取雷達圖數據
 * 計算方式：得分 = 100 - (該分類錯誤題數 / 該分類總題數 * 100)
 */
export const fetchRadarData = async (userId) => {
  try {
    // 1. 獲取所有題目以計算各類別總數
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id, category');

    if (questionsError) throw questionsError;

    // 2. 獲取使用者在 wrong_questions 表中的所有紀錄
    const { data: wrongQuestions, error: wrongError } = await supabase
      .from('wrong_questions')
      .select('question_id')
      .eq('user_id', userId);

    if (wrongError) throw wrongError;

    // 3. 整理分類統計
    const categoryStats = {};

    // 初始化所有分類的總題數
    allQuestions.forEach(q => {
      const cat = q.category || '未分類';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, wrong: 0 };
      }
      categoryStats[cat].total += 1;
    });

    // 建立一個題目 ID 到分類的 Map，方便查詢
    const questionIdToCategory = {};
    allQuestions.forEach(q => {
      questionIdToCategory[q.id] = q.category || '未分類';
    });

    // 計算各分類錯誤題數
    wrongQuestions.forEach(wq => {
      const cat = questionIdToCategory[wq.question_id];
      if (cat && categoryStats[cat]) {
        categoryStats[cat].wrong += 1;
      }
    });

    // 4. 格式化為 Recharts RadarChart 格式
    const radarData = Object.keys(categoryStats).map(cat => {
      const stats = categoryStats[cat];
      // 防止除以零，並計算分數
      const score = stats.total > 0 
        ? Math.max(0, 100 - Math.round((stats.wrong / stats.total) * 100))
        : 100;
        
      // 簡化類別名稱作為唯一鍵
      const dataKey = cat.replace(/[^\w]/gi, "").toLowerCase(); // 移除特殊字元並轉為小寫

      return {
        subject: cat,
        [dataKey]: score, // 使用動態鍵名
        fullMark: 100
      };
    });

    console.log("Radar Data:", radarData);

    // 如果完全沒資料，回傳全滿的預設值（或者依據需求調整）
    if (radarData.length === 0) {
      return [
        { subject: '永續風險管理與治理', A: 100, fullMark: 100 },
        { subject: '永續基本概念', A: 100, fullMark: 100 },
        { subject: '永續資訊揭露', A: 100, fullMark: 100 },
        { subject: '永續金融', A: 100, fullMark: 100 }
      ];
    }
    
    return radarData;
  } catch (error) {
    console.error('Error fetching radar data:', error);
    return [];
  }
};
