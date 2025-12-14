import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { findUserByEmail, findBookingById, updateBooking, deleteBooking } from '@/lib/db'

export async function GET(
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
    const booking = await findBookingById(params.id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking, { status: 200 })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const booking = await findBookingById(params.id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      type,
      date,
      time,
      endDate,
      endTime,
      confirmationNumber,
      notes,
      cost,
      city,
      mealType,
      isAllDay,
      typeSpecificData,
    } = body

    const updates: any = {}
    if (type !== undefined) updates.type = type
    if (date !== undefined) updates.date = new Date(date)
    if (time !== undefined) updates.time = time || null
    if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null
    if (endTime !== undefined) updates.endTime = endTime || null
    if (confirmationNumber !== undefined) updates.confirmationNumber = confirmationNumber || null
    if (notes !== undefined) updates.notes = notes || null
    if (cost !== undefined) updates.cost = cost ? parseFloat(cost) : null
    if (city !== undefined) updates.city = city || null
    if (mealType !== undefined) updates.mealType = mealType || null
    if (isAllDay !== undefined) updates.isAllDay = isAllDay !== undefined ? isAllDay : null
    if (typeSpecificData !== undefined) updates.typeSpecificData = typeSpecificData || null

    const updatedBooking = await updateBooking(params.id, booking.tripId, updates)

    return NextResponse.json(updatedBooking, { status: 200 })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const booking = await findBookingById(params.id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    await deleteBooking(params.id, booking.tripId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
