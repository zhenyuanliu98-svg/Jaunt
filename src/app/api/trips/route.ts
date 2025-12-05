import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const { count } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)

  return NextResponse.json({ count })
}
