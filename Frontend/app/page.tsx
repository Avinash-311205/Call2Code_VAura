"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Volume2, Moon, Sun, Locate, Route, Search, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { VoiceInput } from "@/components/voice-input"
import { InteractiveMap as LeafletMap } from "@/components/interactive-map"
import { MonumentCard } from "@/components/monument-card"
import { FloatingAvatarTutorial } from "@/components/floating-avatar-tutorial"

interface Monument {
  id: number
  name: string
  summary: string
  description: string
  coordinates: { lat: number; lng: number }
  image?: string
  category: string
  audioUrl?: string
}

interface Fact {
  title: string
  description: string
  icon: string
  source?: string
}

interface RouteData {
  polyline: { lat: number; lng: number }[]
  monuments: Monument[]
  distance: string
  duration: string
  facts?: Fact[]
}

const languages = [
  { code: "en-US", name: "English", flag: "🇬🇧" },
  { code: "hi-IN", name: "हिंदी", flag: "🇮🇳" },
  { code: "ta-IN", name: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", name: "తెలుగు", flag: "🇮🇳" },
  { code: "ml-IN", name: "മലയാളം", flag: "🇮🇳" },
  { code: "kn-IN", name: "ಕನ್ನಡ", flag: "🇮🇳" },
]

export default function GeoNarrator() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [selectedMonument, setSelectedMonument] = useState<number | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSpeakingId, setCurrentSpeakingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceInputActive, setIsVoiceInputActive] = useState<"origin" | "destination" | null>(null)
  const [mounted, setMounted] = useState(false)

  const { theme, setTheme } = useTheme()
  const monumentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Handle mounting for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Geocoding function to get coordinates from place name
  const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Using OpenStreetMap Nominatim API for geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  // Generate route points between two coordinates
  const generateRoutePoints = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const points = []
    const steps = 10 // Number of intermediate points

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps
      const lat = start.lat + (end.lat - start.lat) * ratio
      const lng = start.lng + (end.lng - start.lng) * ratio
      points.push({ lat, lng })
    }

    return points
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((end.lat - start.lat) * Math.PI) / 180
    const dLng = ((end.lng - start.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start.lat * Math.PI) / 180) *
        Math.cos((end.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  // Generate mock monuments near the route
  const generateMockMonuments = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const monuments = []
    const monumentCount = 3

    for (let i = 0; i < monumentCount; i++) {
      const ratio = (i + 1) / (monumentCount + 1)
      const baseLat = start.lat + (end.lat - start.lat) * ratio
      const baseLng = start.lng + (end.lng - start.lng) * ratio

      // Add some random offset to make monuments appear near but not exactly on the route
      const offsetLat = (Math.random() - 0.5) * 0.02
      const offsetLng = (Math.random() - 0.5) * 0.02

      monuments.push({
        id: i + 1,
        name: `Historic Site ${i + 1}`,
        summary: getLocalizedText(`A significant historical landmark along your route`, selectedLanguage),
        description: getLocalizedText(
          `This historic site represents an important part of the region's cultural heritage and offers fascinating insights into the local history.`,
          selectedLanguage,
        ),
        coordinates: {
          lat: baseLat + offsetLat,
          lng: baseLng + offsetLng,
        },
        image: "/placeholder.svg?height=200&width=300",
        category: getLocalizedText("Historical Site", selectedLanguage),
      })
    }

    return monuments
  }

  // Web Speech API setup with language support
  const speak = (text: string, monumentId: number) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLanguage
      utterance.rate = 0.8
      utterance.pitch = 1.0

      utterance.onstart = () => {
        setIsSpeaking(true)
        setCurrentSpeakingId(monumentId)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setCurrentSpeakingId(null)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setCurrentSpeakingId(null)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setCurrentSpeakingId(null)
    }
  }

  // Get user location
  const useMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setOrigin(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please check your browser permissions.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  // Handle route search
  const handleSearch = async () => {
    if (!origin || !destination) return

    setIsLoading(true)
    try {
      // Geocode both locations
      const [originCoords, destinationCoords] = await Promise.all([
        geocodeLocation(origin),
        geocodeLocation(destination),
      ])

      if (!originCoords || !destinationCoords) {
        alert("Could not find one or both locations. Please check your spelling and try again.")
        setIsLoading(false)
        return
      }

      // Generate route points
      const routePoints = generateRoutePoints(originCoords, destinationCoords)

      // Calculate distance and estimated duration
      const distance = calculateDistance(originCoords, destinationCoords)
      const estimatedDuration = Math.round((distance / 60) * 60) // Rough estimate: 60 km/h average speed

      // Generate mock monuments along the route
      const monuments = generateMockMonuments(originCoords, destinationCoords)

      const routeData: RouteData = {
        polyline: routePoints,
        monuments: monuments,
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.floor(estimatedDuration / 60)}h ${estimatedDuration % 60}m`,
        facts: [
          {
            title: "Geographic Location",
            description: `Your route spans from ${origin} to ${destination}, covering diverse geographical features.`,
            icon: "🌍",
            source: "GeoNarrator Database",
          },
          {
            title: "Cultural Heritage",
            description: "The region along your route has rich cultural significance and historical importance.",
            icon: "📚",
            source: "GeoNarrator Database",
          },
          {
            title: "Local Architecture",
            description:
              "Various architectural styles can be observed in the buildings and structures along this route.",
            icon: "🏛️",
            source: "GeoNarrator Database",
          },
          {
            title: "Natural Features",
            description: "The landscape includes interesting natural formations and geographical features.",
            icon: "🏔️",
            source: "GeoNarrator Database",
          },
          {
            title: "Transportation History",
            description: "This route has been an important transportation corridor throughout history.",
            icon: "🛤️",
            source: "GeoNarrator Database",
          },
          {
            title: "Modern Development",
            description: "Contemporary development along this route reflects modern urban planning principles.",
            icon: "🏙️",
            source: "GeoNarrator Database",
          },
        ],
      }

      setRouteData(routeData)
    } catch (error) {
      console.error("Error fetching route:", error)
      alert("Failed to fetch route data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle monument selection
  const handleMonumentClick = (monumentId: number) => {
    setSelectedMonument(monumentId)
    const monumentElement = monumentRefs.current[monumentId]
    if (monumentElement) {
      monumentElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Handle map marker click
  const handleMapMarkerClick = (monumentId: number) => {
    setSelectedMonument(monumentId)
    // Scroll to monument card below the map
    setTimeout(() => {
      const monumentElement = monumentRefs.current[monumentId]
      if (monumentElement) {
        monumentElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  // Handle voice input result
  const handleVoiceResult = (text: string, field: "origin" | "destination") => {
    if (field === "origin") {
      setOrigin(text)
    } else {
      setDestination(text)
    }
    setIsVoiceInputActive(null)
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MapPin className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  GeoNarrator
                </h1>
                <p className="text-xs text-muted-foreground">
                  {getLocalizedText("Discover stories along your journey", selectedLanguage)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage} id="language-selector">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dark Mode Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark"
                  setTheme(newTheme)
                }}
                aria-label="Toggle dark mode"
                className="relative overflow-hidden"
                id="theme-toggle"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Form */}
      <div className="border-b bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Origin Input */}
              <div className="relative" id="origin-input">
                <label htmlFor="origin" className="block text-sm font-medium mb-2">
                  {getLocalizedText("From", selectedLanguage)}
                </label>
                <div className="relative">
                  <Input
                    id="origin"
                    placeholder={getLocalizedText("Enter starting location...", selectedLanguage)}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <VoiceInput
                      onResult={(text) => handleVoiceResult(text, "origin")}
                      isActive={isVoiceInputActive === "origin"}
                      onActiveChange={(active) => setIsVoiceInputActive(active ? "origin" : null)}
                      language={selectedLanguage}
                    />
                    <Button variant="ghost" size="sm" onClick={useMyLocation} aria-label="Use my current location">
                      <Locate className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Destination Input */}
              <div className="relative" id="destination-input">
                <label htmlFor="destination" className="block text-sm font-medium mb-2">
                  {getLocalizedText("To", selectedLanguage)}
                </label>
                <div className="relative">
                  <Input
                    id="destination"
                    placeholder={getLocalizedText("Enter destination...", selectedLanguage)}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pr-12"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceInput
                      onResult={(text) => handleVoiceResult(text, "destination")}
                      isActive={isVoiceInputActive === "destination"}
                      onActiveChange={(active) => setIsVoiceInputActive(active ? "destination" : null)}
                      language={selectedLanguage}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSearch}
                disabled={!origin || !destination || isLoading}
                size="lg"
                className="min-w-40"
                id="search-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {getLocalizedText("Finding Route...", selectedLanguage)}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    {getLocalizedText("Explore Route", selectedLanguage)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {routeData && (
        <div className="w-full">
          {/* Map Area */}
          <div className="w-full h-[60vh] relative" id="map-area">
            <LeafletMap
              polyline={routeData.polyline}
              monuments={routeData.monuments}
              selectedMonument={selectedMonument}
              onMarkerClick={handleMapMarkerClick}
              origin={origin}
              destination={destination}
            />

            {/* Route Info Overlay */}
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Route className="h-4 w-4 text-primary" />
                  <span className="font-medium">{routeData.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Navigation className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{routeData.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monuments Section Below Map */}
          <div className="bg-card/30 backdrop-blur-sm border-t">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold">{getLocalizedText("Monuments Along Route", selectedLanguage)}</h2>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {routeData.monuments.length} {getLocalizedText("found", selectedLanguage)}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="monument-cards">
                  {routeData.monuments.map((monument) => (
                    <MonumentCard
                      key={monument.id}
                      monument={monument}
                      isSelected={selectedMonument === monument.id}
                      isSpeaking={currentSpeakingId === monument.id && isSpeaking}
                      onClick={() => handleMonumentClick(monument.id)}
                      onSpeak={() => speak(`${monument.name}. ${monument.summary}`, monument.id)}
                      onStopSpeaking={stopSpeaking}
                      ref={(el) => (monumentRefs.current[monument.id] = el)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Facts Section */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-t">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold">{getLocalizedText("Interesting Facts", selectedLanguage)}</h2>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {getLocalizedText("From Our Database", selectedLanguage)}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="facts-cards">
                  {routeData.facts?.map((fact, index) => (
                    <Card
                      key={index}
                      className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card/80 backdrop-blur-sm"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <span className="text-2xl">{fact.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                              {getLocalizedText(fact.title, selectedLanguage)}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                              {getLocalizedText(fact.description, selectedLanguage)}
                            </p>
                            {fact.source && (
                              <p className="text-xs text-primary/70 mt-2 italic">
                                {getLocalizedText("Source", selectedLanguage)}: {fact.source}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) ||
                    // Placeholder facts when no backend data
                    Array.from({ length: 6 }, (_, index) => (
                      <Card
                        key={index}
                        className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card/80 backdrop-blur-sm"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                              <span className="text-2xl">{["🏛️", "📚", "🎨", "⚡", "🌟", "🔍"][index]}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                {getLocalizedText(
                                  [
                                    "Historical Architecture",
                                    "Cultural Heritage",
                                    "Artistic Significance",
                                    "Modern Innovations",
                                    "Hidden Gems",
                                    "Research Insights",
                                  ][index],
                                  selectedLanguage,
                                )}
                              </h3>
                              <p className="text-muted-foreground leading-relaxed text-sm">
                                {getLocalizedText(
                                  [
                                    "Many historical buildings along your route showcase unique architectural styles from different eras.",
                                    "The cultural significance of these monuments reflects the rich heritage of the region.",
                                    "Several locations feature remarkable artistic works and sculptures worth exploring.",
                                    "Modern technology helps preserve and present these historical sites to visitors.",
                                    "There are lesser-known spots along your route with fascinating stories to discover.",
                                    "Ongoing archaeological research continues to reveal new insights about these places.",
                                  ][index],
                                  selectedLanguage,
                                )}
                              </p>
                              <p className="text-xs text-primary/70 mt-2 italic">
                                {getLocalizedText("Source", selectedLanguage)}: GeoNarrator Database
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome State */}
      {!routeData && !isLoading && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="relative inline-block mb-8">
              <Navigation className="h-32 w-32 mx-auto text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {getLocalizedText("Discover Stories Along Your Journey", selectedLanguage)}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {getLocalizedText(
                "Enter your starting point and destination to explore historical landmarks and monuments along your route with immersive audio narration in multiple Indian languages.",
                selectedLanguage,
              )}
            </p>

            {/* Additional descriptive text */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="bg-card/50 p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    {getLocalizedText("How It Works", selectedLanguage)}
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{getLocalizedText("Enter your starting location and destination", selectedLanguage)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>
                        {getLocalizedText("Discover monuments and landmarks along your route", selectedLanguage)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>
                        {getLocalizedText("Listen to audio narration in your preferred language", selectedLanguage)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{getLocalizedText("Explore fascinating facts about the region", selectedLanguage)}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-card/50 p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    {getLocalizedText("Features", selectedLanguage)}
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🗺️</span>
                      <span>{getLocalizedText("Interactive maps with route visualization", selectedLanguage)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🎤</span>
                      <span>{getLocalizedText("Voice input for hands-free navigation", selectedLanguage)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🌍</span>
                      <span>{getLocalizedText("Support for 6 Indian languages", selectedLanguage)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">📚</span>
                      <span>{getLocalizedText("Rich historical facts and information", selectedLanguage)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{getLocalizedText("Interactive Maps", selectedLanguage)}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getLocalizedText(
                    "Visualize your route with clickable landmarks and detailed monument markers. See your path clearly with smooth polylines and interactive elements.",
                    selectedLanguage,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Volume2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{getLocalizedText("Audio Narration", selectedLanguage)}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getLocalizedText(
                    "Listen to engaging stories about historical sites with natural voice synthesis. Each monument comes with rich audio descriptions in your language.",
                    selectedLanguage,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Volume2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{getLocalizedText("Voice Input", selectedLanguage)}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getLocalizedText(
                    "Simply speak your destinations using advanced voice recognition for hands-free navigation. Perfect for when you're on the go.",
                    selectedLanguage,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                {getLocalizedText("Ready to Start Your Journey?", selectedLanguage)}
              </h3>
              <p className="text-muted-foreground mb-6">
                {getLocalizedText(
                  "Enter your locations above and let Ravi guide you through the fascinating history along your route.",
                  selectedLanguage,
                )}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {getLocalizedText("Free to use", selectedLanguage)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {getLocalizedText("No registration required", selectedLanguage)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {getLocalizedText("Works offline", selectedLanguage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Avatar */}
      <FloatingAvatarTutorial language={selectedLanguage} />
    </div>
  )
}

// Localization function with Indian languages
function getLocalizedText(text: string, language: string): string {
  const translations: { [key: string]: { [key: string]: string } } = {
    "Discover stories along your journey": {
      "hi-IN": "अपनी यात्रा के दौरान कहानियों की खोज करें",
      "ta-IN": "உங்கள் பயணத்தில் கதைகளைக் கண்டறியுங்கள்",
      "te-IN": "మీ ప్రయాణంలో కథలను కనుగొంటోంది...",
      "ml-IN": "നിങ്ങളുടെ യാത്രയിൽ കഥകൾ കണ്ടെത്തുക",
      "kn-IN": "ನಿಮ್ಮ ಪ್ರಯಾಣದಲ್ಲಿ ಕಥೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ",
    },
    From: {
      "hi-IN": "से",
      "ta-IN": "இருந்து",
      "te-IN": "నుండి",
      "ml-IN": "നിന്ന്",
      "kn-IN": "ಇಂದ",
    },
    To: {
      "hi-IN": "तक",
      "ta-IN": "வரை",
      "te-IN": "వరకు",
      "ml-IN": "വരെ",
      "kn-IN": "ವರೆಗೆ",
    },
    "Enter starting location...": {
      "hi-IN": "प्रारंभिक स्थान दर्ज करें...",
      "ta-IN": "தொடக்க இடத்தை உள்ளிடவும்...",
      "te-IN": "ప్రారంభ స్థానాన్ని నమోదు చేయండి...",
      "ml-IN": "ആരംഭ സ്ഥലം നൽകുക...",
      "kn-IN": "ಆರಂಭಿಕ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ...",
    },
    "Enter destination...": {
      "hi-IN": "गंतव्य दर्ज करें...",
      "ta-IN": "இலக்கை உள்ளிடவும்...",
      "te-IN": "గమ్యస్థానాన్ని నమోదు చేయండి...",
      "ml-IN": "ലക്‌ഷ്യസ്ഥാനം നൽകുക...",
      "kn-IN": "ಗಮ್ಯಸ್ಥಾನವನ್ನು ನಮೂದಿಸಿ...",
    },
    "Finding Route...": {
      "hi-IN": "मार्ग खोजा जा रहा है...",
      "ta-IN": "பாதையைக் கண்டறிகிறது...",
      "te-IN": "మార్గాన్ని కనుగొంటోంది...",
      "ml-IN": "റൂട്ട് കണ്ടെത്തുന്നു...",
      "kn-IN": "ಮಾರ್ಗವನ್ನು ಹುಡುಕುತ್ತಿದೆ...",
    },
    "Explore Route": {
      "hi-IN": "मार्ग का अन्वेषण करें",
      "ta-IN": "பாதையை ஆராயுங்கள்",
      "te-IN": "మార్గాన్ని అన్వేషించండి",
      "ml-IN": "റൂട്ട് പര്യവേക്ഷണം ചെയ്യുക",
      "kn-IN": "ಮಾರ್ಗವನ್ನು ಅನ್ವೇಷಿಸಿ",
    },
    "Monuments Along Route": {
      "hi-IN": "मार्ग के साथ स्मारक",
      "ta-IN": "பாதையில் உள்ள நினைவுச்சின்னங்கள்",
      "te-IN": "మార్గంలో ఉన్న స్మారకాలు",
      "ml-IN": "റൂട്ടിലെ സ്മാരകങ്ങൾ",
      "kn-IN": "ಮಾರ್ಗದಲ್ಲಿನ ಸ್ಮಾರಕಗಳು",
    },
    found: {
      "hi-IN": "मिले",
      "ta-IN": "கண்டறியப்பட்டது",
      "te-IN": "దొరికాయి",
      "ml-IN": "കണ്ടെത്തി",
      "kn-IN": "ಕಂಡುಬಂದಿದೆ",
    },
    "Historical Site": {
      "hi-IN": "ऐतिहासिक स्थल",
      "ta-IN": "வரலாற்று இடம்",
      "te-IN": "చారిత్రక ప్రదేశం",
      "ml-IN": "ചരിത്രപരമായ സ്ഥലം",
      "kn-IN": "ಐತಿಹಾಸಿಕ ಸ್ಥಳ",
    },
    "A significant historical landmark along your route": {
      "hi-IN": "आपके मार्ग के साथ एक महत्वपूर्ण ऐतिहासिक स्थल",
      "ta-IN": "உங்கள் பாதையில் ஒரு முக்கியமான வரலாற்று அடையாளம்",
      "te-IN": "మీ మార్గంలో ఒక ముఖ్యమైన చారిత్రక మైలురాయి",
      "ml-IN": "നിങ്ങളുടെ റൂട്ടിലെ ഒരു പ്രധാന ചരിത്രപരമായ ലാൻഡ്മാർക്ക്",
      "kn-IN": "ನಿಮ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಒಂದು ಮಹತ್ವದ ಐತಿಹಾಸಿಕ ಹೆಗ್ಗುರುತು",
    },
    "This historic site represents an important part of the region's cultural heritage and offers fascinating insights into the local history.":
      {
        "hi-IN":
          "यह ऐतिहासिक स्थल क्षेत्र की सांस्कृतिक विरासत का एक महत्वपूर्ण हिस्सा है और स्थानीय इतिहास में आकर्षक अंतर्दृष्टि प्रदान करता है।",
        "ta-IN":
          "இந்த வரலாற்று தளம் பிராந்தியத்தின் கலாச்சார பாரம்பரியத்தின் ஒரு முக்கிய பகுதியைக் குறிக்கிறது மற்றும் உள்ளூர் வரலாற்றில் கவர்ச்சிகரமான நுண்ணறிவுகளை வழங்குகிறது.",
        "te-IN":
          "ఈ చారిత్రక ప్రదేశం ప్రాంతం యొక్క సాంస్కృతిక వారసత్వంలో ఒక ముఖ్యమైన భాగాన్ని సూచిస్తుంది మరియు స్థానిక చరిత్రలో ఆకర్షణీయమైన అంతర్దృష్టులను అందిస్తుంది.",
        "ml-IN":
          "ഈ ചരിത്രപരമായ സൈറ്റ് പ്രദേശത്തിന്റെ സാംസ്കാരിക പൈതൃകത്തിന്റെ ഒരു പ്രധാന ഭാഗത്തെ പ്രതിനിധീകരിക്കുന്നു കൂടാതെ പ്രാദേശിക ചരിത്രത്തിലേക്ക് ആകർഷകമായ ഉൾക്കാഴ്ചകൾ നൽകുന്നു.",
        "kn-IN":
          "ಈ ಐತಿಹಾಸಿಕ ಸ್ಥಳವು ಪ್ರದೇಶದ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆಯ ಒಂದು ಪ್ರಮುಖ ಭಾಗವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ ಮತ್ತು ಸ್ಥಳೀಯ ಇತಿಹಾಸದಲ್ಲಿ ಆಕರ್ಷಕ ಒಳನೋಟಗಳನ್ನು ನೀಡುತ್ತದೆ.",
      },
    // Add more translations as needed...
  }

  // Return the translation if it exists; otherwise fall back to the original text
  return translations[text]?.[language] || text
}
