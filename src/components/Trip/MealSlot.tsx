'use client'

import { useDroppable } from '@dnd-kit/core'
import { DaySlotType } from '@/types/enums'
import { Coffee, UtensilsCrossed, Moon, Home } from 'lucide-react'
import DraggableBookingCard from '@/components/Booking/DraggableBookingCard'

interface MealSlotProps {
  slotType: DaySlotType
  date: string
  booking: any | null
  tripId?: string
  readOnly?: boolean
}

const slotConfig = {
  [DaySlotType.BREAKFAST]: {
    label: 'Breakfast',
    icon: Coffee,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
  },
  [DaySlotType.LUNCH]: {
    label: 'Lunch',
    icon: UtensilsCrossed,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600',
  },
  [DaySlotType.DINNER]: {
    label: 'Dinner',
    icon: Moon,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    iconColor: 'text-indigo-600',
  },
  [DaySlotType.ACCOMMODATION]: {
    label: 'Accommodation',
    icon: Home,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconColor: 'text-green-600',
  },
}

export default function MealSlot({
  slotType,
  date,
  booking,
  tripId,
  readOnly = false,
}: MealSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${date}-${slotType}`,
    data: {
      slotType,
      date,
    },
  })

  const config = slotConfig[slotType]
  const Icon = config.icon

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-3 transition-all ${
        isOver ? 'ring-2 ring-blue-400 scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`${config.iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className={`text-sm font-semibold ${config.textColor}`}>
          {config.label}
        </h3>
      </div>

      {booking ? (
        <div className="bg-white rounded-md">
          <DraggableBookingCard
            booking={booking}
            tripId={tripId || ''}
            readOnly={readOnly}
          />
        </div>
      ) : (
        <div className={`text-center py-4 text-sm ${config.textColor} opacity-60`}>
          Drop a booking here or click to add
        </div>
      )}
    </div>
  )
}
