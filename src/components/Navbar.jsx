"use client";

import { useState, useEffect } from 'react';
import { User, LogOut, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/../utils/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 獲取初始使用者資訊
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 監聽 Auth 狀態變更
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="w-full flex justify-between items-center py-4 px-2 z-10">
      <Link href="/">
        <h1 className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity cursor-pointer">
          永續發展證照
        </h1>
      </Link>
      
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin opacity-40" />
        ) : user ? (
          <>
            <span className="text-xs font-medium opacity-60 hidden sm:inline-block">
              Hi, {user.email}
            </span>
            <button 
              onClick={handleSignOut} 
              className="p-2 rounded-full glass-morphism apple-button transition-all duration-200 active:scale-95"
              title="登出"
            >
              <LogOut size={18} className="text-red-400" />
            </button>
          </>
        ) : (
          <Link href="/login" className="cursor-pointer">
            <div className="p-2 rounded-full glass-morphism apple-button" title="登入">
              <User size={18} />
            </div>
          </Link>
        )}
        
        <button className="p-2 rounded-full glass-morphism apple-button" title="設定">
          <Settings size={18} />
        </button>
      </div>
    </nav>
  );
}
