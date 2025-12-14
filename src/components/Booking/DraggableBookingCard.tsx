'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
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
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
    >
      {!readOnly && (
        <div
          {...listeners}
          {...attributes}
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded-l-lg z-10 touch-none"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <div className={`${!readOnly ? 'pl-8' : ''}`}>
        <BookingCard
          booking={booking}
          tripId={tripId || ''}
          isReadOnly={readOnly}
        />
      </div>
    </div>
  )
}
