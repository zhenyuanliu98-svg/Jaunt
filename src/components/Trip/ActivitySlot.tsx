'use client'

import { useDroppable } from '@dnd-kit/core'
import { Sun, Sunset, Moon, Plus } from 'lucide-react'
import DraggableBookingCard from '@/components/Booking/DraggableBookingCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export enum TimeOfDay {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING'
}

interface ActivitySlotProps {
  timeOfDay: TimeOfDay
  date: string
  bookings: any[]
  tripId?: string
  readOnly?: boolean
}

const slotConfig = {
  [TimeOfDay.MORNING]: {
    label: 'Morning Activities',
    icon: Sun,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-600',
  },
  [TimeOfDay.AFTERNOON]: {
    label: 'Afternoon Activities',
    icon: Sunset,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600',
  },
  [TimeOfDay.EVENING]: {
    label: 'Evening Activities',
    icon: Moon,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    iconColor: 'text-indigo-600',
  },
}

export default function ActivitySlot({
  timeOfDay,
  date,
  bookings,
  tripId,
  readOnly = false,
}: ActivitySlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${date}-${timeOfDay}`,
    data: {
      timeOfDay,
      date,
    },
  })

  const config = slotConfig[timeOfDay]
  const Icon = config.icon

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-3 transition-all ${
        isOver ? 'ring-2 ring-blue-400 scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`${config.iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className={`text-sm font-semibold ${config.textColor}`}>
            {config.label}
          </h3>
        </div>
        {!readOnly && tripId && (
          <Link href={`/trips/${tripId}/bookings/new`}>
            <Button variant="ghost" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </Link>
        )}
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-2">
          {bookings.map((booking: any) => (
            <DraggableBookingCard
              key={booking.id}
              booking={booking}
              tripId={tripId || ''}
              readOnly={readOnly}
            />
          ))}
        </div>
      ) : (
        <div className={`text-center py-4 text-sm ${config.textColor} opacity-60`}>
          Drop activities here
        </div>
      )}
    </div>
  )
}
