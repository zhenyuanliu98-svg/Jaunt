import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Webhook endpoint for incoming emails (SendGrid Inbound Parse)
 * This endpoint receives parsed email data from SendGrid
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const to = formData.get('to') as string
    const from = formData.get('from') as string
    const subject = formData.get('subject') as string
    const text = formData.get('text') as string
    const html = formData.get('html') as string

    // Extract the unique email address from the 'to' field
    // Format: username.uniqueId@jaunt.app
    const emailMatch = to?.match(/([a-z0-9]+)@/)
    if (!emailMatch) {
      return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 })
    }

    const uniqueEmail = to.split(',')[0].trim().toLowerCase()

    // Find user by forwarding email
    const user = await prisma.user.findUnique({
      where: { uniqueForwardEmail: uniqueEmail }
    })

    if (!user) {
      console.log('User not found for email:', uniqueEmail)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse the email content for booking information
    const parsedData = await parseBookingEmail(subject, text, html)

    // Create pending booking for user to review
    await prisma.pendingBooking.create({
      data: {
        userId: user.id,
        rawEmail: JSON.stringify({
          from,
          subject,
          text,
          html: html ? html.substring(0, 5000) : null, // Truncate HTML to prevent DB bloat
        }),
        parsedData: parsedData,
        status: 'PENDING',
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing inbound email:', error)
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    )
  }
}

/**
 * Basic email parsing logic
 * In production, this would use AI/ML or more sophisticated parsing
 */
async function parseBookingEmail(subject: string, text: string, html: string): Promise<any> {
  const parsed: any = {
    type: detectBookingType(subject, text),
    detectedFields: {},
  }

  // Extract confirmation number (common patterns)
  const confirmationPatterns = [
    /confirmation\s+(?:number|code|#)[\s:]+([A-Z0-9]+)/i,
    /booking\s+(?:reference|number|code)[\s:]+([A-Z0-9]+)/i,
    /reservation\s+(?:number|code)[\s:]+([A-Z0-9]+)/i,
  ]

  for (const pattern of confirmationPatterns) {
    const match = text.match(pattern)
    if (match) {
      parsed.detectedFields.confirmationNumber = match[1]
      break
    }
  }

  // Extract dates (basic pattern matching)
  const datePatterns = [
    /(?:check-?in|arrival|departure|date)[\s:]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      parsed.detectedFields.possibleDate = match[1]
      break
    }
  }

  // Extract airline and flight number for flights
  if (parsed.type === 'FLIGHT') {
    const flightPattern = /(?:flight|flt)[\s#:]+([A-Z]{2}\d{1,4})/i
    const match = text.match(flightPattern)
    if (match) {
      parsed.detectedFields.flightNumber = match[1]
    }
  }

  return parsed
}

/**
 * Detect the type of booking based on email content
 */
function detectBookingType(subject: string, text: string): string {
  const content = (subject + ' ' + text).toLowerCase()

  if (content.includes('flight') || content.includes('airline') || content.includes('boarding pass')) {
    return 'FLIGHT'
  }
  if (content.includes('hotel') || content.includes('accommodation') || content.includes('check-in') || content.includes('reservation')) {
    return 'ACCOMMODATION'
  }
  if (content.includes('car rental') || content.includes('vehicle') || content.includes('hertz') || content.includes('enterprise')) {
    return 'CAR_RENTAL'
  }
  if (content.includes('restaurant') || content.includes('dinner') || content.includes('table')) {
    return 'RESTAURANT'
  }
  if (content.includes('tour') || content.includes('activity') || content.includes('ticket') || content.includes('attraction')) {
    return 'ACTIVITY'
  }
  if (content.includes('train') || content.includes('bus') || content.includes('rail')) {
    return 'TRANSPORT'
  }

  return 'ACTIVITY' // Default fallback
}
