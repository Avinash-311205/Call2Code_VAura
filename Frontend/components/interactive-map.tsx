"use client"

import { LeafletMap } from "./leaflet-map"

interface Monument {
  id: number
  name: string
  coordinates: { lat: number; lng: number }
  category: string
}

interface InteractiveMapProps {
  polyline: { lat: number; lng: number }[]
  monuments: Monument[]
  selectedMonument: number | null
  onMarkerClick: (monumentId: number) => void
  origin: string
  destination: string
}

export function InteractiveMap(props: InteractiveMapProps) {
  return <LeafletMap {...props} />
}
