'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Calendar, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Trip {
  id: string
  name: string
  destination: string
  startDate: Date
  endDate: Date
}

interface TripSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  trips: Trip[]
  onSelectTrip: (tripId: string) => void
  isLoading?: boolean
}

export default function TripSelectionModal({
  isOpen,
  onClose,
  trips,
  onSelectTrip,
  isLoading = false,
}: TripSelectionModalProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const router = useRouter()

  const handleConfirm = () => {
    if (selectedTripId) {
      onSelectTrip(selectedTripId)
    }
  }

  const handleCreateNewTrip = () => {
    router.push('/trips/new')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Trip"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTripId || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to Trip'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Select a trip to add this booking to, or create a new trip.
        </p>

        {trips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You don't have any trips yet.</p>
            <Button onClick={handleCreateNewTrip}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTripId === trip.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTripId(trip.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{trip.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {trip.destination}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(trip.startDate), 'MMM dd')} -{' '}
                        {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    {selectedTripId === trip.id && (
                      <div className="ml-2">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleCreateNewTrip}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Trip
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
