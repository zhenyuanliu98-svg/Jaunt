import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getUserWithTripsAndBookings } from '@/lib/db'
import { demoUser } from '@/lib/demoData'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession()

  const isDemoMode = !session || !session.user

  const user = isDemoMode
    ? demoUser
    : await getUserWithTripsAndBookings(session.user.email!)

  if (!user) {
    redirect('/')
  }

  const now = new Date()
  const upcomingTrips = user.trips.filter((trip: any) => new Date(trip.endDate) >= now)
  const pastTrips = user.trips.filter((trip: any) => new Date(trip.endDate) < now)
  const pendingCount = user.pendingBookings.length

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
                  You&apos;re exploring Jaunt
                </h3>
                <p className="text-sm text-indigo-50">
                  Create a free account to save your trips, organize bookings, and access all features.
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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name || 'traveler'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your trips and bookings
            </p>
          </div>
          <Link href="/trips/new">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>

        {/* Forwarding Email Card */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">Your Forwarding Email</CardTitle>
                <CardDescription className="mt-2">
                  Forward booking confirmations to this address to automatically add them to your trips
                </CardDescription>
                <div className="mt-4 flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  <code className="bg-white px-3 py-1.5 rounded-md text-indigo-600 font-mono text-sm border border-indigo-200">
                    {user.uniqueForwardEmail}
                  </code>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pending Bookings Notification */}
        {pendingCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900">
                {pendingCount} booking{pendingCount > 1 ? 's' : ''} to review
              </CardTitle>
              <CardDescription className="text-orange-700">
                You have pending bookings from forwarded emails
              </CardDescription>
              <div className="mt-4">
                <Link href="/bookings/pending">
                  <Button variant="primary" size="sm">
                    Review Now
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Upcoming Trips */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Trips</h2>
          {upcomingTrips.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No upcoming trips yet</p>
                <Link href="/trips/new">
                  <Button>Create Your First Trip</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTrips.map((trip: any) => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{trip.name}</CardTitle>
                      <CardDescription>{trip.destination}</CardDescription>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          {new Date(trip.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {' - '}
                          {new Date(trip.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {trip._count.bookings} booking{trip._count.bookings !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Past Trips */}
        {pastTrips.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Trips</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastTrips.map((trip: any) => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
                    <CardHeader>
                      <CardTitle className="text-lg">{trip.name}</CardTitle>
                      <CardDescription>{trip.destination}</CardDescription>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          {new Date(trip.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {' - '}
                          {new Date(trip.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {trip._count.bookings} booking{trip._count.bookings !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
