'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import BookingTypeIcon, { getBookingTypeColor, getBookingTypeLabel } from '@/components/BookingTypeIcon'
import { cn } from '@/lib/utils'
import { Clock, MapPin, Hash, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Map from '@/components/Map'
import { getBookingLocation } from '@/lib/bookingUtils'

interface BookingCardProps {
  booking: any
  tripId: string
  isReadOnly?: boolean
}

export default function BookingCard({ booking, tripId, isReadOnly = false }: BookingCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const typeColor = getBookingTypeColor(booking.type)
  const typeLabel = getBookingTypeLabel(booking.type)

  const handleDelete = async () => {
    if (isReadOnly) return
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking. Please try again.')
      setIsDeleting(false)
    }
  }

  const renderTypeSpecificInfo = () => {
    const data = booking.typeSpecificData

    if (!data) return null

    switch (booking.type) {
      case 'FLIGHT':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.airline} {data.flightNumber}</p>
            <p className="text-sm text-gray-600">
              {data.departureAirport} → {data.arrivalAirport}
            </p>
          </div>
        )
      case 'ACCOMMODATION':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.propertyName}</p>
            <p className="text-sm text-gray-600">{data.address}</p>
          </div>
        )
      case 'CAR_RENTAL':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.company}</p>
            <p className="text-sm text-gray-600">
              {data.pickupLocation} → {data.dropoffLocation}
            </p>
          </div>
        )
      case 'RESTAURANT':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm text-gray-600">{data.address}</p>
            {data.partySize && (
              <p className="text-sm text-gray-600">Party of {data.partySize}</p>
            )}
          </div>
        )
      case 'ACTIVITY':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm text-gray-600">{data.location}</p>
          </div>
        )
      case 'TRANSPORT':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.operator}</p>
            <p className="text-sm text-gray-600">
              {data.departureStation} → {data.arrivalStation}
            </p>
          </div>
        )
      default:
        return null
    }
  }

  const location = getBookingLocation(booking)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className={cn('p-3 rounded-lg', typeColor)}>
              <BookingTypeIcon type={booking.type} className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">{typeLabel}</span>
                <div className="flex items-center space-x-2">
                  {booking.time && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.time}
                    </div>
                  )}
                  {!isReadOnly && (
                    <>
                      <Link href={`/bookings/${booking.id}/edit?tripId=${tripId}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {renderTypeSpecificInfo()}
              {booking.confirmationNumber && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Hash className="h-4 w-4 mr-1" />
                  {booking.confirmationNumber}
                </div>
              )}
              {booking.notes && (
                <p className="mt-2 text-sm text-gray-600">{booking.notes}</p>
              )}
            </div>
          </div>
          {location && (
            <div className="w-full md:w-80 h-48 md:h-64 md:flex-shrink-0">
              <Map location={location} className="w-full h-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
