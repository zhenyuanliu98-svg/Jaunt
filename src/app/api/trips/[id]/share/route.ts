import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    // Find the trip and verify ownership
    const trip = await prisma.trip.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Generate share token if it doesn't exist
    let shareToken = trip.shareToken
    if (!shareToken) {
      shareToken = generateShareToken()
      await prisma.trip.update({
        where: { id: params.id },
        data: { shareToken }
      })
    }

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${shareToken}`

    return NextResponse.json({ shareUrl, shareToken })
  } catch (error) {
    console.error('Error generating share link:', error)
    return NextResponse.json(
      { error: 'Failed to generate share link' },
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    // Revoke share token
    const updated = await prisma.trip.updateMany({
      where: {
        id: params.id,
        userId: user.id
      },
      data: {
        shareToken: null
      }
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking share link:', error)
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    )
  }
}
