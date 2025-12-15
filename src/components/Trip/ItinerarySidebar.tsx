'use client'

import { format, eachDayOfInterval, differenceInDays } from 'date-fns'
import { Calendar, MapPin, Plane, Home, UtensilsCrossed, Sparkles, ChevronRight, Coffee, Moon, Sun, Sunset } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { getBookingTypeLabel } from '@/components/BookingTypeIcon'

interface ItinerarySidebarProps {
  trip: any
  bookingsByDate: Record<string, any>
  onDateClick?: (dateKey: string) => void
}

export default function ItinerarySidebar({ trip, bookingsByDate, onDateClick }: ItinerarySidebarProps) {
  const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
  const allDates = eachDayOfInterval({
    start: new Date(trip.startDate),
    end: new Date(trip.endDate),
  })

  // Calculate stats
  const stats = {
    accommodations: trip.bookings.filter((b: any) => b.type === 'ACCOMMODATION').length,
    activities: trip.bookings.filter((b: any) => b.type === 'ACTIVITY').length,
    restaurants: trip.bookings.filter((b: any) => b.type === 'RESTAURANT' || b.mealType).length,
    flights: trip.bookings.filter((b: any) => b.type === 'FLIGHT').length,
  }

  const handleDateClick = (dateKey: string) => {
    if (onDateClick) {
      onDateClick(dateKey)
    } else {
      // Fallback to scroll behavior with offset for sticky header
      const element = document.getElementById(`date-${dateKey}`)
      if (element) {
        const yOffset = -20 // Small offset for better visual alignment
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }

  const getBookingName = (booking: any) => {
    const data = booking.typeSpecificData || {}
    if (booking.type === 'ACCOMMODATION') return data.propertyName || 'Accommodation'
    if (booking.type === 'ACTIVITY') return data.name || 'Activity'
    if (booking.type === 'RESTAURANT') return data.name || 'Restaurant'
    if (booking.type === 'FLIGHT') return `${data.departureAirport} → ${data.arrivalAirport}`
    return getBookingTypeLabel(booking.type)
  }

  return (
    <div className="space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-2">
        {/* Trip Overview Card */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{trip.name}</h2>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">{trip.destination}</span>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-700 bg-white/60 rounded-lg p-3">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-600" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{tripDuration} {tripDuration === 1 ? 'day' : 'days'}</div>
                <div className="text-xs text-gray-500 truncate">
                  {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              {stats.flights > 0 && (
                <div className="bg-white/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded">
                      <Plane className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stats.flights}</div>
                      <div className="text-xs text-gray-500">Flight{stats.flights !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>
              )}
              {stats.accommodations > 0 && (
                <div className="bg-white/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded">
                      <Home className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stats.accommodations}</div>
                      <div className="text-xs text-gray-500">Stay{stats.accommodations !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>
              )}
              {stats.activities > 0 && (
                <div className="bg-white/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-pink-100 rounded">
                      <Sparkles className="h-3.5 w-3.5 text-pink-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stats.activities}</div>
                      <div className="text-xs text-gray-500">Activit{stats.activities !== 1 ? 'ies' : 'y'}</div>
                    </div>
                  </div>
                </div>
              )}
              {stats.restaurants > 0 && (
                <div className="bg-white/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded">
                      <UtensilsCrossed className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stats.restaurants}</div>
                      <div className="text-xs text-gray-500">Meal{stats.restaurants !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Timeline */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Timeline</h3>
            <div className="space-y-3">
              {allDates.map((date, index) => {
                const dateKey = format(date, 'yyyy-MM-dd')
                const dateData = bookingsByDate[dateKey]
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey

                // Collect all bookings for this day
                const dayBookings = []
                if (dateData) {
                  if (dateData.accommodation) dayBookings.push({ ...dateData.accommodation, category: 'accommodation' })
                  dateData.transport.forEach((b: any) => dayBookings.push({ ...b, category: 'transport' }))
                  dateData.morning.forEach((b: any) => dayBookings.push({ ...b, category: 'morning' }))
                  if (dateData.breakfast) dayBookings.push({ ...dateData.breakfast, category: 'breakfast' })
                  if (dateData.lunch) dayBookings.push({ ...dateData.lunch, category: 'lunch' })
                  dateData.afternoon.forEach((b: any) => dayBookings.push({ ...b, category: 'afternoon' }))
                  if (dateData.dinner) dayBookings.push({ ...dateData.dinner, category: 'dinner' })
                  dateData.evening.forEach((b: any) => dayBookings.push({ ...b, category: 'evening' }))
                  dateData.allDay.forEach((b: any) => dayBookings.push({ ...b, category: 'allDay' }))
                }

                return (
                  <div
                    key={dateKey}
                    className={`rounded-lg border transition-all ${
                      isToday ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => handleDateClick(dateKey)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-t-lg transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold ${
                              isToday ? 'text-indigo-600' : 'text-gray-500'
                            }`}>
                              DAY {index + 1}
                            </span>
                            {isToday && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-100 rounded">
                                TODAY
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {format(date, 'MMM d, EEE')}
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-colors flex-shrink-0 ${
                          isToday ? 'text-indigo-400' : 'text-gray-300 group-hover:text-indigo-400'
                        }`} />
                      </div>
                    </button>

                    {/* Activity List */}
                    {dayBookings.length > 0 && (
                      <div className="px-3 pb-3 space-y-1.5">
                        {dayBookings.slice(0, 4).map((booking: any, idx: number) => (
                          <div
                            key={booking.id || idx}
                            className="text-xs text-gray-600 flex items-start gap-1.5 py-1"
                          >
                            {booking.category === 'accommodation' && <Home className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'transport' && <Plane className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'morning' && <Sun className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'afternoon' && <Sunset className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'evening' && <Moon className="h-3 w-3 text-indigo-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'breakfast' && <Coffee className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'lunch' && <UtensilsCrossed className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'dinner' && <Moon className="h-3 w-3 text-indigo-600 mt-0.5 flex-shrink-0" />}
                            {booking.category === 'allDay' && <Sparkles className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />}
                            <span className="truncate flex-1">
                              {booking.time && <span className="text-gray-400 mr-1">{booking.time}</span>}
                              {getBookingName(booking)}
                            </span>
                          </div>
                        ))}
                        {dayBookings.length > 4 && (
                          <div className="text-xs text-gray-400 pl-4 pt-1">
                            +{dayBookings.length - 4} more
                          </div>
                        )}
                      </div>
                    )}

                    {dayBookings.length === 0 && (
                      <div className="px-3 pb-3 text-xs text-gray-400 italic">
                        No activities planned
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
