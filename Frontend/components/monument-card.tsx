"use client"

import type React from "react"

import { forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Volume2, VolumeX, MapPin } from "lucide-react"
import Image from "next/image"

interface Monument {
  id: number
  name: string
  summary: string
  description: string
  coordinates: { lat: number; lng: number }
  image?: string
  category: string
}

interface MonumentCardProps {
  monument: Monument
  isSelected: boolean
  isSpeaking: boolean
  onClick: () => void
  onSpeak: () => void
  onStopSpeaking: () => void
}

export const MonumentCard = forwardRef<HTMLDivElement, MonumentCardProps>(
  ({ monument, isSelected, isSpeaking, onClick, onSpeak, onStopSpeaking }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onClick()
      }
    }

    return (
      <Card
        ref={ref}
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg group ${
          isSelected ? "ring-2 ring-primary shadow-lg scale-[1.02] bg-primary/5" : "hover:shadow-md hover:scale-[1.01]"
        }`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Select ${monument.name} monument`}
      >
        <CardContent className="p-0">
          <div className="relative">
            {/* Image */}
            <div className="relative h-32 overflow-hidden rounded-t-lg">
              <Image
                src={monument.image || "/placeholder.svg?height=128&width=400"}
                alt={monument.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Category Badge */}
              <Badge variant="secondary" className="absolute top-2 left-2 text-xs bg-black/50 text-white border-0">
                {monument.category}
              </Badge>

              {/* Selected Indicator */}
              {isSelected && <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse" />}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {monument.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{monument.summary}</p>

                  {/* Coordinates */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {monument.coordinates.lat.toFixed(4)}, {monument.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Speaker Button */}
                <Button
                  size="sm"
                  variant={isSpeaking ? "default" : "outline"}
                  className={`flex-shrink-0 transition-all duration-200 ${
                    isSpeaking
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isSpeaking) {
                      onStopSpeaking()
                    } else {
                      onSpeak()
                    }
                  }}
                  aria-label={
                    isSpeaking ? `Stop narration for ${monument.name}` : `Play narration for ${monument.name}`
                  }
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

MonumentCard.displayName = "MonumentCard"
