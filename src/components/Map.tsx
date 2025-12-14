'use client'

import { useEffect, useRef, useState } from 'react'

interface MapProps {
  location: string
  className?: string
}

// Declare google maps types
declare global {
  interface Window {
    google: any
    googleMapsScriptLoading?: Promise<void>
  }
}

// Script loading utility with singleton pattern
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  // Check if already loaded
  if (typeof window !== 'undefined' && window.google?.maps) {
    return Promise.resolve()
  }

  // Check if script is currently loading
  if (window.googleMapsScriptLoading) {
    return window.googleMapsScriptLoading
  }

  // Start loading the script
  const loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      window.googleMapsScriptLoading = undefined
      resolve()
    }
    script.onerror = () => {
      window.googleMapsScriptLoading = undefined
      reject(new Error('Failed to load Google Maps script'))
    }
    document.head.appendChild(script)
  })

  // Store the loading promise so other components can wait for it
  window.googleMapsScriptLoading = loadPromise
  return loadPromise
}

export default function Map({ location, className = '' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer to detect when map is visible
  useEffect(() => {
    if (!mapRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Once visible, disconnect the observer
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before the map is visible
        threshold: 0.1,
      }
    )

    if (mapRef.current) {
      observerRef.current.observe(mapRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Only initialize map when it becomes visible
  useEffect(() => {
    if (!isVisible) return

    let isMounted = true

    const initMap = async () => {
      if (!mapRef.current) return

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        if (isMounted) {
          setError('Google Maps API key not configured')
          setIsLoading(false)
        }
        return
      }

      try {
        // Load Google Maps script (will reuse if already loaded/loading)
        await loadGoogleMapsScript(apiKey)

        if (!isMounted || !mapRef.current) return

        // Now window.google is available
        const geocoder = new window.google.maps.Geocoder()

        // Geocode the location
        geocoder.geocode({ address: location }, (results: any, status: string) => {
          if (!isMounted || !mapRef.current) return

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
            const marker = new window.google.maps.Marker({
              position: position,
              map: map,
              title: location,
            })

            mapInstanceRef.current = map
            markerInstanceRef.current = marker

            if (isMounted) {
              setIsLoading(false)
            }
          } else {
            console.error('Geocoding failed:', status, 'for location:', location)
            if (isMounted) {
              setError('Location not found')
              setIsLoading(false)
            }
          }
        })
      } catch (err) {
        console.error('Error loading map:', err)
        if (isMounted) {
          setError('Failed to load map')
          setIsLoading(false)
        }
      }
    }

    initMap()

    // Cleanup function
    return () => {
      isMounted = false
      // Clean up map and marker instances if they exist
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null)
        markerInstanceRef.current = null
      }
      mapInstanceRef.current = null
    }
  }, [location, isVisible])

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
