# 專案架構藍圖 (ESG 刷題網)

> **版本**：v1.0 (Phase 2 完工狀態)
> **技術堆疊**：Next.js (App Router) + Tailwind CSS + LocalStorage
> **UI 風格**：Apple 簡潔風、深色模式 (Dark Mode)、毛玻璃特效

## 📁 目錄結構說明

本專案採極簡架構，無後端資料庫，主要依賴前端元件與本地儲存。

*   `/app`: Next.js 頁面與路由核心。
    *   `/app/page.js`: 系統首頁。提供「隨機測驗」與「錯題本」入口。
    *   `/app/quiz/page.js`: 測驗主畫面。包含計時器、答題邏輯、交卷結算與檢討畫面。
    *   `/app/wrong-book/page.js`: 錯題本畫面。負責讀取 LocalStorage 並顯示錯題，支援移除功能。
*   `/public`: 靜態資源目錄。
    *   `/public/questions.json`: 核心題庫檔 (目前包含 40 題 ESG 考點)，供前端 fetch 讀取。
*   `/components`: (若有) 共用 UI 元件庫（如自訂按鈕、Modal 警告窗等）。

## ⚙️ 核心邏輯機制

1.  **資料流**：使用者進入 `/quiz` 後，透過 `fetch('/questions.json')` 載入題庫，並隨機抽取題目。
2.  **狀態持久化**：交卷時，將答錯的題目陣列序列化後存入 `localStorage.getItem('esg_wrong_questions')`。
3.  **防作弊機制**：於 `/quiz` 頁面掛載 `visibilitychange` 事件監聽器，偵測切換視窗行為並給予警告。

## 🛡️ 軟體工程實踐原則 (AI 開發鐵律)

為了避免 Vibe Coding 產生義大利麵條程式碼 (Spaghetti Code)，所有 AI 代理人在開發時必須嚴格遵守以下原則：

1.  **關注點分離 (Separation of Concerns)**
    *   **UI 與邏輯分離**：所有的 React Component (`.jsx` 或 `.tsx`) 僅負責「畫面渲染」與「UI 狀態」。
    *   **邏輯抽離**：所有涉及 API 呼叫、複雜計算（如計分演算法、資料洗牌）、防作弊偵測等業務邏輯，**必須**抽離到 `/utils` 或 `/services` 目錄下的純函式 (Pure Functions) 中。
2.  **單一職責原則 (SRP) 與模組化**
    *   單一檔案程式碼長度若超過 300 行，必須強制拆分為更小的子元件。
    *   跨頁面共用的 UI 元素（如按鈕、輸入框、Modal）必須集中管理於 `/components/common`。
3.  **錯誤處理與防護網 (Error Handling)**
    *   所有的非同步操作 (如 fetch, Supabase SDK) 必須使用 `try...catch` 包覆。
    *   發生錯誤時，不得出現白畫面，必須在 UI 渲染友善的錯誤提示。

## 🚀 未來擴充準備 (Phase 3)
預計將引入 Supabase 進行資料庫解耦與 JWT 身分驗證，屆時 `/app` 內將新增 `api/` 路由處理 Server-side 邏輯。
