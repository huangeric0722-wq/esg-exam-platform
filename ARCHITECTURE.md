# 專案架構藍圖 (ESG 刷題網)

> **版本**：v2.0 (Phase 3 雲端化完工，進入 Phase 4)
> **技術堆疊**：Next.js (App Router) + Tailwind CSS + Supabase (PostgreSQL & Auth)
> **UI 風格**：Apple 簡潔風、深色模式 (Dark Mode)、毛玻璃特效

## 📁 目錄結構說明

本專案採前後端分離架構，以 Next.js 作為前端與路由，Supabase 作為 Backend-as-a-Service (BaaS) 處理資料庫與會員驗證。

*   `/app`: Next.js 頁面與路由核心。
    *   `/app/page.js`: 系統首頁。提供登入/註冊入口，登入後顯示今日進度 Dashboard。
    *   `/app/login/page.js`: 登入與註冊畫面 (連接 Supabase Auth)。
    *   `/app/quiz/page.js`: 測驗主畫面。包含計時器、防作弊、並從 Supabase 讀取題目。
    *   `/app/wrong-book/page.js`: 錯題本畫面。讀取 Supabase `wrong_questions` 表格並顯示。
*   `/utils` 或 `/services`: 邏輯與 API 封裝。
    *   `/utils/supabase.js`: Supabase 客戶端實例與連線設定。
*   `/components`: (若有) 共用 UI 元件庫（如 Navbar 導覽列、Modal 警告窗等）。

## ⚙️ 核心邏輯機制

1.  **身分驗證 (Auth)**：透過 Supabase Auth 進行 Email 註冊/登入。未登入者無法存取 `/quiz` 與 `/wrong-book` (透過 Middleware 或 Client-side Guard 攔截)。
2.  **資料流 (Database)**：
    *   題庫：從 Supabase 的 `questions` 表格動態讀取。
    *   錯題：交卷時，將答錯的題目寫入 Supabase 的 `wrong_questions` 表格，並綁定當前使用者的 `user_id`。
3.  **安全性 (RLS)**：Supabase 資料庫已開啟 Row Level Security (RLS)，確保使用者只能看見與修改自己的錯題紀錄。
4.  **防作弊機制**：於 `/quiz` 頁面掛載 `visibilitychange` 事件監聽器，偵測切換視窗行為並給予警告。

## 🛡️ 軟體工程實踐原則 (AI 開發鐵律)

為了避免 Vibe Coding 產生義大利麵條程式碼 (Spaghetti Code)，所有 AI 代理人在開發時必須嚴格遵守以下原則：

1.  **關注點分離 (Separation of Concerns)**
    *   **UI 與邏輯分離**：所有的 React Component (`.jsx` 或 `.tsx`) 僅負責「畫面渲染」與「UI 狀態」。
    *   **邏輯抽離**：所有涉及 API 呼叫、複雜計算（如計分演算法、資料庫讀寫）等業務邏輯，**必須**抽離到純函式 (Pure Functions) 中。
2.  **單一職責原則 (SRP) 與模組化**
    *   單一檔案程式碼長度若超過 300 行，必須強制拆分為更小的子元件。
3.  **錯誤處理與防護網 (Error Handling)**
    *   所有的非同步操作 (如 Supabase SDK) 必須使用 `try...catch` 包覆。
    *   發生錯誤時，不得出現白畫面，必須在 UI 渲染友善的錯誤提示 (如 Toast 或 Alert)。