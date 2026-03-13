CREATE TABLE public.questions (
  id int8 NOT NULL,
  category text NULL, -- 例如: E, S, G, 或混合類
  question text NOT NULL,
  options jsonb NOT NULL, -- 儲存選項陣列，例如 ["A. Option 1", "B. Option 2"]
  answer text NOT NULL, -- 儲存正確答案的字母，例如 "A"
  explanation text NULL, -- 詳解
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id)
);

-- 啟用 Row Level Security (RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 創建策略以允許匿名讀取（如果這是公開題庫）
-- 注意：對於公開讀取的題庫，這表示所有人都可以讀取。
CREATE POLICY "Enable read access for all users" ON public.questions
FOR SELECT USING (TRUE);

-- 如果需要插入資料，可以創建一個 INSERT 策略（例如，只允許 admin 角色）
-- CREATE POLICY "Enable insert for admin users only" ON public.questions
-- FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
