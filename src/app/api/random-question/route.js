import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
try {
// 這裡我們只用 public 的 key，不需要 admin 權限，因為只是要讀取題目
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 因為我們要撈隨機一題，Supabase 沒有內建 RAND() 函數，
// 最簡單暴力的方法是撈出所有題目的 ID，然後隨機選一個
const { data: ids, error: idError } = await supabase
.from('questions')
.select('id')

if (idError) throw idError

if (!ids || ids.length === 0) {
return NextResponse.json({ error: 'No questions found' }, { status: 404 })
}

// 隨機選一個 ID
const randomId = ids[Math.floor(Math.random() * ids.length)].id

// 用這個 ID 去撈完整的題目資訊
const { data: question, error: qError } = await supabase
.from('questions')
.select('id, question, options, category, explanation')
.eq('id', randomId)
.single()

if (qError) throw qError

return NextResponse.json({
success: true,
data: question
})

} catch (error) {
console.error('API Error:', error)
return NextResponse.json({ error: error.message }, { status: 500 })
}
}