import { NextRequest, NextResponse } from 'next/server'
import { findUserByForwardEmail, createPendingBooking } from '@/lib/db'
import OpenAI from 'openai'

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
    const user = await findUserByForwardEmail(uniqueEmail)

    if (!user) {
      console.log('User not found for email:', uniqueEmail)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse the email content for booking information
    const parsedData = await parseBookingEmail(subject, text, html)

    // Create pending booking for user to review
    await createPendingBooking({
      userId: user.id,
      rawEmail: JSON.stringify({
        from,
        subject,
        text,
        html: html ? html.substring(0, 5000) : null, // Truncate HTML to prevent DB bloat
      }),
      parsedData: parsedData,
      status: 'PENDING',
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
 * OpenAI-powered email parsing logic
 * Uses GPT-4 to intelligently extract booking information from emails
 */
async function parseBookingEmail(subject: string, text: string, html: string): Promise<any> {
  // If OpenAI API key is not configured, fall back to basic parsing
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not configured, using basic parsing')
    return fallbackParseBookingEmail(subject, text)
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const emailContent = `
Subject: ${subject}

${text}
    `.trim()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts booking information from travel-related emails.
Your task is to analyze the email content and extract structured booking data.

Return a JSON object with the following structure:
{
  "type": "FLIGHT" | "ACCOMMODATION" | "CAR_RENTAL" | "RESTAURANT" | "ACTIVITY" | "TRANSPORT",
  "date": "YYYY-MM-DD" (start/departure date),
  "time": "HH:MM" (optional, 24-hour format),
  "endDate": "YYYY-MM-DD" (optional, for multi-day bookings like hotels),
  "endTime": "HH:MM" (optional),
  "confirmationNumber": "string" (optional),
  "notes": "string" (optional, any additional relevant info),
  "cost": number (optional, total cost if mentioned),
  "typeSpecificData": {
    // For FLIGHT:
    "airline": "string",
    "flightNumber": "string",
    "departureAirport": "string (airport code if available, otherwise name)",
    "arrivalAirport": "string (airport code if available, otherwise name)",
    "departureTime": "HH:MM" (optional),
    "arrivalTime": "HH:MM" (optional)

    // For ACCOMMODATION:
    "propertyName": "string",
    "address": "string",
    "checkInTime": "HH:MM" (optional),
    "checkOutTime": "HH:MM" (optional)

    // For CAR_RENTAL:
    "company": "string",
    "pickupLocation": "string",
    "dropoffLocation": "string",
    "pickupTime": "HH:MM" (optional),
    "dropoffTime": "HH:MM" (optional)

    // For RESTAURANT:
    "name": "string",
    "address": "string",
    "partySize": number (optional)

    // For ACTIVITY:
    "name": "string",
    "location": "string",
    "description": "string" (optional)

    // For TRANSPORT (train, bus, etc):
    "operator": "string",
    "route": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "HH:MM" (optional),
    "arrivalTime": "HH:MM" (optional)
  }
}

Important:
- Only include fields that you can extract from the email
- Dates must be in YYYY-MM-DD format
- Times must be in 24-hour HH:MM format
- If you're unsure about the booking type, make your best guess
- Extract as much information as possible
- Return only valid JSON, no additional text`,
        },
        {
          role: 'user',
          content: emailContent,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })

    const result = completion.choices[0].message.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(result)

    // Validate that we got at least a type
    if (!parsed.type) {
      throw new Error('No booking type detected')
    }

    return parsed
  } catch (error) {
    console.error('Error parsing email with OpenAI:', error)
    // Fallback to basic parsing if OpenAI fails
    return fallbackParseBookingEmail(subject, text)
  }
}

/**
 * Fallback basic email parsing logic (regex-based)
 * Used when OpenAI is not available or fails
 */
function fallbackParseBookingEmail(subject: string, text: string): any {
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
