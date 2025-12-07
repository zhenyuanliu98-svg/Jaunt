import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { findUserByEmail, findTripById, createBooking } from '@/lib/db'

export async function POST(
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

  // Verify trip belongs to user
  const trip = await findTripById(params.id, user.id)

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  try {
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
      typeSpecificData,
    } = body

    if (!type || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const booking = await createBooking({
      tripId: params.id,
      type,
      date: new Date(date),
      time: time || null,
      endDate: endDate ? new Date(endDate) : null,
      endTime: endTime || null,
      confirmationNumber: confirmationNumber || null,
      notes: notes || null,
      cost: cost ? parseFloat(cost) : null,
      city: city || null,
      typeSpecificData: typeSpecificData || null,
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
