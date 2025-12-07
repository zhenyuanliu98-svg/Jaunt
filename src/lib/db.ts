import { supabase } from './supabase'

// User operations
export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return data
}

export async function findUserByForwardEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uniqueForwardEmail', email)
    .single()

  if (error) return null
  return data
}

export async function createUser(userData: {
  email: string
  name?: string | null
  image?: string | null
  uniqueForwardEmail: string
}) {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUser(email: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('email', email)
    .select()
    .single()

  if (error) throw error
  return data
}

// Trip operations
export async function findTripsByUserId(userId: string, orderBy: 'asc' | 'desc' = 'desc') {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('userId', userId)
    .order('startDate', { ascending: orderBy === 'asc' })

  if (error) throw error
  return data || []
}

export async function findTripById(tripId: string, userId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('userId', userId)
    .single()

  if (error) return null
  return data
}

export async function findTripByShareToken(shareToken: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('shareToken', shareToken)
    .single()

  if (error) return null
  return data
}

export async function createTrip(tripData: {
  userId: string
  name: string
  destination: string
  startDate: Date
  endDate: Date
}) {
  const { data, error } = await supabase
    .from('trips')
    .insert(tripData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTrip(tripId: string, userId: string, updates: any) {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .eq('userId', userId)
    .select()

  if (error) throw error
  return data
}

export async function deleteTrip(tripId: string, userId: string) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('userId', userId)

  if (error) throw error
  return true
}

export async function updateTripShareToken(tripId: string, shareToken: string | null) {
  const { data, error } = await supabase
    .from('trips')
    .update({ shareToken })
    .eq('id', tripId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Booking operations
export async function getBookingsForTrip(tripId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, attachments(*)')
    .eq('tripId', tripId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getBookingCountForTrip(tripId: string) {
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { head: true, count: 'exact' })
    .eq('tripId', tripId)

  if (error) throw error
  return count || 0
}

export async function createBooking(bookingData: {
  tripId: string
  type: string
  date: Date
  time?: string | null
  endDate?: Date | null
  endTime?: string | null
  confirmationNumber?: string | null
  notes?: string | null
  cost?: number | null
  typeSpecificData?: any
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Pending booking operations
export async function findPendingBookingsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('pending_bookings')
    .select('*')
    .eq('userId', userId)
    .eq('status', 'PENDING')
    .order('createdAt', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createPendingBooking(bookingData: {
  userId: string
  rawEmail: string
  parsedData: any
  status: string
}) {
  const { data, error } = await supabase
    .from('pending_bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePendingBooking(bookingId: string, userId: string, status: string) {
  const { data, error } = await supabase
    .from('pending_bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('userId', userId)
    .select()

  if (error) throw error
  return data
}

export async function findPendingBookingById(bookingId: string, userId: string) {
  const { data, error } = await supabase
    .from('pending_bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('userId', userId)
    .single()

  if (error) return null
  return data
}

// Attachment operations
export async function createAttachment(attachmentData: {
  bookingId: string
  filename: string
  url: string
  type: string
  size: number
}) {
  const { data, error } = await supabase
    .from('attachments')
    .insert(attachmentData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Complex queries for pages
export async function getUserWithTripsAndBookings(email: string) {
  const user = await findUserByEmail(email)
  if (!user) return null

  const trips = await findTripsByUserId(user.id, 'desc')

  // Enrich trips with booking counts
  const tripsWithCounts = await Promise.all(
    trips.map(async (trip) => {
      const count = await getBookingCountForTrip(trip.id)
      return {
        ...trip,
        _count: { bookings: count }
      }
    })
  )

  const pendingBookings = await findPendingBookingsByUserId(user.id)

  return {
    ...user,
    trips: tripsWithCounts,
    pendingBookings
  }
}

export async function getTripWithBookingsByShareToken(shareToken: string) {
  const trip = await findTripByShareToken(shareToken)
  if (!trip) return null

  const bookings = await getBookingsForTrip(trip.id)

  return {
    ...trip,
    bookings
  }
}
