
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, CheckCircle2, XCircle, ArrowRight, Home, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { calculateScore, getWrongQuestions, formatTime, fetchQuestionsFromSupabase } from '@/../utils/quizLogic';
import { setupAntiCheatListeners } from '@/../utils/antiCheat';
import { saveNewWrongQuestionsToCloud, incrementTodayCorrectQuestions } from '@/../utils/storage';
import AuthGuard from '@/components/AuthGuard';

export default function QuizPage() {
  return (
    <AuthGuard>
      <QuizContent />
    </AuthGuard>
  );
}

function QuizContent() {
  // --- UI States ---
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null); // New state for loading errors
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  
  // --- Anti-Cheat States ---
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [forceSubmitReason, setForceSubmitReason] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 新增防重複提交狀態

  // --- Derived State ---
  const currentQuestion = questions[currentIndex];
  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  const score = useMemo(() => {
    return calculateScore(questions, selectedAnswers);
  }, [questions, selectedAnswers]);

  // --- Business Logic Wrappers ---
  
  const handleSubmitQuiz = useCallback(async (reason = null) => {
    if (isSubmitting) return; // 防止重複提交
    setIsSubmitting(true); // 開始提交，設置為 true

    const wrongOnes = getWrongQuestions(questions, selectedAnswers);
    if (wrongOnes.length > 0) {
      await saveNewWrongQuestionsToCloud(wrongOnes);
    }

    const correctCount = questions.length - wrongOnes.length;
    if (correctCount > 0) {
      await incrementTodayCorrectQuestions(correctCount);
    }

    setForceSubmitReason(reason);
    setIsFinished(true);
    // 不需要設置 setIsSubmitting(false) 因為會跳轉頁面
  }, [questions, selectedAnswers, isSubmitting]);

  // --- Effects ---

  // Initialization: Fetch and Shuffle from Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setLoadError(null);
      try {
        const fetchedQuestions = await fetchQuestionsFromSupabase();
        if (fetchedQuestions.length === 0) {
          setLoadError('無法從資料庫載入題目，請檢查連線或題庫是否存在。');
        }
        setQuestions(fetchedQuestions);
        setSelectedAnswers(Array(fetchedQuestions.length).fill(null));
        setLoading(false);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setLoadError('載入題目時發生錯誤，請稍後再試。');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (loading || isFinished || loadError || isSubmitting) return; // 提交中禁用計時器
    
    if (timeLeft <= 0) {
      handleSubmitQuiz('因時間到強制交卷');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [loading, isFinished, timeLeft, handleSubmitQuiz, loadError, isSubmitting]);

  // Anti-Cheat Monitor
  useEffect(() => {
    if (isFinished || loading || loadError || isSubmitting) return; // 提交中禁用防作弊

    const cleanup = setupAntiCheatListeners(() => {
      setCheatAttempts(prev => {
        const next = prev + 1;
        if (next >= 3) {
          handleSubmitQuiz('因作弊嫌疑強制交卷');
        } else {
          setShowCheatWarning(true);
          setTimeout(() => setShowCheatWarning(false), 3000);
        }
        return next;
      });
    });

    return cleanup;
  }, [isFinished, loading, handleSubmitQuiz, loadError, isSubmitting]);

  // --- Handlers ---

  const handleSelect = (optionIndex) => {
    if (isFinished || showCheatWarning || loading || loadError || isSubmitting) return; // 提交中禁用選取
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isSubmitting) return; // 提交中禁用下一題

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // --- Render Helpers ---

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm opacity-60">正在準備題目...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-red-900/20 text-red-400 p-6 rounded-xl border border-red-500/30 animate-fade-in">
          <AlertTriangle size={32} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">載入錯誤</h2>
          <p className="mb-6">{loadError}</p>
          <Link href="/">
            <button className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold apple-button">
              返回首頁
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-4 text-foreground">目前沒有可用的題目</h2>
          <Link href="/">
            <button className="px-6 py-3 rounded-xl bg-accent text-white font-bold apple-button">
              返回首頁
            </button>
          </Link>
        </div>
      </main>
    );
  }

  // Final Result View
  if (isFinished) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto animate-fade-in overflow-y-auto">
        <div className="mt-12 text-center">
          <div className="inline-block p-4 rounded-full bg-accent/10 mb-4">
            <CheckCircle2 size={48} className="text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">測驗完成!</h1>
          <p className="opacity-60 mt-2 text-foreground">您的得分</p>
          {forceSubmitReason && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">({forceSubmitReason})</p>
          )}
          <div className="text-6xl font-black text-accent mt-4 mb-8">
            {Math.round((score / questions.length) * 100)}
          </div>
          
          <div className="p-4 rounded-2xl glass-morphism flex justify-between items-center mb-12">
            <span className="opacity-60 text-foreground">答對題數</span>
            <span className="text-xl font-bold text-foreground">{score} / {questions.length}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-foreground">題目檢討</h2>
        <div className="space-y-6 mb-12 text-foreground">
          {questions.map((q, idx) => {
            const selectedIdx = selectedAnswers[idx];
            const isCorrect = selectedIdx !== null && q.options[selectedIdx].startsWith(q.answer);
            const correctOption = q.options.find(opt => opt.startsWith(q.answer));
            
            return (
              <div key={q.id || idx} className={`p-5 rounded-2xl border ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex items-start gap-3 text-foreground">
                  {isCorrect ? <CheckCircle2 size={20} className="text-green-500 mt-1 shrink-0" /> : <XCircle size={20} className="text-red-500 mt-1 shrink-0" />}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium">{idx + 1}. {q.question}</p>
                    <div className="mt-3 space-y-1 text-sm opacity-80">
                      <p>您的回答：<span className={isCorrect ? 'text-green-500' : 'text-red-500'}>{selectedIdx !== null ? q.options[selectedIdx] : '未作答'}</span></p>
                      {!isCorrect && <p className="text-green-500">正確解答：{correctOption}</p>}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-white/5 text-sm leading-relaxed opacity-70 break-words">
                      <strong>詳解：</strong>{q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/" className="block mb-12">
          <button className="w-full py-4 rounded-2xl bg-accent text-white font-bold apple-button flex items-center justify-center gap-2 text-foreground">
            <Home size={20} />
            返回首頁
          </button>
        </Link>
      </main>
    );
  }

  // Active Quiz View
  return (
    <main className="min-h-screen p-6 max-w-md mx-auto flex flex-col relative overflow-hidden text-foreground">
      {/* Cheat Warning Modal */}
      {showCheatWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs p-6 rounded-[28px] glass-morphism border border-white/10 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-foreground">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">警告：請勿切換視窗！</h3>
            <p className="text-sm opacity-60 mb-4">維持考場紀律。您已切換視窗 {cheatAttempts} 次。</p>
            <p className="text-xs text-red-400">超過 3 次將強制交卷！</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-8 z-10">
        <Link href="/">
          <div className="p-2 rounded-full glass-morphism apple-button cursor-pointer">
            <ChevronLeft size={24} className="text-foreground" />
          </div>
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-40 font-medium">隨機測驗</span>
          <span className="font-bold text-lg">{currentIndex + 1} / {questions.length}</span>
          <span className={`text-xs font-mono mt-1 ${timeLeft < 300 ? 'text-red-500 animate-pulse font-bold' : 'opacity-60 text-foreground'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-12">
        <div 
          className="h-full bg-accent transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div key={currentIndex} className="flex-1 animate-slide-in">
        <h2 className="text-2xl font-bold leading-tight mb-10">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isFinished || showCheatWarning || isSubmitting} // 提交中禁用選取
              className={`w-full p-5 rounded-2xl text-left transition-all duration-200 apple-button ${
                selectedAnswers[currentIndex] === idx
                  ? 'bg-accent text-white shadow-lg shadow-accent/20 ring-2 ring-accent ring-offset-4 ring-offset-background'
                  : 'glass-morphism border-transparent hover:border-accent/30 text-foreground'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {selectedAnswers[currentIndex] === idx && <CheckCircle2 size={20} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Button */}
      <div className="mt-12 mb-8">
        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentIndex] === null || isFinished || showCheatWarning || isSubmitting}
          className={`w-full py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
            (selectedAnswers[currentIndex] === null || isFinished || showCheatWarning || isSubmitting)
              ? 'opacity-20 bg-secondary cursor-not-allowed text-foreground'
              : 'bg-foreground text-background apple-button shadow-xl shadow-black/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              計算成績中...
            </>
          ) : (
            <>
              {currentIndex === questions.length - 1 ? '交卷' : '下一題'}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </main>
  );
}
