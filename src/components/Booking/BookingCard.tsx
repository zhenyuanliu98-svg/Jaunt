'use client'

import { Card, CardContent } from '@/components/ui/Card'
import BookingTypeIcon, { getBookingTypeColor, getBookingTypeLabel } from '@/components/BookingTypeIcon'
import { cn } from '@/lib/utils'
import { Clock, MapPin, Hash } from 'lucide-react'

interface BookingCardProps {
  booking: any
  tripId: string
}

export default function BookingCard({ booking, tripId }: BookingCardProps) {
  const typeColor = getBookingTypeColor(booking.type)
  const typeLabel = getBookingTypeLabel(booking.type)

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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={cn('p-3 rounded-lg', typeColor)}>
            <BookingTypeIcon type={booking.type} className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">{typeLabel}</span>
              {booking.time && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {booking.time}
                </div>
              )}
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
      </CardContent>
    </Card>
  )
}
