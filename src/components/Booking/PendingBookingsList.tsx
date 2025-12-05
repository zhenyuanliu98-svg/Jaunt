'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckCircle, XCircle } from 'lucide-react'

interface PendingBookingsListProps {
  pendingBookings: any[]
  trips: any[]
  isReadOnly?: boolean
}

export default function PendingBookingsList({ pendingBookings, trips, isReadOnly = false }: PendingBookingsListProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  if (pendingBookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No pending bookings to review</p>
        </CardContent>
      </Card>
    )
  }

  const handleApprove = async (bookingId: string) => {
    if (isReadOnly) return
    setProcessing(bookingId)
    // In a real implementation, this would show a modal to select trip and edit details
    alert('This feature will be enhanced to allow trip selection and detail editing')
    setProcessing(null)
  }

  const handleReject = async (bookingId: string) => {
    if (isReadOnly) return
    if (!confirm('Are you sure you want to reject this booking?')) {
      return
    }

    setProcessing(bookingId)
    try {
      const response = await fetch(`/api/bookings/pending/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject booking')
      }

      router.refresh()
    } catch (error) {
      console.error('Error rejecting booking:', error)
      alert('Failed to reject booking')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-4">
      {pendingBookings.map((booking) => {
        const rawEmail = JSON.parse(booking.rawEmail)
        const parsedData = booking.parsedData || {}

        return (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {rawEmail.subject || 'No Subject'}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    From: {rawEmail.from}
                  </CardDescription>
                  {parsedData.type && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium">
                        Detected: {parsedData.type.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {parsedData.detectedFields && Object.keys(parsedData.detectedFields).length > 0 && (
                    <div className="mt-4 space-y-1">
                      {Object.entries(parsedData.detectedFields).map(([key, value]) => (
                        <p key={key} className="text-sm text-gray-600">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(booking.id)}
                    disabled={processing === booking.id || isReadOnly}
                    title={isReadOnly ? 'Sign in to review forwarded bookings' : undefined}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleReject(booking.id)}
                    disabled={processing === booking.id || isReadOnly}
                    title={isReadOnly ? 'Sign in to reject forwarded bookings' : undefined}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
