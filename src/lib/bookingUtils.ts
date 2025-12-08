import { BookingType } from '@/types/enums'

/**
 * Extracts a displayable location string from booking data for mapping
 * Returns null if no location data is available
 */
export function getBookingLocation(booking: any): string | null {
  const data = booking.typeSpecificData
  if (!data) return null

  switch (booking.type as BookingType) {
    case BookingType.FLIGHT:
      // For flights, show departure airport as it's the starting location
      return data.departureAirport || null

    case BookingType.ACCOMMODATION:
      return data.address || null

    case BookingType.CAR_RENTAL:
      // For car rentals, show pickup location
      return data.pickupLocation || null

    case BookingType.RESTAURANT:
      return data.address || null

    case BookingType.ACTIVITY:
      return data.location || null

    case BookingType.TRANSPORT:
      // For transport, show departure station as it's the starting location
      return data.departureStation || null

    default:
      return null
  }
}

/**
 * Checks if a booking has location data that can be displayed on a map
 */
export function hasBookingLocation(booking: any): boolean {
  return getBookingLocation(booking) !== null
}
