'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Share2, Pencil, Trash2, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import BookingCard from '@/components/Booking/BookingCard'
import DraggableBookingCard from '@/components/Booking/DraggableBookingCard'
import MealSlot from './MealSlot'
import { format } from 'date-fns'
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { DaySlotType, MealType } from '@/types/enums'

interface TripViewProps {
  trip: any
  isReadOnly?: boolean
}

export default function TripView({ trip, isReadOnly = false }: TripViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingCity, setEditingCity] = useState<{ [key: string]: boolean }>({})
  const [cityInputs, setCityInputs] = useState<{ [key: string]: string }>({})
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

  const handleCityEdit = (dateKey: string, dateData: any) => {
    const cities = getCitiesForDate(dateData)
    setCityInputs({ ...cityInputs, [dateKey]: cities.join(' / ') })
    setEditingCity({ ...editingCity, [dateKey]: true })
  }

  const handleCitySave = async (dateKey: string, dateData: any) => {
    const newCities = cityInputs[dateKey]?.split('/').map(c => c.trim()).filter(c => c) || []

    const allBookings = [
      dateData[DaySlotType.BREAKFAST],
      dateData[DaySlotType.LUNCH],
      dateData[DaySlotType.DINNER],
      dateData[DaySlotType.ACCOMMODATION],
      ...dateData.unassigned,
    ].filter(Boolean)

    try {
      // Update all bookings for this date
      const updatePromises = allBookings.map((booking: any, index: number) => {
        const city = newCities[index] || newCities[0] || ''
        return fetch(`/api/bookings/${booking.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city }),
        })
      })

      await Promise.all(updatePromises)
      setEditingCity({ ...editingCity, [dateKey]: false })
      router.refresh()
    } catch (error) {
      console.error('Error updating cities:', error)
      alert('Failed to update cities. Please try again.')
    }
  }

  const handleCityCancel = (dateKey: string) => {
    setEditingCity({ ...editingCity, [dateKey]: false })
    setCityInputs({ ...cityInputs, [dateKey]: '' })
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

      // Try to copy to clipboard with fallback
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert(`Share link copied to clipboard!\n\n${shareUrl}`)
      } catch (clipboardError) {
        // Clipboard API failed - show URL for manual copy
        const message = `Share link (select and copy):\n\n${shareUrl}\n\nNote: Clipboard access was denied. Please copy the link manually.`

        // Use a prompt as a workaround - it allows text selection
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

  // Group bookings by date and slot
  const bookingsByDate = trip.bookings.reduce((acc: any, booking: any) => {
    const dateKey = format(booking.date, 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = {
        [DaySlotType.BREAKFAST]: null,
        [DaySlotType.LUNCH]: null,
        [DaySlotType.DINNER]: null,
        [DaySlotType.ACCOMMODATION]: null,
        unassigned: [],
      }
    }

    // Assign booking to slot based on mealType or type
    if (booking.mealType === MealType.BREAKFAST) {
      acc[dateKey][DaySlotType.BREAKFAST] = booking
    } else if (booking.mealType === MealType.LUNCH) {
      acc[dateKey][DaySlotType.LUNCH] = booking
    } else if (booking.mealType === MealType.DINNER) {
      acc[dateKey][DaySlotType.DINNER] = booking
    } else if (booking.type === 'ACCOMMODATION') {
      acc[dateKey][DaySlotType.ACCOMMODATION] = booking
    } else {
      acc[dateKey].unassigned.push(booking)
    }

    return acc
  }, {})

  const sortedDates = Object.keys(bookingsByDate).sort()

  const getCitiesForDate = (dateData: any) => {
    const allBookings = [
      dateData[DaySlotType.BREAKFAST],
      dateData[DaySlotType.LUNCH],
      dateData[DaySlotType.DINNER],
      dateData[DaySlotType.ACCOMMODATION],
      ...dateData.unassigned,
    ].filter(Boolean)

    const cities = allBookings
      .map((b: any) => b.city)
      .filter((city: string, index: number, self: string[]) => city && self.indexOf(city) === index)
    return cities
  }

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
            {sortedDates.map((dateKey) => {
              const dateData = bookingsByDate[dateKey]
              const cities = getCitiesForDate(dateData)
              const isEditing = editingCity[dateKey]

              return (
                <div key={dateKey}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(new Date(dateKey), 'EEEE, MMMM dd, yyyy')}
                    </h3>
                    {cities.length > 0 && (
                      <div className="flex items-center mt-2">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={cityInputs[dateKey] || ''}
                              onChange={(e) => setCityInputs({ ...cityInputs, [dateKey]: e.target.value })}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="City 1 / City 2 / ..."
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCitySave(dateKey, dateData)}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCityCancel(dateKey)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {cities.join(' / ')}
                            </span>
                            {!isReadOnly && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCityEdit(dateKey, dateData)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Meal and Accommodation Slots */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <MealSlot
                      slotType={DaySlotType.BREAKFAST}
                      date={dateKey}
                      booking={dateData[DaySlotType.BREAKFAST]}
                      tripId={trip.id}
                      readOnly={isReadOnly}
                    />
                    <MealSlot
                      slotType={DaySlotType.LUNCH}
                      date={dateKey}
                      booking={dateData[DaySlotType.LUNCH]}
                      tripId={trip.id}
                      readOnly={isReadOnly}
                    />
                    <MealSlot
                      slotType={DaySlotType.DINNER}
                      date={dateKey}
                      booking={dateData[DaySlotType.DINNER]}
                      tripId={trip.id}
                      readOnly={isReadOnly}
                    />
                    <MealSlot
                      slotType={DaySlotType.ACCOMMODATION}
                      date={dateKey}
                      booking={dateData[DaySlotType.ACCOMMODATION]}
                      tripId={trip.id}
                      readOnly={isReadOnly}
                    />
                  </div>

                  {/* Unassigned Bookings */}
                  {dateData.unassigned.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Other Activities & Bookings
                      </h4>
                      <div className="space-y-3">
                        {dateData.unassigned.map((booking: any) => (
                          <DraggableBookingCard
                            key={booking.id}
                            booking={booking}
                            tripId={trip.id}
                            readOnly={isReadOnly}
                          />
                        ))}
                      </div>
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
