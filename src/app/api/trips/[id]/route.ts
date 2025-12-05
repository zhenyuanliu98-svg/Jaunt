import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const ownerId = searchParams.get('userId')
  const supabase = getSupabaseClient()

  if (!ownerId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('userId', ownerId)
    .single()

  if (fetchError || !trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  await prisma.pendingBooking.deleteMany({ where: { tripId: id } })
  await prisma.booking.deleteMany({ where: { tripId: id } })
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('userId', ownerId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
