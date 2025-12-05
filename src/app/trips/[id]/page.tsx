import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { findUserByEmail, findTripById, getBookingsForTrip } from '@/lib/db'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import TripView from '@/components/Trip/TripView'
import { demoTrips } from '@/lib/demoData'

export default async function TripPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession()
  const isDemoMode = !session || !session.user

  const user = isDemoMode
    ? null
    : await findUserByEmail(session.user.email!)

  if (!isDemoMode && !user) {
    redirect('/')
  }

  const trip = isDemoMode
    ? demoTrips.find((demoTrip) => demoTrip.id === params.id) ?? demoTrips[0]
    : await findTripById(params.id, user!.id)

  if (!trip) {
    redirect('/dashboard')
  }

  const bookings = isDemoMode
    ? trip.bookings
    : await getBookingsForTrip(trip.id)

  return (
    <DashboardLayout>
      <TripView trip={{ ...trip, bookings: bookings || [] }} isReadOnly={isDemoMode} />
    </DashboardLayout>
  )
}
