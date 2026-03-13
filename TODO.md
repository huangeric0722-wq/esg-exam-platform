# ESG 刷題網：開發待辦與狀態同步 (TODO & MEMORY)

> **當前階段**：進入 Phase 3 (多人模式與雲端化)
> **狀態摘要**：已完成單機版 MVP 並成功驗證 MDDD 壓縮法。目前 `/login` 頁面 UI 已建立，準備接軌 Supabase 資料庫與會員系統。

## ✅ 已完成任務 (Phase 1 & 2 & 3.3前半段)
- [x] 建立 Next.js + Tailwind CSS 基礎專案框架。
- [x] 完成首頁 UI (深色模式、毛玻璃特效)。
- [x] 實作 `/quiz` 隨機測驗邏輯 (讀取 `/public/questions.json`)。
- [x] 擴充題庫至 40 題 ESG 核心考點。
- [x] 修復答案字串比對 Bug (A !== A.選項)。
- [x] 實作 LocalStorage 錯題本機制 (`/wrong-book` 頁面，含刪除與清空功能)。
- [x] 新增 90 分鐘倒數計時器與防作弊機制 (視窗切換偵測)。
- [x] **[MDDD 實戰]** 建立 `/login` 頁面靜態 UI 表單 (完成 Task 3.3 前半段)。

## 🎯 待辦任務 (Phase 3 雲端化) - 明晚 (3/11) 預定進度
透過 Cursor Pro 或 Roo Code 繼續推進：

- [x] **Task 3.0：軟工架構重整 (Refactoring) - Quiz**
  - 需求：目前程式碼前後端與邏輯混雜，需導入軟工實踐。
  - 動作：已完成 `/quiz` 邏輯抽離 (`quizLogic.js`, `antiCheat.js`)。
- [ ] **Task 3.0.1：軟工架構重整 (Refactoring) - WrongBook & Login**
  - 需求：將錯題本的 LocalStorage 操作邏輯與登入表單的驗證邏輯抽離。
  - 動作：建立 `utils/storage.js` 或相關 service 處理資料讀寫，讓 UI 元件保持純淨。
- [ ] **Task 3.1：資料庫基礎建設 (Supabase)**

  - 需求：使用 Supabase 作為 Backend-as-a-Service。
  - 動作：Eric 需先至 Supabase 建立專案取得 `URL` 與 `anon key`。之後請 AI 安裝 SDK (`@supabase/supabase-js`) 並建立 `utils/supabase.js` 連線設定檔。
- [ ] **Task 3.2：雲端題庫遷移**
  - 需求：將目前的 `questions.json` 搬移至 Supabase 的 PostgreSQL 資料庫中。
  - 動作：建立 `questions` 資料表，並改寫 `/quiz` 的 fetch 邏輯，改由呼叫 Supabase SDK 讀取題目。
- [ ] **Task 3.3：純 Email 登入系統 (Auth 串接)**
  - 需求：為推廣至資訊部內部使用，**僅需實作 Email + 密碼 的註冊與登入**，不需第三方登入。
  - 動作：將目前的 `/login` 靜態介面串接 Supabase Auth (`signUp` & `signInWithPassword`)。並使用 Middleware 保護測驗與錯題本路由，未登入者導回首頁。
- [ ] **Task 3.4：雲端個人錯題本**
  - 需求：將原本存放在 LocalStorage 的錯題紀錄，改為存入 Supabase 資料庫。
  - 動作：建立 `wrong_questions` 資料表，並使用 `user_id` 作為 Foreign Key 綁定，確保每個登入者只看得到自己的錯題。

## 📝 備註與限制
- 開發時請嚴格遵守 `ARCHITECTURE.md` 的既有風格。
- 每次呼叫 AI 前，務必使用 MDDD 壓縮法 (指定讀取特定檔案與 TODO)，嚴禁無差別全域掃描。
