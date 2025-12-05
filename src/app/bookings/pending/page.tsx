import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import PendingBookingsList from '@/components/Booking/PendingBookingsList'

export default async function PendingBookingsPage() {
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

  const pendingBookings = await prisma.pendingBooking.findMany({
    where: {
      userId: user.id,
      status: 'PENDING'
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' }
  })

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Pending Bookings
        </h1>
        <p className="text-gray-600 mb-8">
          Review bookings extracted from your forwarded emails
        </p>
        <PendingBookingsList
          pendingBookings={pendingBookings}
          trips={trips}
        />
      </div>
    </DashboardLayout>
  )
}
