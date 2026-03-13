import "./globals.css";

// 定義視窗設定，禁止縮放和滾動
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// 網站元資料
export const metadata = {
  title: "永續發展證照刷題", // 網站標題
  description: "精選題目，助您輕鬆考取永續發展相關證照", // 網站描述
};

// Root Layout 函式元件
export default function RootLayout({ children }) {
  return (
    // 設定語言為繁體中文 (zh-TW) 並預設為深色模式 (dark)
    <html lang="zh-TW" className="dark">
      {/* body 標籤：移除預設選取效果的背景色，並隱藏水平滾動條 */}
      <body className="antialiased selection:bg-accent/30 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
