'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { BookingType, MealType } from '@/types/enums'
import { format } from 'date-fns'
import { autoDetectMealType } from '@/lib/mealTypeUtils'

export default function EditBookingPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const tripId = searchParams.get('tripId')

  const [formData, setFormData] = useState({
    type: 'FLIGHT' as BookingType,
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    confirmationNumber: '',
    notes: '',
    cost: '',
    city: '',
    mealType: '' as MealType | '',
    isAllDay: false,
    // Type-specific fields
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    propertyName: '',
    address: '',
    company: '',
    pickupLocation: '',
    dropoffLocation: '',
    name: '',
    partySize: '',
    location: '',
    operator: '',
    route: '',
    departureStation: '',
    arrivalStation: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Auto-detect meal type for restaurants
  useEffect(() => {
    if (formData.type === 'RESTAURANT' && !loading) {
      const detectedMealType = autoDetectMealType(formData.time, formData.name)
      if (detectedMealType && !formData.mealType) {
        setFormData(prev => ({ ...prev, mealType: detectedMealType }))
      }
    }
  }, [formData.time, formData.name, formData.type, formData.mealType, loading])

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch booking')
        }

        const booking = await response.json()

        // Populate form with existing booking data
        const data = booking.typeSpecificData || {}
        setFormData({
          type: booking.type,
          date: booking.date ? format(new Date(booking.date), 'yyyy-MM-dd') : '',
          time: booking.time || '',
          endDate: booking.endDate ? format(new Date(booking.endDate), 'yyyy-MM-dd') : '',
          endTime: booking.endTime || '',
          confirmationNumber: booking.confirmationNumber || '',
          notes: booking.notes || '',
          cost: booking.cost?.toString() || '',
          city: booking.city || '',
          mealType: booking.mealType || '',
          isAllDay: booking.isAllDay || false,
          // Type-specific fields
          airline: data.airline || '',
          flightNumber: data.flightNumber || '',
          departureAirport: data.departureAirport || '',
          arrivalAirport: data.arrivalAirport || '',
          propertyName: data.propertyName || '',
          address: data.address || '',
          company: data.company || '',
          pickupLocation: data.pickupLocation || '',
          dropoffLocation: data.dropoffLocation || '',
          name: data.name || '',
          partySize: data.partySize?.toString() || '',
          location: data.location || '',
          operator: data.operator || '',
          route: data.route || '',
          departureStation: data.departureStation || '',
          arrivalStation: data.arrivalStation || '',
        })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching booking:', error)
        alert('Failed to load booking. Please try again.')
        router.back()
      }
    }

    fetchBooking()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Build type-specific data based on booking type
      let typeSpecificData: any = {}

      switch (formData.type) {
        case 'FLIGHT':
          typeSpecificData = {
            airline: formData.airline,
            flightNumber: formData.flightNumber,
            departureAirport: formData.departureAirport,
            arrivalAirport: formData.arrivalAirport,
          }
          break
        case 'ACCOMMODATION':
          typeSpecificData = {
            propertyName: formData.propertyName,
            address: formData.address,
          }
          break
        case 'CAR_RENTAL':
          typeSpecificData = {
            company: formData.company,
            pickupLocation: formData.pickupLocation,
            dropoffLocation: formData.dropoffLocation,
          }
          break
        case 'RESTAURANT':
          typeSpecificData = {
            name: formData.name,
            address: formData.address,
            partySize: formData.partySize ? parseInt(formData.partySize) : undefined,
          }
          break
        case 'ACTIVITY':
          typeSpecificData = {
            name: formData.name,
            location: formData.location,
          }
          break
        case 'TRANSPORT':
          typeSpecificData = {
            operator: formData.operator,
            route: formData.route,
            departureStation: formData.departureStation,
            arrivalStation: formData.arrivalStation,
          }
          break
      }

      const bookingData = {
        type: formData.type,
        date: formData.date,
        time: formData.time || undefined,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        confirmationNumber: formData.confirmationNumber || undefined,
        notes: formData.notes || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        city: formData.city || undefined,
        mealType: formData.mealType || undefined,
        isAllDay: formData.isAllDay || undefined,
        typeSpecificData,
      }

      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      if (tripId) {
        router.push(`/trips/${tripId}`)
      } else {
        router.back()
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'FLIGHT':
        return (
          <>
            <Input
              label="Airline"
              type="text"
              required
              value={formData.airline}
              onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              placeholder="Delta"
            />
            <Input
              label="Flight Number"
              type="text"
              required
              value={formData.flightNumber}
              onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
              placeholder="DL123"
            />
            <Input
              label="Departure Airport"
              type="text"
              required
              value={formData.departureAirport}
              onChange={(e) => setFormData({ ...formData, departureAirport: e.target.value })}
              placeholder="JFK"
            />
            <Input
              label="Arrival Airport"
              type="text"
              required
              value={formData.arrivalAirport}
              onChange={(e) => setFormData({ ...formData, arrivalAirport: e.target.value })}
              placeholder="NRT"
            />
          </>
        )
      case 'ACCOMMODATION':
        return (
          <>
            <Input
              label="Property Name"
              type="text"
              required
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              placeholder="Hotel Name"
            />
            <Input
              label="Address"
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, Tokyo"
            />
          </>
        )
      case 'CAR_RENTAL':
        return (
          <>
            <Input
              label="Company"
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Hertz"
            />
            <Input
              label="Pickup Location"
              type="text"
              required
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              placeholder="Airport Terminal 1"
            />
            <Input
              label="Dropoff Location"
              type="text"
              required
              value={formData.dropoffLocation}
              onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
              placeholder="Downtown Office"
            />
          </>
        )
      case 'RESTAURANT':
        return (
          <>
            <Input
              label="Restaurant Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Sushi Restaurant"
            />
            <Input
              label="Address"
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="456 Food St, Tokyo"
            />
            <Input
              label="Party Size"
              type="number"
              value={formData.partySize}
              onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
              placeholder="2"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Meal Type <span className="text-gray-400 text-xs">(auto-detected)</span>
              </label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value as MealType | '' })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">None</option>
                <option value={MealType.BREAKFAST}>Breakfast</option>
                <option value={MealType.LUNCH}>Lunch</option>
                <option value={MealType.DINNER}>Dinner</option>
              </select>
            </div>
          </>
        )
      case 'ACTIVITY':
        return (
          <>
            <Input
              label="Activity Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tokyo Tower Tour"
            />
            <Input
              label="Location"
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Tokyo Tower, Minato"
            />
          </>
        )
      case 'TRANSPORT':
        return (
          <>
            <Input
              label="Operator"
              type="text"
              required
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              placeholder="JR East"
            />
            <Input
              label="Route"
              type="text"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              placeholder="Narita Express"
            />
            <Input
              label="Departure Station"
              type="text"
              required
              value={formData.departureStation}
              onChange={(e) => setFormData({ ...formData, departureStation: e.target.value })}
              placeholder="Narita Airport"
            />
            <Input
              label="Arrival Station"
              type="text"
              required
              value={formData.arrivalStation}
              onChange={(e) => setFormData({ ...formData, arrivalStation: e.target.value })}
              placeholder="Tokyo Station"
            />
          </>
        )
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Loading booking...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Booking Type */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Booking Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as BookingType })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="FLIGHT">Flight</option>
                  <option value="ACCOMMODATION">Accommodation</option>
                  <option value="CAR_RENTAL">Car Rental</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="ACTIVITY">Activity</option>
                  <option value="TRANSPORT">Train/Bus</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <Input
                  label="Time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* End Date/Time (for accommodations and car rentals) */}
              {(formData.type === 'ACCOMMODATION' || formData.type === 'CAR_RENTAL') && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              )}

              {/* City field */}
              <Input
                label="City"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Tokyo"
              />

              {/* Type-specific fields */}
              {renderTypeSpecificFields()}

              {/* Universal fields */}
              <Input
                label="Confirmation Number"
                type="text"
                value={formData.confirmationNumber}
                onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
                placeholder="ABC123XYZ"
              />

              <Input
                label="Cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Booking'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
