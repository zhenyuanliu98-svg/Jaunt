'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Share2, Pencil, Trash2, Calendar, MapPin, Clock, Hash, Home as HomeIcon, Sun, Coffee, UtensilsCrossed, Moon, Sunset } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { DaySlotType, MealType } from '@/types/enums'
import BookingCard from '@/components/Booking/BookingCard'
import DraggableBookingCard from '@/components/Booking/DraggableBookingCard'
import MealSlot from '@/components/Trip/MealSlot'
import Map from '@/components/Map'
import { getBookingTypeLabel } from '@/components/BookingTypeIcon'

interface TripViewProps {
  trip: any
  isReadOnly?: boolean
}

type ViewMode = 'regular' | 'allDay'

export default function TripView({ trip, isReadOnly = false }: TripViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('regular')
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (isReadOnly) return
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete trip')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('Failed to delete trip. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleShare = async () => {
    if (isReadOnly) return
    try {
      const response = await fetch(`/api/trips/${trip.id}/share`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate share link')
      }

      const { shareUrl } = await response.json()

      try {
        await navigator.clipboard.writeText(shareUrl)
        alert(`Share link copied to clipboard!\n\n${shareUrl}`)
      } catch (clipboardError) {
        const message = `Share link (select and copy):\n\n${shareUrl}\n\nNote: Clipboard access was denied. Please copy the link manually.`
        if (window.prompt(message, shareUrl)) {
          // User clicked OK after copying
        }
      }
    } catch (error) {
      console.error('Error sharing trip:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate share link'
      alert(`${errorMessage}\n\nPlease make sure you're signed in and try again.`)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const bookingId = active.id as string
    const slotData = over.data.current

    if (!slotData) return

    const { slotType } = slotData

    // Prepare update data
    let mealType: MealType | null = null
    if (slotType === DaySlotType.BREAKFAST) mealType = MealType.BREAKFAST
    if (slotType === DaySlotType.LUNCH) mealType = MealType.LUNCH
    if (slotType === DaySlotType.DINNER) mealType = MealType.DINNER

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealType }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
    }
  }

  // Group bookings by date
  const bookingsByDate = trip.bookings.reduce((acc: any, booking: any) => {
    const dateKey = format(booking.date, 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = {
        accommodation: null,
        breakfast: null,
        lunch: null,
        dinner: null,
        morning: [],
        afternoon: [],
        evening: [],
        allDay: [],
        transport: [],
      }
    }

    // All-day activities
    if (booking.isAllDay) {
      acc[dateKey].allDay.push(booking)
      return acc
    }

    // Accommodation
    if (booking.type === 'ACCOMMODATION') {
      acc[dateKey].accommodation = booking
      return acc
    }

    // Transport & Flights
    if (booking.type === 'FLIGHT' || booking.type === 'TRANSPORT') {
      acc[dateKey].transport.push(booking)
      return acc
    }

    // Meals
    if (booking.mealType === MealType.BREAKFAST) {
      acc[dateKey].breakfast = booking
    } else if (booking.mealType === MealType.LUNCH) {
      acc[dateKey].lunch = booking
    } else if (booking.mealType === MealType.DINNER) {
      acc[dateKey].dinner = booking
    } else {
      // Time-based grouping for activities
      const time = booking.time
      if (time) {
        const hour = parseInt(time.split(':')[0])
        if (hour >= 5 && hour < 12) {
          acc[dateKey].morning.push(booking)
        } else if (hour >= 12 && hour < 17) {
          acc[dateKey].afternoon.push(booking)
        } else {
          acc[dateKey].evening.push(booking)
        }
      } else {
        // No time specified - add to morning by default
        acc[dateKey].morning.push(booking)
      }
    }

    return acc
  }, {})

  const sortedDates = Object.keys(bookingsByDate).sort()

  const activeBooking = activeId
    ? trip.bookings.find((b: any) => b.id === activeId)
    : null

  return (
    <DndContext
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Trip Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
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
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={handleShare}
                  disabled={isReadOnly}
                  title={isReadOnly ? 'Sign in to share trips' : undefined}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {isReadOnly ? (
                  <Button variant="ghost" disabled title="Sign in to edit trips">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Link href={`/trips/${trip.id}/edit`}>
                    <Button variant="ghost">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                )}
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting || isReadOnly}
                  title={isReadOnly ? 'Sign in to delete trips' : undefined}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Google Maps Integration */}
        {trip.destination && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Destination</CardTitle>
            </CardHeader>
            <CardContent>
              <Map location={trip.destination} className="h-64 w-full" />
            </CardContent>
          </Card>
        )}

        {/* Add Booking Button */}
        <div className="flex justify-end">
          {isReadOnly ? (
            <Button disabled title="Sign in to add bookings">
              <Plus className="h-5 w-5 mr-2" />
              Add Booking
            </Button>
          ) : (
            <Link href={`/trips/${trip.id}/bookings/new`}>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Add Booking
              </Button>
            </Link>
          )}
        </div>

        {/* Timeline View */}
        {trip.bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <Link href={`/trips/${trip.id}/bookings/new`}>
                <Button>Add Your First Booking</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateKey, dayIndex) => {
              const dateData = bookingsByDate[dateKey]
              const hasAllDayActivities = dateData.allDay.length > 0

              return (
                <div key={dateKey} className="space-y-4">
                  {/* Date Header with Toggle */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Day {dayIndex + 1}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(dateKey), 'EEEE, MMMM dd')}
                      </p>
                    </div>
                    {hasAllDayActivities && (
                      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('regular')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'regular'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Regular Schedule
                        </button>
                        <button
                          onClick={() => setViewMode('allDay')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'allDay'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          All Day Activity
                        </button>
                      </div>
                    )}
                  </div>

                  {/* All Day Activity View */}
                  {viewMode === 'allDay' && hasAllDayActivities && (
                    <div className="space-y-4">
                      {/* Accommodation */}
                      {dateData.accommodation && (
                        <AccommodationCard booking={dateData.accommodation} tripId={trip.id} isReadOnly={isReadOnly} />
                      )}

                      {/* All Day Activities */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Today&apos;s Activity</h4>
                        {dateData.allDay.map((booking: any) => (
                          <AllDayActivityCard key={booking.id} booking={booking} tripId={trip.id} isReadOnly={isReadOnly} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Schedule View */}
                  {viewMode === 'regular' && (
                    <div className="space-y-6">
                      {/* Accommodation */}
                      {dateData.accommodation && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Where You&apos;re Staying</h4>
                          <AccommodationCard booking={dateData.accommodation} tripId={trip.id} isReadOnly={isReadOnly} />
                        </div>
                      )}

                      {/* Transport & Flights */}
                      {dateData.transport.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Transport & Flights</h4>
                          {dateData.transport.map((booking: any) => (
                            <TransportCard key={booking.id} booking={booking} tripId={trip.id} isReadOnly={isReadOnly} />
                          ))}
                        </div>
                      )}

                      {/* Morning */}
                      {dateData.morning.length > 0 && (
                        <TimeSection
                          icon={Sun}
                          title="Morning"
                          bookings={dateData.morning}
                          tripId={trip.id}
                          isReadOnly={isReadOnly}
                        />
                      )}

                      {/* Breakfast */}
                      <MealSlot
                        slotType={DaySlotType.BREAKFAST}
                        date={dateKey}
                        booking={dateData.breakfast}
                        tripId={trip.id}
                        readOnly={isReadOnly}
                      />

                      {/* Lunch */}
                      <MealSlot
                        slotType={DaySlotType.LUNCH}
                        date={dateKey}
                        booking={dateData.lunch}
                        tripId={trip.id}
                        readOnly={isReadOnly}
                      />

                      {/* Afternoon */}
                      {dateData.afternoon.length > 0 && (
                        <TimeSection
                          icon={Sunset}
                          title="Afternoon"
                          bookings={dateData.afternoon}
                          tripId={trip.id}
                          isReadOnly={isReadOnly}
                        />
                      )}

                      {/* Dinner */}
                      <MealSlot
                        slotType={DaySlotType.DINNER}
                        date={dateKey}
                        booking={dateData.dinner}
                        tripId={trip.id}
                        readOnly={isReadOnly}
                      />

                      {/* Evening */}
                      {dateData.evening.length > 0 && (
                        <TimeSection
                          icon={Moon}
                          title="Evening"
                          bookings={dateData.evening}
                          tripId={trip.id}
                          isReadOnly={isReadOnly}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <DragOverlay>
        {activeBooking ? (
          <div className="opacity-80">
            <BookingCard booking={activeBooking} tripId={trip.id} isReadOnly />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// Accommodation Card Component
function AccommodationCard({ booking, tripId, isReadOnly }: any) {
  const data = booking.typeSpecificData || {}
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50" />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <HomeIcon className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{data.propertyName || 'Accommodation'}</h3>
            {data.address && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{data.address}</span>
              </div>
            )}
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              {booking.time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Check-in: {booking.time}
                </div>
              )}
              {booking.endDate && (
                <div>Check-out: {format(new Date(booking.endDate), 'yyyy-MM-dd')}</div>
              )}
            </div>
            {booking.confirmationNumber && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Hash className="h-3 w-3" />
                Confirmation: {booking.confirmationNumber}
              </div>
            )}
          </div>
          {!isReadOnly && (
            <div className="flex gap-1">
              <Link href={`/bookings/${booking.id}/edit?tripId=${tripId}`}>
                <Button variant="ghost" size="sm">
                  <Pencil className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Transport Card Component
function TransportCard({ booking, tripId, isReadOnly }: any) {
  const data = booking.typeSpecificData || {}
  const isFlight = booking.type === 'FLIGHT'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {isFlight ? `Flight to ${data.arrivalAirport || 'Destination'}` : getBookingTypeLabel(booking.type)}
            </h3>
            {isFlight && data.flightNumber && (
              <p className="text-sm text-gray-600">Flight {data.flightNumber}</p>
            )}
            <div className="flex items-center gap-6 mt-3">
              {data.departureAirport && (
                <div>
                  <p className="text-xs text-gray-500">Departure</p>
                  <p className="font-medium text-gray-900">{data.departureAirport}</p>
                  {booking.time && <p className="text-sm text-gray-600">{booking.time}</p>}
                </div>
              )}
              {data.arrivalAirport && (
                <div>
                  <p className="text-xs text-gray-500">Arrival</p>
                  <p className="font-medium text-gray-900">{data.arrivalAirport}</p>
                  {booking.endTime && <p className="text-sm text-gray-600">{booking.endTime}</p>}
                </div>
              )}
            </div>
            {booking.confirmationNumber && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Hash className="h-3 w-3" />
                Confirmation: {booking.confirmationNumber}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// All Day Activity Card
function AllDayActivityCard({ booking, tripId, isReadOnly }: any) {
  const data = booking.typeSpecificData || {}
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded">
                ALL DAY ACTIVITY
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{data.name || getBookingTypeLabel(booking.type)}</h3>
            {data.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>Location: {data.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Time: {booking.time || '07:00'} - {booking.endTime || '19:00'}</span>
            </div>
            {booking.confirmationNumber && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Hash className="h-3 w-3" />
                Booking Reference: {booking.confirmationNumber}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Time Section Component
function TimeSection({ icon: Icon, title, bookings, tripId, isReadOnly }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-gray-600" />
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="space-y-2">
        {bookings.map((booking: any) => (
          <ActivityCard key={booking.id} booking={booking} tripId={tripId} isReadOnly={isReadOnly} />
        ))}
      </div>
    </div>
  )
}

// Activity Card Component
function ActivityCard({ booking, tripId, isReadOnly }: any) {
  // Wrap with DraggableBookingCard for drag and drop functionality
  return (
    <DraggableBookingCard
      booking={booking}
      tripId={tripId}
      readOnly={isReadOnly}
    />
  )
}
