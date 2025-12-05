import { notFound } from 'next/navigation'
import { getTripWithBookingsByShareToken } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import BookingCard from '@/components/Booking/BookingCard'
import { Calendar, Plane } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function SharedTripPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const trip = await getTripWithBookingsByShareToken(params.token)

  if (!trip) {
    notFound()
  }

  // Group bookings by date
  const bookingsByDate = trip.bookings.reduce((acc: any, booking: any) => {
    const dateKey = format(booking.date, 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(booking)
    return acc
  }, {})

  const sortedDates = Object.keys(bookingsByDate).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Jaunt</span>
            </div>
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Create your own itinerary
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Trip Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl">{trip.name}</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {trip.destination}
                  </CardDescription>
                  <div className="flex items-center mt-4 text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>
                      {format(trip.startDate, 'MMM dd, yyyy')} - {format(trip.endDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Shared Trip Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📋 You&apos;re viewing a shared itinerary. This is a read-only view.
            </p>
          </div>

          {/* Timeline View */}
          {trip.bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No bookings in this trip yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {format(new Date(dateKey), 'EEEE, MMMM dd, yyyy')}
                  </h3>
                  <div className="space-y-4">
                    {bookingsByDate[dateKey].map((booking: any) => (
                      <BookingCard key={booking.id} booking={booking} tripId={trip.id} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
