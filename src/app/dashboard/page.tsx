import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      trips: {
        orderBy: { startDate: 'desc' },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      },
      pendingBookings: {
        where: { status: 'PENDING' },
        take: 5,
      }
    }
  })

  if (!user) {
    redirect('/')
  }

  const now = new Date()
  const upcomingTrips = user.trips.filter(trip => new Date(trip.endDate) >= now)
  const pastTrips = user.trips.filter(trip => new Date(trip.endDate) < now)
  const pendingCount = user.pendingBookings.length

  return (
    <DashboardLayout>
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
              {upcomingTrips.map((trip) => (
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
              {pastTrips.map((trip) => (
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
