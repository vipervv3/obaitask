'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Upload,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onTranscriptionStart?: () => void
  maxDuration?: number // in seconds, default 2 hours
  projectId?: string
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  onTranscriptionStart,
  maxDuration = 7200, // 2 hours in seconds
  projectId 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    checkMicrophonePermission()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setHasPermission(result.state === 'granted')
      
      result.onchange = () => {
        setHasPermission(result.state === 'granted')
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error)
      setHasPermission(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      setHasPermission(true)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newDuration
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      setHasPermission(false)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        // Resume timer
        intervalRef.current = setInterval(() => {
          setDuration(prev => {
            const newDuration = prev + 1
            if (newDuration >= maxDuration) {
              stopRecording()
              return maxDuration
            }
            return newDuration
          })
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        // Pause timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleProcessRecording = async () => {
    if (!audioBlob) return
    
    setIsProcessing(true)
    onTranscriptionStart?.()
    
    try {
      onRecordingComplete(audioBlob, duration)
    } catch (error) {
      console.error('Error processing recording:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getRemainingTime = () => {
    return maxDuration - duration
  }

  const isNearLimit = () => {
    const remaining = getRemainingTime()
    return remaining <= 300 // 5 minutes warning
  }

  if (hasPermission === false) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Microphone Permission Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please allow microphone access to record meetings.
            </p>
            <Button 
              onClick={checkMicrophonePermission}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Check Permission
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Voice Recording</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span className={cn(
            isNearLimit() && "text-orange-600 font-medium",
            duration >= maxDuration && "text-red-600 font-bold"
          )}>
            {formatDuration(duration)} / {formatDuration(maxDuration)}
          </span>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            size="lg"
            className="bg-red-600 hover:bg-red-700"
          >
            <Mic className="h-5 w-5 mr-2" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={pauseRecording}
              variant="outline"
              size="lg"
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              )}
            </Button>
            
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button
              onClick={playRecording}
              variant="outline"
              size="lg"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button
              onClick={handleProcessRecording}
              disabled={isProcessing}
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isProcessing ? 'Processing...' : 'Process & Extract Tasks'}
            </Button>

            <Button
              onClick={() => {
                setAudioBlob(null)
                setDuration(0)
                setIsPlaying(false)
              }}
              variant="outline"
              size="lg"
            >
              <MicOff className="h-5 w-5 mr-2" />
              Record Again
            </Button>
          </>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center justify-center mb-4">
          <div className={cn(
            "flex items-center px-3 py-1 rounded-full text-sm",
            isPaused ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              isPaused ? "bg-yellow-400" : "bg-red-400 animate-pulse"
            )} />
            {isPaused ? 'Recording Paused' : 'Recording...'}
          </div>
        </div>
      )}

      {/* Warning Messages */}
      {isNearLimit() && duration < maxDuration && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-orange-800">
            ⚠️ Warning: Only {formatDuration(getRemainingTime())} remaining
          </p>
        </div>
      )}

      {duration >= maxDuration && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">
            🔴 Maximum recording time reached. Recording has stopped automatically.
          </p>
        </div>
      )}

      {/* Audio Element */}
      {audioBlob && (
        <audio
          ref={audioRef}
          src={URL.createObjectURL(audioBlob)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  )
}