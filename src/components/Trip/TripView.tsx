'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Share2, Pencil, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import BookingCard from '@/components/Booking/BookingCard'
import { format, parseISO } from 'date-fns'

interface TripViewProps {
  trip: any
}

export default function TripView({ trip }: TripViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
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
    try {
      const response = await fetch(`/api/trips/${trip.id}/share`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const { shareUrl } = await response.json()

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      alert(`Share link copied to clipboard!\n\n${shareUrl}`)
    } catch (error) {
      console.error('Error sharing trip:', error)
      alert('Failed to generate share link. Please try again.')
    }
  }

  // Group bookings by date
  const bookingsByDate = trip.bookings.reduce((acc: any, booking: any) => {
    const dateKey = format(parseISO(booking.date), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(booking)
    return acc
  }, {})

  const sortedDates = Object.keys(bookingsByDate).sort()

  return (
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
                  {format(parseISO(trip.startDate), 'MMM dd, yyyy')} - {format(parseISO(trip.endDate), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Link href={`/trips/${trip.id}/edit`}>
                <Button variant="ghost">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Booking Button */}
      <div className="flex justify-end">
        <Link href={`/trips/${trip.id}/bookings/new`}>
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Add Booking
          </Button>
        </Link>
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
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {format(parseISO(dateKey), 'EEEE, MMMM dd, yyyy')}
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
  )
}
