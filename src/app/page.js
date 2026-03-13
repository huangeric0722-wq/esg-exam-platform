
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Zap, BookMarked, Settings, User, LogOut, Loader2 } from 'lucide-react'; // 匯入 Lucide Icons
import Link from 'next/link'; // 用於導航連結
import { useRouter } from 'next/navigation'; // 用於程式化導航
import { supabase } from '@/../utils/supabase'; // 匯入 Supabase 客戶端實例
import { getWrongQuestionsFromCloud, getTodayCorrectQuestionsCount } from '@/../utils/storage'; // 從雲端獲取錯題數量

const DAILY_GOAL = 80; // 每日目標題數

export default function Home() {
  const [wrongCount, setWrongCount] = useState(0); // 錯題本中的題目數量
  const [session, setSession] = useState(null); // 當前 Supabase Session 狀態
  const [dailyProgress, setDailyProgress] = useState(0); // 今日測驗進度
  const [loading, setLoading] = useState(true); // 初始載入狀態
  const router = useRouter(); // 路由器實例
  
  // --- 事件處理函式 ---
  
  // 監聽測驗完成事件，用於更新每日進度
  useEffect(() => {
    const handleQuizCompletion = (event) => {
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
        }
    };

    window.addEventListener('quizCompleted', handleQuizCompletion);
    return () => window.removeEventListener('quizCompleted', handleQuizCompletion);
  }, []);

  // 載入資料與認證狀態
  useEffect(() => {
    const initializeData = async () => {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        setSession(supabaseSession);
        
        if (supabaseSession) {
            // 載入錯題數
            const wrongIds = await getWrongQuestionsFromCloud();
            setWrongCount(wrongIds.length);

            // 載入今日答對數
            const todayProgress = await getTodayCorrectQuestionsCount();
            setDailyProgress(todayProgress);
        } else {
            setWrongCount(0);
            setDailyProgress(0);
        }

        setLoading(false);
    };

    initializeData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
            // 登入後重新獲取錯題數和進度
            getWrongQuestionsFromCloud().then(ids => setWrongCount(ids.length));
            getTodayCorrectQuestionsCount().then(count => setDailyProgress(count));
        } else {
            setWrongCount(0);
            setDailyProgress(0);
        }
    });

    // 移除本地時間進度檢查，因為現在直接從 DB 讀取今日進度
    
    return () => subscription.unsubscribe();
  }, []); // 移除 router 依賴，避免重複執行
  
  // 登出處理函式
  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setSession(null); 
      setWrongCount(0);
      setDailyProgress(0); // 進度歸零
      localStorage.removeItem("last_quiz_date"); // 清除本地記錄，儘管現在主要依賴 DB
      router.push("/login");
    }
    setLoading(false);
  };

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

      {/* 標頭區域 */}
      <div className="w-full flex justify-between items-center mt-8 z-10">
        <h1 className="text-3xl font-bold tracking-tight">永續發展證照</h1>
        <div className="flex gap-4">
          {session ? (
            <button onClick={handleSignOut} disabled={loading} className="p-2 rounded-full glass-morphism apple-button transition-all duration-200 active:scale-95 disabled:opacity-50">
              <LogOut size={20} className="text-red-400" />
            </button>
          ) : (
            <Link href="/login" className="cursor-pointer">
              <div className="p-2 rounded-full glass-morphism apple-button">
                <User size={20} />
              </div>
            </Link>
          )}
          <button className="p-2 rounded-full glass-morphism apple-button">
            <Settings size={20} />
          </button>
        </div>
      </div>

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
      </div>

      <div className="w-full mb-8 text-center opacity-40 text-xs">
        <p>© 2024 Sustainability Exam Prep</p>
      </div>
    </main>
  );
}
