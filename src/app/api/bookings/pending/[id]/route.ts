import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { findUserByEmail, updatePendingBooking, findPendingBookingById, createBooking, findTripById } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await findUserByEmail(session.user.email!)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { status, tripId } = body

    if (!status || !['REVIEWED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // If approving (REVIEWED), tripId is required
    if (status === 'REVIEWED') {
      if (!tripId) {
        return NextResponse.json(
          { error: 'Trip ID is required for approval' },
          { status: 400 }
        )
      }

      // Verify trip belongs to user
      const trip = await findTripById(tripId, user.id)
      if (!trip) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        )
      }

      // Get pending booking
      const pendingBooking = await findPendingBookingById(params.id, user.id)
      if (!pendingBooking) {
        return NextResponse.json(
          { error: 'Pending booking not found' },
          { status: 404 }
        )
      }

      const parsedData = pendingBooking.parsedData || {}

      // Create actual booking from pending booking
      await createBooking({
        tripId,
        type: parsedData.type || 'OTHER',
        date: parsedData.date ? new Date(parsedData.date) : new Date(),
        time: parsedData.time || null,
        endDate: parsedData.endDate ? new Date(parsedData.endDate) : null,
        endTime: parsedData.endTime || null,
        confirmationNumber: parsedData.confirmationNumber || null,
        notes: parsedData.notes || null,
        cost: parsedData.cost ? parseFloat(parsedData.cost) : null,
        typeSpecificData: parsedData.typeSpecificData || null,
      })
    }

    const updated = await updatePendingBooking(params.id, user.id, status)

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating pending booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
