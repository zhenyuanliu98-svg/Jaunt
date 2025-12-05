import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { getSupabaseClient } from '@/lib/supabase'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import TripView from '@/components/Trip/TripView'
import { demoTrips } from '@/lib/demoData'

export default async function TripPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession()
  const isDemoMode = !session || !session.user
  const supabase = getSupabaseClient()

  const user = isDemoMode
    ? null
    : await prisma.user.findUnique({
        where: { email: session.user.email! }
      })

  if (!isDemoMode && !user) {
    redirect('/')
  }

  const trip = isDemoMode
    ? demoTrips.find((demoTrip) => demoTrip.id === params.id) ?? demoTrips[0]
    : await prisma.trip.findFirst({
        where: {
          id: params.id,
          userId: user!.id
        }
      })

  if (!trip) {
    redirect('/dashboard')
  }

  const { data: bookings } = isDemoMode
    ? { data: trip.bookings }
    : await supabase
        .from('bookings')
        .select('*, attachments(*)')
        .eq('tripId', trip.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

  return (
    <DashboardLayout>
      <TripView trip={{ ...trip, bookings: bookings || [] }} isReadOnly={isDemoMode} />
    </DashboardLayout>
  )
}
