'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, CheckCircle2, Home, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getWrongQuestionsFromCloud, removeQuestionFromCloud, clearWrongBookFromCloud } from '@/../utils/storage';
import allQuestionsData from '@/../questions.json';

import AuthGuard from '@/components/AuthGuard';

export default function WrongBookPage() {
  return (
    <AuthGuard>
      <WrongBookContent />
    </AuthGuard>
  );
}

function WrongBookContent() {
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    async function loadWrongQuestions() {
      setLoading(true);
      const wrongQuestionsWithCount = await getWrongQuestionsFromCloud();
      
      // Match IDs with full question data from questions.json and add error_count
      const matchedQuestions = allQuestionsData.map(q => {
        const wrongQ = wrongQuestionsWithCount.find(w => w.question_id === q.id);
        return wrongQ ? { ...q, error_count: wrongQ.error_count } : null;
      }).filter(Boolean);
      
      setWrongQuestions(matchedQuestions);
      setLoading(false);
    }

    loadWrongQuestions();
  }, []);

  const sortByErrorCount = () => {
    setWrongQuestions(prev => [...prev].sort((a, b) => b.error_count - a.error_count));
  };

  const handleRemove = async (id) => {
    await removeQuestionFromCloud(id);
    setWrongQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleClearAll = async () => {
    await clearWrongBookFromCloud();
    setWrongQuestions([]);
    setShowConfirmClear(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm opacity-60">正在讀取雲端錯題本...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto flex flex-col relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-8 z-10 text-foreground">
        <Link href="/">
          <div className="p-2 rounded-full glass-morphism apple-button cursor-pointer">
            <ChevronLeft size={24} />
          </div>
        </Link>
        <h1 className="text-xl font-bold">雲端錯題本</h1>
        <div className="flex gap-2">
          <button 
            onClick={sortByErrorCount}
            disabled={wrongQuestions.length === 0}
            className={`p-2 rounded-full glass-morphism apple-button ${wrongQuestions.length === 0 ? 'opacity-20' : ''}`}
            title="依錯誤次數排序"
          >
            <BookOpen size={24} />
          </button>
          <button 
            onClick={() => setShowConfirmClear(true)}
            disabled={wrongQuestions.length === 0}
            className={`p-2 rounded-full glass-morphism apple-button ${wrongQuestions.length === 0 ? 'opacity-20' : 'text-red-500'}`}
            title="清空錯題本"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-foreground">
          <BookOpen size={64} className="mb-4" />
          <p className="text-lg">雲端目前沒有錯題，太棒了！</p>
          <Link href="/quiz" className="mt-6">
            <button className="px-8 py-3 rounded-2xl bg-accent text-white font-bold apple-button">
              開始測驗
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6 mb-12 text-foreground">
          <p className="text-sm opacity-60 px-2">共有 {wrongQuestions.length} 題需要複習 (已同步至雲端)</p>
          {wrongQuestions.map((q) => (
            <div key={q.id} className="p-5 rounded-2xl glass-morphism border border-white/5 animate-fade-in relative group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-accent px-2 py-1 rounded-md bg-accent/10">ID: {q.id}</span>
                <span className="text-xs font-medium opacity-60">錯誤次數：{q.error_count || 1} 次</span>
                <button 
                  onClick={() => handleRemove(q.id)}
                  className="text-xs font-medium text-green-500 flex items-center gap-1 hover:scale-105 transition-transform"
                >
                  <CheckCircle2 size={14} />
                  我學會了
                </button>
              </div>
              <h2 className="text-lg font-bold mb-4 leading-tight">{q.question}</h2>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-green-500 font-medium">正確答案：{q.options.find(opt => opt.startsWith(q.answer)) || q.answer}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 text-sm leading-relaxed opacity-80 border border-white/5">
                <p className="font-bold mb-1 opacity-100">詳解：</p>
                {q.explanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-foreground">
          <div className="w-full max-w-xs p-6 rounded-[28px] glass-morphism border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">確定要清空嗎？</h3>
              <p className="text-sm opacity-60 mb-8">這項操作將從雲端資料庫中永久刪除所有錯題紀錄。</p>
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={handleClearAll}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold apple-button"
                >
                  確定清空
                </button>
                <button 
                  onClick={() => setShowConfirmClear(false)}
                  className="w-full py-4 rounded-2xl bg-white/5 font-bold apple-button"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer link back home */}
      <Link href="/" className="mb-8 mt-auto">
        <button className="w-full py-4 rounded-[24px] glass-morphism font-bold flex items-center justify-center gap-2 apple-button text-foreground">
          <Home size={20} />
          返回主選單
        </button>
      </Link>
    </main>
  );
}
