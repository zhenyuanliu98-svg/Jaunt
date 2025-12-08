'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapProps {
  location: string
  className?: string
}

export default function Map({ location, className = '' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        setError('Google Maps API key not configured')
        setIsLoading(false)
        return
      }

      try {
        // Load Google Maps API
        const loader = new Loader({
          apiKey,
          version: 'weekly',
        })

        // Use the load method which returns the google object
        const loadPromise = (loader as any).load()
        await loadPromise

        // Now window.google is available
        const geocoder = new window.google.maps.Geocoder()

        // Geocode the location
        geocoder.geocode({ address: location }, (results: any, status: string) => {
          if (status === 'OK' && results && results[0]) {
            const position = results[0].geometry.location

            // Create map
            const map = new window.google.maps.Map(mapRef.current!, {
              center: position,
              zoom: 15,
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            })

            // Add marker
            new window.google.maps.Marker({
              position: position,
              map: map,
              title: location,
            })

            setIsLoading(false)
          } else {
            setError('Location not found')
            setIsLoading(false)
          }
        })
      } catch (err) {
        console.error('Error loading map:', err)
        setError('Failed to load map')
        setIsLoading(false)
      }
    }

    initMap()
  }, [location])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-sm text-gray-500">Loading map...</div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  )
}
