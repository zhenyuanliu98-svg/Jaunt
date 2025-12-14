'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import BookingCard from './BookingCard'

interface DraggableBookingCardProps {
  booking: any
  tripId?: string
  readOnly?: boolean
}

export default function DraggableBookingCard({
  booking,
  tripId,
  readOnly = false,
}: DraggableBookingCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: booking.id,
    data: {
      booking,
    },
    disabled: readOnly,
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'} ${
        readOnly ? 'cursor-default' : ''
      }`}
    >
      <BookingCard
        booking={booking}
        tripId={tripId || ''}
        isReadOnly={readOnly}
      />
    </div>
  )
}
