'use client'

import { useState, useCallback } from 'react'

interface TranscriptionResult {
  transcript?: string
  summary?: string
  tasks?: Array<{
    title: string
    description: string
    priority: string
  }>
  chapters?: any[]
  highlights?: any[]
}

export function useTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startTranscription = useCallback(async (
    audioBlob: Blob,
    projectId: string,
    meetingTitle?: string
  ) => {
    setIsTranscribing(true)
    setError(null)
    setTranscriptionResult(null)

    try {
      // Upload and start transcription
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('projectId', projectId)
      if (meetingTitle) {
        formData.append('meetingTitle', meetingTitle)
      }

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to start transcription')
      }

      const { transcriptId, meetingId } = await response.json()

      // Poll for completion
      const pollForCompletion = async (): Promise<void> => {
        const statusResponse = await fetch('/api/transcribe/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcriptId, meetingId }),
        })

        if (!statusResponse.ok) {
          throw new Error('Failed to check transcription status')
        }

        const result = await statusResponse.json()

        if (result.status === 'completed') {
          setTranscriptionResult({
            transcript: result.transcript,
            summary: result.summary,
            tasks: result.tasks,
            chapters: result.chapters,
            highlights: result.highlights,
          })
          setIsTranscribing(false)
        } else if (result.status === 'error') {
          throw new Error(result.error || 'Transcription failed')
        } else {
          // Still processing, check again in 5 seconds
          setTimeout(pollForCompletion, 5000)
        }
      }

      // Start polling
      setTimeout(pollForCompletion, 3000)

    } catch (err) {
      console.error('Transcription error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during transcription')
      setIsTranscribing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsTranscribing(false)
    setTranscriptionResult(null)
    setError(null)
  }, [])

  return {
    startTranscription,
    isTranscribing,
    transcriptionResult,
    error,
    reset,
  }
}