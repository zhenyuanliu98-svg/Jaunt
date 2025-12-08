import { BookingType } from '@/types/enums'

/**
 * Extracts a displayable location string from booking data for mapping
 * Combines names with addresses for better geocoding accuracy
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
      // Combine property name with address for better geocoding
      if (data.propertyName && data.address) {
        return `${data.propertyName}, ${data.address}`
      }
      return data.address || data.propertyName || null

    case BookingType.CAR_RENTAL:
      // For car rentals, show pickup location
      return data.pickupLocation || null

    case BookingType.RESTAURANT:
      // Combine restaurant name with address for better geocoding
      if (data.name && data.address) {
        return `${data.name}, ${data.address}`
      }
      return data.address || data.name || null

    case BookingType.ACTIVITY:
      // Combine activity name with location if both available
      if (data.name && data.location) {
        return `${data.name}, ${data.location}`
      }
      return data.location || data.name || null

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
