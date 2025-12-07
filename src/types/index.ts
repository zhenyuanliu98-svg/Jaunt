import { BookingType } from './enums'

// Flight specific data
export interface FlightData {
  airline: string
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureTime?: string
  arrivalTime?: string
}

// Accommodation specific data
export interface AccommodationData {
  propertyName: string
  address: string
  checkInTime?: string
  checkOutTime?: string
}

// Car rental specific data
export interface CarRentalData {
  company: string
  pickupLocation: string
  dropoffLocation: string
  pickupTime?: string
  dropoffTime?: string
}

// Restaurant specific data
export interface RestaurantData {
  name: string
  address: string
  partySize?: number
}

// Activity specific data
export interface ActivityData {
  name: string
  location: string
  description?: string
}

// Transport specific data
export interface TransportData {
  operator: string
  route: string
  departureStation: string
  arrivalStation: string
  departureTime?: string
  arrivalTime?: string
}

// Union type for all booking type-specific data
export type BookingTypeSpecificData =
  | FlightData
  | AccommodationData
  | CarRentalData
  | RestaurantData
  | ActivityData
  | TransportData

// Form data for creating/editing bookings
export interface BookingFormData {
  type: BookingType
  date: string
  time?: string
  endDate?: string
  endTime?: string
  confirmationNumber?: string
  notes?: string
  cost?: number
  city?: string
  typeSpecificData: BookingTypeSpecificData
}

// Trip form data
export interface TripFormData {
  name: string
  destination: string
  startDate: string
  endDate: string
}
