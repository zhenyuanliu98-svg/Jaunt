import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { findUserByEmail, findPendingBookingsByUserId, findTripsByUserId } from '@/lib/db'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import PendingBookingsList from '@/components/Booking/PendingBookingsList'
import { demoPendingBookings, demoTrips, demoUser } from '@/lib/demoData'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default async function PendingBookingsPage() {
  const session = await getServerSession()
  const isDemoMode = !session || !session.user

  const user = isDemoMode
    ? demoUser
    : await findUserByEmail(session.user.email!)

  if (!user) {
    redirect('/')
  }

  const pendingBookings = isDemoMode
    ? demoPendingBookings
    : await findPendingBookingsByUserId(user.id)

  const trips = isDemoMode
    ? demoTrips
    : await findTripsByUserId(user.id, 'desc')

  return (
    <DashboardLayout>
      {isDemoMode && (
        <Card className="bg-gradient-to-r from-indigo-500 to-blue-500 border-indigo-600 mb-6 shadow-lg">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-indigo-700">
                    Demo Mode
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Sign up to manage your bookings
                </h3>
                <p className="text-sm text-indigo-50">
                  In demo mode, booking actions are disabled. Create a free account to manage forwarded emails and organize your trips.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Link href="/" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all font-semibold"
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
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
