import { BookingType } from '@prisma/client'
import { Plane, Home, Car, UtensilsCrossed, Ticket, Train } from 'lucide-react'

interface BookingTypeIconProps {
  type: BookingType
  className?: string
}

export default function BookingTypeIcon({ type, className = "h-5 w-5" }: BookingTypeIconProps) {
  switch (type) {
    case 'FLIGHT':
      return <Plane className={className} />
    case 'ACCOMMODATION':
      return <Home className={className} />
    case 'CAR_RENTAL':
      return <Car className={className} />
    case 'RESTAURANT':
      return <UtensilsCrossed className={className} />
    case 'ACTIVITY':
      return <Ticket className={className} />
    case 'TRANSPORT':
      return <Train className={className} />
    default:
      return <Ticket className={className} />
  }
}

export function getBookingTypeColor(type: BookingType): string {
  switch (type) {
    case 'FLIGHT':
      return 'text-blue-600 bg-blue-50'
    case 'ACCOMMODATION':
      return 'text-green-600 bg-green-50'
    case 'CAR_RENTAL':
      return 'text-purple-600 bg-purple-50'
    case 'RESTAURANT':
      return 'text-orange-600 bg-orange-50'
    case 'ACTIVITY':
      return 'text-pink-600 bg-pink-50'
    case 'TRANSPORT':
      return 'text-indigo-600 bg-indigo-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getBookingTypeLabel(type: BookingType): string {
  switch (type) {
    case 'FLIGHT':
      return 'Flight'
    case 'ACCOMMODATION':
      return 'Accommodation'
    case 'CAR_RENTAL':
      return 'Car Rental'
    case 'RESTAURANT':
      return 'Restaurant'
    case 'ACTIVITY':
      return 'Activity'
    case 'TRANSPORT':
      return 'Transport'
    default:
      return 'Booking'
  }
}
