"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Compass, Home, Search, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  const [floatingElements, setFloatingElements] = useState<Array<{ id: number; x: number; y: number; delay: number }>>(
    [],
  )
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)

    // Generate floating map elements
    const elements = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setFloatingElements(elements)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute opacity-10 animate-float"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          >
            {element.id % 3 === 0 && <MapPin className="h-8 w-8 text-primary" />}
            {element.id % 3 === 1 && <Navigation className="h-6 w-6 text-blue-500" />}
            {element.id % 3 === 2 && <Compass className="h-7 w-7 text-green-500" />}
          </div>
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid-404" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-404)" />
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Animation */}
          <div className="relative mb-12">
            <div className="text-9xl font-bold text-primary/20 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-primary/30 rounded-full animate-spin-slow">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary animate-bounce" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Route Not Found
              </h1>
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                Looks like you've wandered off the beaten path! The page you're looking for seems to have taken a
                detour.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Lost Your Way?</h3>
                    <p className="text-xs text-muted-foreground">Let's get you back on track</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Need Directions?</h3>
                    <p className="text-xs text-muted-foreground">We'll guide you home</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="group">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                    Return Home
                  </Link>
                </Button>

                <Button variant="outline" size="lg" onClick={() => window.history.back()} className="group">
                  <RotateCcw className="h-4 w-4 mr-2 group-hover:animate-spin" />
                  Go Back
                </Button>
              </div>

              {/* Fun Message */}
              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">Fun Fact:</strong> Even the best explorers sometimes take wrong
                  turns. That's how the greatest discoveries are made! 🗺️
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Still having trouble? Here are some popular destinations:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">🏠 Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/explore">🗺️ Explore</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/about">ℹ️ About</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
