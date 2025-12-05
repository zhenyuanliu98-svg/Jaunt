import { BookingType, PendingBookingStatus } from '@prisma/client'

export const demoTrips = [
  {
    id: 'demo-1',
    name: 'Barcelona Getaway',
    destination: 'Barcelona, Spain',
    startDate: new Date('2025-05-04'),
    endDate: new Date('2025-05-12'),
    bookings: [
      {
        id: 'demo-flight-1',
        type: BookingType.FLIGHT,
        date: new Date('2025-05-04'),
        time: '09:15',
        endDate: null,
        endTime: null,
        confirmationNumber: 'IB1234',
        notes: 'Window seat requested',
        cost: null,
        typeSpecificData: {
          airline: 'Iberia',
          departure: 'JFK',
          arrival: 'BCN',
          flightNumber: 'IB6254'
        },
        attachments: [],
        createdAt: new Date('2025-03-01'),
        updatedAt: new Date('2025-03-01')
      },
      {
        id: 'demo-hotel-1',
        type: BookingType.ACCOMMODATION,
        date: new Date('2025-05-04'),
        time: null,
        endDate: new Date('2025-05-09'),
        endTime: null,
        confirmationNumber: 'HBCN9876',
        notes: 'Late check-in noted',
        cost: null,
        typeSpecificData: {
          hotel: 'Hotel Casa Noble',
          address: 'Carrer de Mallorca, 401',
          checkIn: '15:00',
          checkOut: '11:00'
        },
        attachments: [],
        createdAt: new Date('2025-03-02'),
        updatedAt: new Date('2025-03-02')
      },
      {
        id: 'demo-tour-1',
        type: BookingType.ACTIVITY,
        date: new Date('2025-05-06'),
        time: '10:00',
        endDate: null,
        endTime: null,
        confirmationNumber: 'GAUDIPASS',
        notes: 'Meet guide at the main gate',
        cost: null,
        typeSpecificData: {
          title: 'Sagrada Família Tour',
          provider: 'Catalan Tours',
          duration: '2h'
        },
        attachments: [],
        createdAt: new Date('2025-03-04'),
        updatedAt: new Date('2025-03-04')
      }
    ],
    _count: { bookings: 3 }
  },
  {
    id: 'demo-2',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: new Date('2024-10-12'),
    endDate: new Date('2024-10-20'),
    bookings: [
      {
        id: 'demo-flight-2',
        type: BookingType.FLIGHT,
        date: new Date('2024-10-12'),
        time: '13:45',
        endDate: null,
        endTime: null,
        confirmationNumber: 'JL0023',
        notes: 'Upgrade using miles if available',
        cost: null,
        typeSpecificData: {
          airline: 'Japan Airlines',
          departure: 'LAX',
          arrival: 'HND',
          flightNumber: 'JL61'
        },
        attachments: [],
        createdAt: new Date('2024-08-10'),
        updatedAt: new Date('2024-08-10')
      },
      {
        id: 'demo-food-1',
        type: BookingType.RESTAURANT,
        date: new Date('2024-10-14'),
        time: '19:30',
        endDate: null,
        endTime: null,
        confirmationNumber: 'SUSHI456',
        notes: 'Counter seats preferred',
        cost: null,
        typeSpecificData: {
          restaurant: 'Sushi Sora',
          address: 'Otemachi Tower, 38F',
          partySize: 2
        },
        attachments: [],
        createdAt: new Date('2024-08-12'),
        updatedAt: new Date('2024-08-12')
      }
    ],
    _count: { bookings: 2 }
  }
]

export const demoPendingBookings = [
  {
    id: 'demo-pending-1',
    rawEmail: JSON.stringify({
      subject: 'Your flight to Barcelona',
      from: 'notifications@iberia.com'
    }),
    parsedData: {
      type: 'FLIGHT',
      detectedFields: {
        airline: 'Iberia',
        confirmationNumber: 'IB1234',
        departure: 'JFK',
        arrival: 'BCN'
      }
    },
    status: PendingBookingStatus.PENDING,
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-03-10')
  }
]

export const demoUser = {
  id: 'demo-user',
  email: 'demo@jaunt.app',
  name: 'Demo Traveler',
  uniqueForwardEmail: 'yourname@jaunt.app',
  trips: demoTrips,
  pendingBookings: demoPendingBookings
}
