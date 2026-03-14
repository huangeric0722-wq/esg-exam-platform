# ESG 刷題網：開發待辦與狀態同步 (TODO & MEMORY)

> **當前階段**：進入 Phase 4 (進階功能擴充與數據深度化)
> **狀態摘要**：已完成 Phase 3 (Supabase 雲端化、登入系統、錯題本雲端化、今日進度 Dashboard)。目前準備展開 Phase 4，針對使用者體驗與全域統計進行升級。

## ✅ 已完成任務 (Phase 1 ~ Phase 3)
- [x] 建立 Next.js + Tailwind CSS 基礎專案框架與首頁 UI。
- [x] 實作 `/quiz` 隨機測驗邏輯與 90 分鐘倒數防作弊機制。
- [x] 擴充題庫至 40 題 ESG 核心考點。
- [x] 完成架構重整 (Refactoring)，邏輯抽離至 `/utils`。
- [x] 串接 Supabase Auth (Email 註冊/登入)。
- [x] 將題庫與錯題本遷移至 Supabase PostgreSQL，並實作 RLS (Row Level Security)。
- [x] 實作「今日進度 Dashboard」(計算今日答對/答錯題數)。
- [x] 完成 Zeabur 一鍵部署與 GitHub CI/CD。

## 🎯 待辦任務 (Phase 4 進階功能擴充) - 進行中
透過 Cursor + Flash 降維打擊策略推進：

- [ ] **Task 4.1：使用者體驗優化 (UI/UX)**
  - 需求：在 Navbar 顯示當前使用者的 Email。
  - 動作：修改 `Navbar.jsx`，呼叫 `supabase.auth.getUser()`。
- [ ] **Task 4.2：個人錯題數據深度化 (錯題計數器)**
  - 需求：讓使用者知道自己對某題「錯了幾次」。
  - 動作：修改 `wrong_questions` 表新增 `error_count` 欄位。改寫錯題寫入邏輯，並在錯題本 UI 加上計數器與排序。
- [ ] **Task 4.3：全域共用統計 (魔王題庫)**
  - 需求：找出全站使用者最常錯的 TOP 10 題目。
  - 動作：在 Supabase 建立 `global_wrong_stats` View。新增 `/common-mistakes` 頁面顯示排行榜。
- [ ] **Task 4.4：後台管理與題目擴充 (Admin Role)**
  - 需求：特定帳號可透過網頁批次上傳 JSON 題庫。
  - 動作：建立 `/admin` 頁面，綁定指定 Admin Email 權限，實作大型 textarea 寫入 Supabase。

## 📝 備註與限制
- 開發時請嚴格遵守 `ARCHITECTURE.md` 的既有風格。
- 每次呼叫 AI 前，務必使用 MDDD 壓縮法 (指定讀取特定檔案與 TODO)，嚴禁無差別全域掃描。
