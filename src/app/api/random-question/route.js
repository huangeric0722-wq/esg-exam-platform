import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
try {
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 1. 撈出所有題目的 ID
const { data: ids, error: idError } = await supabase
.from('questions')
.select('id')

if (idError) throw idError
if (!ids || ids.length === 0) {
return NextResponse.json({ error: 'No questions found' }, { status: 404 })
}

// 2. 將 ID 陣列洗牌 (Shuffle) 並取出前 3 個
const shuffledIds = ids.sort(() => 0.5 - Math.random()).slice(0, 3).map(i => i.id)

// 3. 用這 3 個 ID 去撈完整的題目資訊 (記得加上 answer!)
const { data: questions, error: qError } = await supabase
.from('questions')
.select('id, question, options, answer, category, explanation')
.in('id', shuffledIds)

if (qError) throw qError

// 回傳這 3 題的陣列
return NextResponse.json({
success: true,
data: questions // 這裡的 data 現在是一個 Array
})

} catch (error) {
console.error('API Error:', error)
return NextResponse.json({ error: error.message }, { status: 500 })
}
}