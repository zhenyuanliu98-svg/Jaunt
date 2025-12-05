import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import TripView from '@/components/Trip/TripView'

export default async function TripPage({ params }: { params: { id: string } }) {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    redirect('/')
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: params.id,
      userId: user.id
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
      <TripView trip={trip} />
    </DashboardLayout>
  )
}
