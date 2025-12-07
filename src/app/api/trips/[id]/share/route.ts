import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { findUserByEmail, findTripById, updateTripShareToken } from '@/lib/db'
import { generateShareToken } from '@/lib/utils'

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

  try {
    // Find the trip and verify ownership
    const trip = await findTripById(params.id, user.id)

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Generate share token if it doesn't exist
    let shareToken = trip.shareToken
    if (!shareToken) {
      try {
        shareToken = generateShareToken()
        await updateTripShareToken(params.id, shareToken)
      } catch (updateError) {
        console.error('Error updating share token:', updateError)
        return NextResponse.json(
          { error: 'Failed to update share token. Please check database permissions.' },
          { status: 500 }
        )
      }
    }

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${shareToken}`

    return NextResponse.json({ shareUrl, shareToken })
  } catch (error) {
    console.error('Error generating share link:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to generate share link: ${errorMessage}` },
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
    // Verify trip exists and belongs to user
    const trip = await findTripById(params.id, user.id)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Revoke share token
    await updateTripShareToken(params.id, null)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking share link:', error)
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    )
  }
}
