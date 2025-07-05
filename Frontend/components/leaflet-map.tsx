"use client"

import { useEffect, useRef } from "react"

interface Monument {
  id: number
  name: string
  coordinates: { lat: number; lng: number }
  category: string
}

interface LeafletMapProps {
  polyline: { lat: number; lng: number }[]
  monuments: Monument[]
  selectedMonument: number | null
  onMarkerClick: (monumentId: number) => void
  origin: string
  destination: string
}

export function LeafletMap({
  polyline,
  monuments,
  selectedMonument,
  onMarkerClick,
  origin,
  destination,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<{ [key: number]: any }>({})

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Initialize map if not already done
      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current).setView([40.7589, -73.9851], 13)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        mapInstanceRef.current = map
      }

      const map = mapInstanceRef.current

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => {
        map.removeLayer(marker)
      })
      markersRef.current = {}

      // Add polyline if exists
      if (polyline.length > 0) {
        const polylineLayer = L.polyline(
          polyline.map((point) => [point.lat, point.lng]),
          {
            color: "#3b82f6",
            weight: 4,
            opacity: 0.8,
            dashArray: "10, 5",
          },
        ).addTo(map)

        // Fit map to polyline bounds
        map.fitBounds(polylineLayer.getBounds(), { padding: [20, 20] })

        // Add start marker
        const startIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full border-3 border-white shadow-lg">
                   <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                   </svg>
                 </div>`,
          className: "custom-div-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        L.marker([polyline[0].lat, polyline[0].lng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<strong>Start:</strong> ${origin}`)

        // Add end marker
        const endIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full border-3 border-white shadow-lg">
                   <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                   </svg>
                 </div>`,
          className: "custom-div-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        L.marker([polyline[polyline.length - 1].lat, polyline[polyline.length - 1].lng], { icon: endIcon })
          .addTo(map)
          .bindPopup(`<strong>End:</strong> ${destination}`)
      }

      // Add monument markers
      monuments.forEach((monument) => {
        const isSelected = selectedMonument === monument.id

        const monumentIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
            isSelected
              ? "bg-blue-600 text-white scale-125 animate-bounce"
              : "bg-red-500 text-white hover:bg-red-600 hover:scale-110"
          }">
                   <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                   </svg>
                 </div>
                 ${
                   isSelected
                     ? `<div class="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap border">
                          ${monument.name}
                        </div>`
                     : ""
                 }`,
          className: "custom-div-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([monument.coordinates.lat, monument.coordinates.lng], { icon: monumentIcon })
          .addTo(map)
          .bindPopup(
            `<div class="p-2">
               <h3 class="font-semibold text-sm mb-1">${monument.name}</h3>
               <p class="text-xs text-gray-600 mb-2">${monument.category}</p>
               <p class="text-xs">${monument.coordinates.lat.toFixed(4)}, ${monument.coordinates.lng.toFixed(4)}</p>
             </div>`,
          )
          .on("click", () => {
            onMarkerClick(monument.id)
          })

        markersRef.current[monument.id] = marker

        // Open popup for selected monument
        if (isSelected) {
          marker.openPopup()
        }
      })
    }

    initMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [polyline, monuments, selectedMonument, onMarkerClick, origin, destination])

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
    </>
  )
}
