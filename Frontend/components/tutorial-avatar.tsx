"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"

interface TutorialStep {
  id: number
  title: string
  description: string
  highlight?: string
  position: "top" | "bottom" | "left" | "right" | "center"
  action?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to GeoNarrator! 👋",
    description:
      "Hi there! I'm Ravi, your personal guide. I'll show you how to discover amazing stories along any route you choose. Ready to explore?",
    position: "center",
  },
  {
    id: 2,
    title: "Choose Your Language 🌍",
    description:
      "First, select your preferred language from the dropdown. We support Indian languages including Hindi, Tamil, Telugu, Malayalam, and Kannada!",
    highlight: "language-selector",
    position: "top",
  },
  {
    id: 3,
    title: "Toggle Theme 🌙",
    description:
      "Prefer dark mode? Click this button to switch between light and dark themes for comfortable viewing anytime.",
    highlight: "theme-toggle",
    position: "top",
  },
  {
    id: 4,
    title: "Enter Your Starting Point 📍",
    description:
      "Type your starting location here, or click the location button to use your current position. You can even use voice input by clicking the microphone!",
    highlight: "origin-input",
    position: "bottom",
  },
  {
    id: 5,
    title: "Set Your Destination 🎯",
    description: "Enter where you want to go. The voice input feature works here too - just speak your destination!",
    highlight: "destination-input",
    position: "bottom",
  },
  {
    id: 6,
    title: "Explore Your Route 🗺️",
    description:
      "Click 'Explore Route' to discover historical monuments and landmarks along your journey. The magic happens here!",
    highlight: "search-button",
    position: "top",
  },
  {
    id: 7,
    title: "Interactive Map 🗺️",
    description:
      "Once your route loads, you'll see an interactive map with your path and monument markers. Click any marker to learn more!",
    highlight: "map-area",
    position: "right",
  },
  {
    id: 8,
    title: "Monument Cards Below 🏛️",
    description:
      "Scroll down below the map to see detailed monument cards with images and descriptions. Click the speaker button to hear stories!",
    highlight: "monument-cards",
    position: "left",
  },
  {
    id: 9,
    title: "Two-Way Sync ↔️",
    description:
      "Click a monument card to highlight it on the map, or click a map marker to scroll to its card below. Everything is connected!",
    position: "center",
  },
  {
    id: 10,
    title: "You're All Set! 🎉",
    description:
      "That's it! You're ready to discover amazing stories along any route. Start by entering your locations above. Happy exploring!",
    position: "center",
  },
]

interface TutorialAvatarProps {
  language: string
}

export function TutorialAvatar({ language }: TutorialAvatarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    // Check if user has seen tutorial
    const seen = localStorage.getItem("geonarrator-tutorial-seen")
    if (!seen) {
      setTimeout(() => {
        setIsOpen(true)
        // Auto-start speaking when tutorial opens
        setTimeout(() => {
          speak(tutorialSteps[0].description)
        }, 500)
      }, 2000) // Show after 2 seconds
    } else {
      setHasSeenTutorial(true)
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1
          if (nextStep >= tutorialSteps.length) {
            setIsPlaying(false)
            return prev
          }
          // Auto-speak when step changes
          setTimeout(() => {
            speak(tutorialSteps[nextStep].description)
          }, 500)
          return nextStep
        })
      }, 6000) // 6 seconds per step to allow for speech
    }
    return () => clearInterval(interval)
  }, [isPlaying, isOpen])

  // Auto-speak when step changes manually
  useEffect(() => {
    if (isOpen && !isPlaying) {
      setTimeout(() => {
        speak(tutorialSteps[currentStep].description)
      }, 300)
    }
  }, [currentStep, isOpen, isPlaying])

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.85
      utterance.pitch = 1.1
      utterance.volume = 0.9

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsPlaying(false)
    stopSpeaking()
    localStorage.setItem("geonarrator-tutorial-seen", "true")
    setHasSeenTutorial(true)
  }

  const handleNext = () => {
    stopSpeaking()
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    stopSpeaking()
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    stopSpeaking()
    setTimeout(() => {
      speak(tutorialSteps[0].description)
    }, 300)
  }

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      stopSpeaking()
    } else {
      setIsPlaying(true)
    }
  }

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(tutorialSteps[currentStep].description)
    }
  }

  const currentStepData = tutorialSteps[currentStep]

  // Avatar button (always visible)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => {
              speak(tutorialSteps[currentStep].description)
            }, 500)
          }}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl border-4 border-white dark:border-gray-800 transition-all duration-300 hover:scale-110"
          size="icon"
          aria-label="Open tutorial"
        >
          <div className="relative">
            {/* Indian Boy Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
              <div className="text-2xl">👨🏽</div>
            </div>
            {/* Notification dot for new users */}
            {!hasSeenTutorial && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            )}
          </div>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Highlight overlay */}
      {currentStepData.highlight && (
        <div
          className="fixed inset-0 z-45 pointer-events-none"
          style={{
            background: `radial-gradient(circle at var(--highlight-x, 50%) var(--highlight-y, 50%), transparent 100px, rgba(0,0,0,0.7) 120px)`,
          }}
        />
      )}

      {/* Tutorial Card */}
      <div
        className={`fixed z-50 transition-all duration-500 ${
          currentStepData.position === "center"
            ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            : currentStepData.position === "top"
              ? "top-20 left-1/2 transform -translate-x-1/2"
              : currentStepData.position === "bottom"
                ? "bottom-20 left-1/2 transform -translate-x-1/2"
                : currentStepData.position === "left"
                  ? "top-1/2 left-8 transform -translate-y-1/2"
                  : "top-1/2 right-8 transform -translate-y-1/2"
        }`}
      >
        <Card className="w-96 max-w-[90vw] shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center border-2 border-white shadow-lg">
                  <div className={`text-2xl ${isSpeaking ? "animate-bounce" : ""}`}>👨🏽</div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Ravi - Your Guide</h3>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close tutorial">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h4 className="text-lg font-semibold mb-3 text-primary">{currentStepData.title}</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">{currentStepData.description}</p>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlay}
                    disabled={currentStep >= tutorialSteps.length - 1}
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRestart}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSpeech}
                    className={isSpeaking ? "text-red-500 border-red-500" : ""}
                  >
                    {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentStep === 0}>
                    Previous
                  </Button>
                  <Button size="sm" onClick={handleNext}>
                    {currentStep >= tutorialSteps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pointer/Arrow for highlighted elements */}
      {currentStepData.highlight && (
        <div
          className={`fixed z-50 pointer-events-none transition-all duration-500 ${
            currentStepData.position === "top"
              ? "top-32 left-1/2 transform -translate-x-1/2"
              : currentStepData.position === "bottom"
                ? "bottom-32 left-1/2 transform -translate-x-1/2"
                : currentStepData.position === "left"
                  ? "top-1/2 left-20 transform -translate-y-1/2"
                  : "top-1/2 right-20 transform -translate-y-1/2"
          }`}
        >
          <div className="w-8 h-8 bg-orange-500 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-0 w-8 h-8 bg-orange-500 rounded-full animate-pulse" />
        </div>
      )}
    </>
  )
}
