// 匯入 Supabase SSR 函式庫以在瀏覽器端創建客戶端實例
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // 環境變數缺失時報警
  console.error('Supabase URL or Anon Key is missing. Please check your .env.local file.')
}

// 創建瀏覽器端的 Supabase 客戶端實例
export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

// 預設導出用於 Client Components 的實例
export const supabase = createClient()
