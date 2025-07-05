export interface Landmark {
  id: number
  name: string
  description: string
  coordinates: { lat: number; lng: number }
  image?: string
  category: string
}
