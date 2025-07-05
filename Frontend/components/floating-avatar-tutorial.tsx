"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Volume2, VolumeX, RotateCcw } from "lucide-react"

interface TutorialStep {
  id: number
  title: string
  description: string
  highlight?: string
  position: { x: string; y: string }
  pointTo?: { x: string; y: string }
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome! 👋",
    description: "Hi! I'm Ravi, your guide. Let me show you around GeoNarrator!",
    position: { x: "50%", y: "50%" },
  },
  {
    id: 2,
    title: "Language Selection 🌍",
    description: "First, choose your language here. We support Hindi, Tamil, Telugu, Malayalam, and Kannada!",
    position: { x: "85%", y: "15%" },
    pointTo: { x: "75%", y: "8%" },
    highlight: "language-selector",
  },
  {
    id: 3,
    title: "Theme Toggle 🌙",
    description: "Switch between light and dark themes here for comfortable viewing!",
    position: { x: "90%", y: "25%" },
    pointTo: { x: "88%", y: "8%" },
    highlight: "theme-toggle",
  },
  {
    id: 4,
    title: "Starting Point 📍",
    description: "Enter your starting location here. Use the microphone for voice input or location button for GPS!",
    position: { x: "25%", y: "35%" },
    pointTo: { x: "35%", y: "28%" },
    highlight: "origin-input",
  },
  {
    id: 5,
    title: "Destination 🎯",
    description: "Set your destination here. Voice input works here too!",
    position: { x: "75%", y: "35%" },
    pointTo: { x: "65%", y: "28%" },
    highlight: "destination-input",
  },
  {
    id: 6,
    title: "Explore Route 🗺️",
    description: "Click this button to find monuments and landmarks along your journey!",
    position: { x: "50%", y: "45%" },
    pointTo: { x: "50%", y: "38%" },
    highlight: "search-button",
  },
  {
    id: 7,
    title: "Interactive Map 🗺️",
    description: "Your route appears here with clickable monument markers. Click any marker to learn more!",
    position: { x: "20%", y: "60%" },
    pointTo: { x: "50%", y: "55%" },
    highlight: "map-area",
  },
  {
    id: 8,
    title: "Monument Cards 🏛️",
    description: "Scroll down to see detailed cards for each monument with images and audio narration!",
    position: { x: "80%", y: "75%" },
    pointTo: { x: "50%", y: "80%" },
    highlight: "monument-cards",
  },
  {
    id: 9,
    title: "Interesting Facts 📚",
    description: "Below monuments, you'll find fascinating facts from our database about the region!",
    position: { x: "20%", y: "85%" },
    pointTo: { x: "50%", y: "90%" },
    highlight: "facts-cards",
  },
  {
    id: 10,
    title: "Ready to Explore! 🎉",
    description: "That's everything! Start by entering your locations above. Happy exploring!",
    position: { x: "50%", y: "50%" },
  },
]

interface FloatingAvatarTutorialProps {
  language: string
}

export function FloatingAvatarTutorial({ language }: FloatingAvatarTutorialProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem("geonarrator-tutorial-seen")
    if (!seen) {
      setTimeout(() => {
        setIsActive(true)
        setTimeout(() => {
          speak(tutorialSteps[0].description)
        }, 1000)
      }, 3000)
    } else {
      setHasSeenTutorial(true)
    }
  }, [])

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.9
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

  const handleNext = () => {
    stopSpeaking()
    if (currentStep < tutorialSteps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setTimeout(() => {
        speak(tutorialSteps[nextStep].description)
      }, 800) // Delay for avatar movement
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    stopSpeaking()
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      setTimeout(() => {
        speak(tutorialSteps[prevStep].description)
      }, 800)
    }
  }

  const handleClose = () => {
    setIsActive(false)
    stopSpeaking()
    localStorage.setItem("geonarrator-tutorial-seen", "true")
    setHasSeenTutorial(true)
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setIsActive(true)
    setTimeout(() => {
      speak(tutorialSteps[0].description)
    }, 800)
  }

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(tutorialSteps[currentStep].description)
    }
  }

  const currentStepData = tutorialSteps[currentStep]

  // Avatar button when not active
  if (!isActive && isVisible) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => {
            setIsActive(true)
            setTimeout(() => {
              speak(tutorialSteps[currentStep].description)
            }, 500)
          }}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl border-4 border-white dark:border-gray-800 transition-all duration-300 hover:scale-110"
          size="icon"
          aria-label="Start tutorial"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
              <div className="text-2xl">👨🏽</div>
            </div>
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

  // Active tutorial state
  if (!isActive) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Highlight effect */}
      {currentStepData.highlight && (
        <div className="fixed inset-0 z-45 pointer-events-none">
          <style jsx>{`
            .highlight-${currentStepData.highlight} {
              box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.6), 0 0 0 8px rgba(249, 115, 22, 0.3);
              border-radius: 8px;
              animation: pulse-highlight 2s infinite;
            }
            @keyframes pulse-highlight {
              0%, 100% { box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.6), 0 0 0 8px rgba(249, 115, 22, 0.3); }
              50% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.8), 0 0 0 12px rgba(249, 115, 22, 0.2); }
            }
          `}</style>
        </div>
      )}

      {/* Floating Avatar */}
      <div
        className="fixed z-50 transition-all duration-1000 ease-in-out"
        style={{
          left: currentStepData.position.x,
          top: currentStepData.position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Speech Bubble */}
        <div className="relative mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl border-2 border-orange-200 dark:border-orange-800 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1}/{tutorialSteps.length}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSpeech}
                  className={`h-6 w-6 p-0 ${isSpeaking ? "text-red-500" : ""}`}
                >
                  {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <h4 className="font-semibold text-sm mb-2 text-orange-600 dark:text-orange-400">{currentStepData.title}</h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {currentStepData.description}
            </p>
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={handleRestart} className="h-6 px-2 text-xs bg-transparent">
                <RotateCcw className="h-3 w-3" />
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="h-6 px-2 text-xs bg-transparent"
                >
                  ←
                </Button>
                <Button size="sm" onClick={handleNext} className="h-6 px-2 text-xs bg-orange-500 hover:bg-orange-600">
                  {currentStep >= tutorialSteps.length - 1 ? "✓" : "→"}
                </Button>
              </div>
            </div>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
            <div className={`text-3xl ${isSpeaking ? "animate-bounce" : ""}`}>👨🏽</div>
          </div>
        </div>
      </div>

      {/* Pointing Arrow */}
      {currentStepData.pointTo && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-1000 ease-in-out"
          style={{
            left: currentStepData.pointTo.x,
            top: currentStepData.pointTo.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-orange-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Add highlight class to elements */}
      <style jsx global>{`
        #${currentStepData.highlight} {
          position: relative;
          z-index: 46;
        }
        #${currentStepData.highlight}::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 3px solid rgba(249, 115, 22, 0.8);
          border-radius: 8px;
          animation: pulse-border 2s infinite;
          pointer-events: none;
          z-index: -1;
        }
        @keyframes pulse-border {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
            border-color: rgba(249, 115, 22, 0.8);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.02);
            border-color: rgba(249, 115, 22, 1);
          }
        }
      `}</style>
    </>
  )
}
