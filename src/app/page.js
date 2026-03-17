
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Zap, BookMarked, Loader2, BarChart2 } from 'lucide-react'; // 匯入 Lucide Icons 和 BarChart2
import Link from 'next/link'; // 用於導航連結
import { useRouter } from 'next/navigation'; // 用於程式化導航
import Navbar from '@/components/Navbar'; // 匯入 Navbar 元件
import RadarChart from '@/components/RadarChart'; // 匯入雷達圖元件
import { supabase } from '@/../utils/supabase'; // 匯入 Supabase 客戶端實例
import { getWrongQuestionsFromCloud, getTodayCorrectQuestionsCount } from '@/../utils/storage'; // 從雲端獲取錯題數量
import { fetchRadarData } from '@/../utils/stats'; // 匯入雷達數據獲取邏輯

const DAILY_GOAL = 80; // 每日目標題數

export default function Home() {
  const [wrongCount, setWrongCount] = useState(0); // 錯題本中的題目數量
  const [session, setSession] = useState(null); // 當前 Supabase Session 狀態
  const [dailyProgress, setDailyProgress] = useState(0); // 今日測驗進度
  const [radarData, setRadarData] = useState([]); // 雷達圖數據
  const [loading, setLoading] = useState(true); // 初始載入狀態
  const [statsLoading, setStatsLoading] = useState(false); // 數據載入狀態
  const [showRadarChart, setShowRadarChart] = useState(false); // 控制雷達圖顯示/隱藏的狀態
  const router = useRouter(); // 路由器實例
  
  // --- 事件處理函式 ---
  
  // 監聽測驗完成事件，用於更新每日進度與雷達圖
  useEffect(() => {
    const handleQuizCompletion = async (event) => {
        if (event.detail && event.detail.count) {
            const questionsCompleted = event.detail.count;
            
            const today = new Date().toISOString().slice(0, 10);
            const savedDate = localStorage.getItem("last_quiz_date");
            
            let newProgress = 0;
            // 檢查是否為同一天
            if (savedDate === today) {
                const currentProgress = parseInt(localStorage.getItem("daily_quiz_progress") || "0", 10);
                newProgress = Math.min(currentProgress + questionsCompleted, DAILY_GOAL);
            } else {
                newProgress = Math.min(questionsCompleted, DAILY_GOAL);
            }
            
            localStorage.setItem("daily_quiz_progress", newProgress.toString());
            localStorage.setItem("last_quiz_date", today);
            setDailyProgress(newProgress);

            // 更新雷達圖數據
            if (session?.user?.id) {
              const data = await fetchRadarData(session.user.id);
              setRadarData(data);
            }
        }
    };

    window.addEventListener('quizCompleted', handleQuizCompletion);
    return () => window.removeEventListener('quizCompleted', handleQuizCompletion);
  }, [session]);

  // 載入資料與認證狀態
  useEffect(() => {
    const initializeData = async () => {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        setSession(supabaseSession);
        
        if (supabaseSession) {
            setStatsLoading(true);
            // 載入錯題數
            const wrongIds = await getWrongQuestionsFromCloud();
            setWrongCount(wrongIds.length);

            // 載入今日答對數
            const todayProgress = await getTodayCorrectQuestionsCount();
            setDailyProgress(todayProgress);

            // 載入雷達圖數據
            const radar = await fetchRadarData(supabaseSession.user.id);
            setRadarData(radar);
            setStatsLoading(false);
        } else {
            setWrongCount(0);
            setDailyProgress(0);
            setRadarData([]);
        }

        setLoading(false);
    };

    initializeData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
            // 登入後重新獲取資料
            getWrongQuestionsFromCloud().then(ids => setWrongCount(ids.length));
            getTodayCorrectQuestionsCount().then(count => setDailyProgress(count));
            fetchRadarData(session.user.id).then(data => setRadarData(data));
        } else {
            setWrongCount(0);
            setDailyProgress(0);
            setRadarData([]);
        }
    });

    return () => subscription.unsubscribe();
  }, []); // 移除 router 依賴，避免重複執行
  
  if (loading) {
      return (
          <main className="min-h-screen flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4 text-foreground">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  <p className="text-sm opacity-60">載入用戶狀態...</p>
              </div>
          </main>
      );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 max-w-md mx-auto relative overflow-hidden animate-fade-in text-foreground">
      {/* 應用背景裝飾 */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* 導覽列 */}
      <Navbar />

      {/* 主要操作區域 */}
      <div className="w-full flex flex-col gap-4 mt-12 mb-auto z-10">
        <div className="p-4 mb-4 rounded-2xl glass-morphism">
          <p className="text-sm opacity-60">今日進度</p>
          <div className="flex items-end justify-between mt-1">
            <h2 className="text-2xl font-semibold">繼續努力! 🌱</h2>
            <span className="text-accent text-sm font-medium">{dailyProgress}/{DAILY_GOAL} 題</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-1000"
              style={{ width: `${(dailyProgress / DAILY_GOAL) * 100}%` }}
            />
          </div>
        </div>

        <Link href="/quiz" className="w-full">
          <div className="w-full flex items-center justify-between p-6 rounded-[24px] bg-accent text-white apple-button shadow-lg shadow-accent/20 cursor-pointer">
            <div className="flex flex-col items-start text-left">
              <span className="text-xl font-bold">隨機測驗 80 題</span>
              <span className="text-sm opacity-80">挑戰自我，模擬正式考試</span>
            </div>
            <Zap size={32} fill="currentColor" />
          </div>
        </Link>
        <Link href="/wrong-book" className="w-full">
          <div className="w-full flex items-center justify-between p-6 rounded-[24px] glass-morphism apple-button cursor-pointer relative">
            <div className="flex flex-col items-start text-left text-foreground">
              <span className="text-xl font-bold">錯題本</span>
              <span className="text-sm opacity-60">溫故知新，專注弱點複習</span>
            </div>
            <div className="relative">
              <BookMarked size={32} className="text-accent" />
              {wrongCount > 0 && (
                <div className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 border-2 border-background">
                  {wrongCount}
                </div>
              )}
              {wrongCount === 0 && (
                <div className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-gray-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 border-2 border-background opacity-40">
                  0
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* 能力雷達圖區塊 - 點擊展開模式 */}
        {session && (
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => setShowRadarChart(!showRadarChart)}
              className="w-full flex items-center justify-between p-6 rounded-[24px] glass-morphism apple-button cursor-pointer"
            >
              <div className="flex flex-col items-start text-left text-foreground">
                <span className="text-xl font-bold">能力雷達圖</span>
                <span className="text-sm opacity-60">
                  {showRadarChart ? '點擊收合' : '點擊展開，查看您的能力分佈'}
                </span>
              </div>
              <BarChart2 
                size={32} 
                className={`text-accent transition-transform duration-300 ${showRadarChart ? 'rotate-180' : ''}`} 
              />
            </button>

            <div className={`w-full h-80 transition-all duration-500 animate-in fade-in zoom-in-95 slide-in-from-top-4 ${showRadarChart ? 'block' : 'hidden'}`}>
                {statsLoading ? (
                  <div className="w-full h-full bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-6 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  </div>
                ) : (
                  <RadarChart data={radarData} />
                )}
              </div>
          </div>
        )}

      </div>

      <div className="w-full mb-8 text-center opacity-40 text-xs">
        <p>© 2024 Sustainability Exam Prep</p>
      </div>
    </main>
  );
}
