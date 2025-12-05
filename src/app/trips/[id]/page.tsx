import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import TripView from '@/components/Trip/TripView'
import { demoTrips } from '@/lib/demoData'

export default async function TripPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession()
  const isDemoMode = !session || !session.user

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
        },
        include: {
          bookings: {
            orderBy: [{ date: 'asc' }, { time: 'asc' }],
            include: {
              attachments: true
            }
          }
        }
      })

  if (!trip) {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout>
      <TripView trip={trip} isReadOnly={isDemoMode} />
    </DashboardLayout>
  )
}
