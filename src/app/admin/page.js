"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/../utils/supabase';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, Loader2, Database } from 'lucide-react';

// 管理員 Email 名單 (實務上應從 ENV 或 DB 讀取)
const ADMIN_EMAILS = [
    'eric@admin.com' // 假設這是測試用 Email
];

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // 題庫上傳相關狀態
    const [jsonInput, setJsonInput] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            
            if (user && ADMIN_EMAILS.includes(user.email)) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // 驗證 JSON 內容
    const handleVerify = () => {
        setValidationError('');
        setParsedData(null);
        setUploadSuccess(false);

        try {
            if (!jsonInput.trim()) {
                throw new Error('請輸入 JSON 內容');
            }

            const data = JSON.parse(jsonInput);

            if (!Array.isArray(data)) {
                throw new Error('JSON 格式錯誤：必須是一個陣列 []');
            }

            // 檢查欄位：question, options, answer, explanation, category
            const requiredFields = ['question', 'options', 'answer', 'explanation', 'category'];
            
            data.forEach((item, index) => {
                requiredFields.forEach(field => {
                    if (item[field] === undefined || item[field] === null) {
                        throw new Error(`第 ${index + 1} 題缺少必要欄位: ${field}`);
                    }
                });

                if (!Array.isArray(item.options) || item.options.length < 2) {
                    throw new Error(`第 ${index + 1} 題的 options 必須是陣列且至少有 2 個選項`);
                }
            });

            setParsedData(data);
        } catch (err) {
            setValidationError(err.message);
        }
    };

    // 寫入 DB
    const handleUpload = async () => {
        if (!parsedData) return;
        
        setIsSubmitting(true);
        setValidationError('');

        try {
            const { error } = await supabase
                .from('questions')
                .insert(parsedData);

            if (error) throw error;

            setUploadSuccess(true);
            setJsonInput('');
            setParsedData(null);
        } catch (err) {
            setValidationError(`上傳失敗: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </main>
        );
    }

    if (!isAdmin) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
                <div className="glass-morphism p-8 rounded-[24px] flex flex-col items-center gap-4 text-center max-w-sm">
                    <ShieldCheck size={48} className="text-red-500 opacity-80" />
                    <h1 className="text-xl font-bold">無權限存取</h1>
                    <p className="text-sm opacity-60">此頁面僅供管理員使用，請回首頁。</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="mt-4 px-6 py-2 bg-accent text-white rounded-full apple-button font-medium"
                    >
                        回首頁
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center p-6 max-w-2xl mx-auto animate-fade-in text-foreground">
            <Navbar />

            <div className="w-full mt-12 mb-8 flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                    <Database className="text-accent" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">管理員後台</h1>
                    <p className="text-sm opacity-60">題庫批次上傳與維護</p>
                </div>
            </div>

            <div className="w-full space-y-6 z-10">
                {/* 輸入區塊 */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium opacity-80 flex items-center gap-2">
                        <Upload size={16} /> 貼上題庫 JSON (Array)
                    </label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"question": "...", "options": ["A", "B"], "answer": 0, "explanation": "...", "category": "ESG"}]'
                        className="w-full h-64 p-4 rounded-2xl glass-morphism border-none focus:ring-2 focus:ring-accent outline-none font-mono text-sm resize-none"
                    />
                </div>

                {/* 操作按鈕 */}
                <div className="flex gap-4">
                    <button
                        onClick={handleVerify}
                        disabled={isSubmitting}
                        className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-semibold apple-button hover:bg-secondary/80 flex items-center justify-center gap-2"
                    >
                        驗證 JSON 格式
                    </button>
                    {parsedData && (
                        <button
                            onClick={handleUpload}
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-accent text-white rounded-2xl font-semibold apple-button shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            確認寫入 DB ({parsedData.length} 題)
                        </button>
                    )}
                </div>

                {/* 訊息回饋 */}
                {validationError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm">{validationError}</p>
                    </div>
                )}

                {uploadSuccess && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-start gap-3">
                        <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm">資料已成功寫入資料庫！</p>
                    </div>
                )}

                {/* 預覽區塊 */}
                {parsedData && (
                    <div className="mt-8 space-y-4">
                        <h3 className="text-sm font-medium opacity-60">匯入預覽 (前 3 題)</h3>
                        {parsedData.slice(0, 3).map((q, i) => (
                            <div key={i} className="p-4 rounded-2xl glass-morphism border border-white/5 space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-md">{q.category}</span>
                                    <span className="text-xs opacity-40">索引 {i}</span>
                                </div>
                                <p className="font-medium text-sm">{q.question}</p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} className={`text-xs p-2 rounded-lg ${oi === q.answer ? 'bg-accent/10 border border-accent/20 text-accent' : 'bg-secondary/50 opacity-60'}`}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full mt-12 mb-8 text-center opacity-40 text-xs">
                <p>管理員專用介面 • 請謹慎操作</p>
            </div>
        </main>
    );
}
