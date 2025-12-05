import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import PendingBookingsList from '@/components/Booking/PendingBookingsList'
import { demoPendingBookings, demoTrips, demoUser } from '@/lib/demoData'

export default async function PendingBookingsPage() {
  const session = await getServerSession()
  const isDemoMode = !session || !session.user

  const user = isDemoMode
    ? demoUser
    : await prisma.user.findUnique({
        where: { email: session.user.email! }
      })

  if (!user) {
    redirect('/')
  }

  const pendingBookings = isDemoMode
    ? demoPendingBookings
    : await prisma.pendingBooking.findMany({
        where: {
          userId: user.id,
          status: 'PENDING'
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

  const trips = isDemoMode
    ? demoTrips
    : await prisma.trip.findMany({
        where: { userId: user.id },
        orderBy: { startDate: 'desc' }
      })

  return (
    <DashboardLayout>
      {isDemoMode && (
        <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Demo mode: booking review actions are disabled. Sign in to manage forwarded emails.
        </div>
      )}
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
          isReadOnly={isDemoMode}
        />
      </div>
    </DashboardLayout>
  )
}
