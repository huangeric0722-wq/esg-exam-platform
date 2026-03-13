"use client"; // 標記為客戶端元件

import { useState } from "react";
import { ChevronLeft, Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2 } from "lucide-react"; // 匯入 Lucide Icons
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateAuthForm } from "@/../utils/authValidation"; // 匯入前端表單驗證工具
import { supabase } from "@/../utils/supabase"; // 匯入 Supabase 客戶端實例
import { getWrongQuestionsFromStorage } from "@/../utils/storage"; // 從 localStorage 獲取錯題 (雖然此頁面未直接調用，為統一風格保留)

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false); // 切換註冊/登入模式
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // 表單驗證錯誤訊息
  const [loading, setLoading] = useState(false); // 提交操作中的載入狀態
  const [message, setMessage] = useState(null); // 系統提示訊息
  const router = useRouter(); // 路由器實例
  
  // 處理表單提交邏輯 (登入或註冊)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});
    setLoading(true);

    // 進行前端驗證
    const validation = validateAuthForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    let authError = null;

    if (isRegistering) {
      // 執行註冊
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      authError = error;
    } else {
      // 執行登入
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      authError = error;
    }

    if (authError) {
      // 認證失敗
      setMessage({ type: "error", text: authError.message });
      setLoading(false);
    } else {
      // 認證成功
      setMessage({ type: "success", text: isRegistering ? "註冊成功！請登入。" : "登入成功！" });
      setEmail("");
      setPassword("");
      if (!isRegistering) {
        router.push("/"); // 登入成功後導航至首頁
      }
    }
    setLoading(false);
  };

  // 切換登入/註冊模式並清除狀態
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
    setMessage(null);
    setEmail("");
    setPassword("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background animate-fade-in relative overflow-hidden">
      {/* 背景裝飾 - 毛玻璃特效 */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm rounded-[28px] glass-morphism border border-white/10 p-8 shadow-2xl backdrop-blur-md z-10">
        <div className="flex justify-between items-center mb-10">
          {/* 返回首頁按鈕 */}
          <Link href="/">
            <div className="p-2 rounded-full glass-morphism apple-button cursor-pointer">
              <ChevronLeft size={24} className="text-foreground" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{isRegistering ? "註冊" : "登入"}</h1>
          <div className="w-10 h-10" /> {/* 保持空間平衡 */}
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-xl text-sm ${message.type === "error" ? "bg-red-900/20 text-red-400 border border-red-500/30" : "bg-green-900/20 text-green-400 border border-green-500/30"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email 輸入欄 */}
          <div className="space-y-1">
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground opacity-40" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 ${errors.email ? "border-red-500/50 ring-red-500/20" : "border-white/10"}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1 px-1">
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>

          {/* Password 輸入欄 */}
          <div className="space-y-1">
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground opacity-40" />
              <input
                type="password"
                placeholder="密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 ${errors.password ? "border-red-500/50 ring-red-500/20" : "border-white/10"}`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1 px-1">
                <AlertCircle size={12} /> {errors.password}
              </p>
            )}
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-2 rounded-xl bg-accent text-white font-bold text-lg apple-button shadow-lg shadow-accent/20 flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isRegistering ? "建立帳號" : "登入系統")}
            {!loading && (isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />)}
          </button>
        </form>

        <div className="mt-8 text-center">
          {/* 切換註冊/登入按鈕 */}
          <button
            onClick={toggleMode}
            disabled={loading}
            className="text-sm text-accent font-medium hover:underline apple-button"
          >
            {isRegistering ? "已有帳號？前往登入" : "還沒有帳號？立即註冊"}
          </button>
        </div>
      </div>
    </main>
  );
}
