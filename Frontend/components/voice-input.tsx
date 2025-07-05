"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

interface VoiceInputProps {
  onResult: (text: string) => void
  isActive: boolean
  onActiveChange: (active: boolean) => void
  language?: string
}

export function VoiceInput({ onResult, isActive, onActiveChange, language = "en-US" }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = language

        recognition.onstart = () => {
          onActiveChange(true)
        }

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onResult(transcript)
          onActiveChange(false)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          onActiveChange(false)
        }

        recognition.onend = () => {
          onActiveChange(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [language, onResult, onActiveChange])

  const toggleRecording = () => {
    if (!recognitionRef.current) return

    if (isActive) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleRecording}
      className={`transition-colors ${isActive ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
      aria-label={isActive ? "Stop voice input" : "Start voice input"}
    >
      {isActive ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
    </Button>
  )
}
