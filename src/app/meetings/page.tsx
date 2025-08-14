'use client'

import { useState, useEffect } from 'react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VoiceRecorder } from '@/components/voice/voice-recorder'
import { TranscriptionResults } from '@/components/voice/transcription-results'
import { useTranscription } from '@/hooks/use-transcription'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase'
import { Plus, Video, Mic, FolderOpen } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface Meeting {
  id: string
  title: string
  created_at: string
  transcript: string | null
  projects?: { name: string }
}

export default function MeetingsPage() {
  const [showRecorder, setShowRecorder] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  
  const { user } = useAuth()
  const { 
    startTranscription, 
    isTranscribing, 
    transcriptionResult, 
    error, 
    reset 
  } = useTranscription()

  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchMeetings()
    }
  }, [user])

  const fetchProjects = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .or(`created_by.eq.${user?.id},id.in.(${await getUserProjectIds()})`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProjects(data)
    }
  }

  const getUserProjectIds = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user?.id)
    
    return data?.map(pm => pm.project_id).join(',') || ''
  }

  const fetchMeetings = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        projects:project_id (name)
      `)
      .eq('created_by', user?.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMeetings(data)
    }
  }

  const handleStartRecording = () => {
    if (!selectedProject) {
      alert('Please select a project first')
      return
    }
    setShowRecorder(true)
  }

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    if (!selectedProject) return
    
    await startTranscription(
      audioBlob, 
      selectedProject, 
      meetingTitle || 'Recorded Meeting'
    )
  }

  const handleCloseResults = () => {
    reset()
    setShowRecorder(false)
    setMeetingTitle('')
    fetchMeetings() // Refresh meetings list
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Meetings</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleStartRecording}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Recording Setup */}
        {!showRecorder && (
          <div className="mt-8 bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Meeting</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="project">Select Project *</Label>
                <select
                  id="project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="title">Meeting Title (Optional)</Label>
                <Input
                  id="title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Enter meeting title..."
                />
              </div>
            </div>

            {!selectedProject && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <FolderOpen className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    Please select a project where the meeting tasks will be created.
                  </p>
                </div>
              </div>
            )}

            <Button 
              onClick={handleStartRecording}
              disabled={!selectedProject}
              className="w-full md:w-auto"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </div>
        )}

        {/* Voice Recorder */}
        {showRecorder && !transcriptionResult && (
          <div className="mt-8">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onTranscriptionStart={() => console.log('Transcription started')}
              projectId={selectedProject}
            />
            
            {isTranscribing && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Processing Recording</h4>
                    <p className="text-sm text-blue-700">
                      Transcribing audio and extracting tasks with AI...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={reset}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Transcription Results */}
        {transcriptionResult && (
          <div className="mt-8">
            <TranscriptionResults
              result={transcriptionResult}
              onClose={handleCloseResults}
            />
          </div>
        )}
        
        {/* Meetings List */}
        {!showRecorder && meetings.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Meetings</h3>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {meetings.slice(0, 10).map((meeting: Meeting) => (
                  <li key={meeting.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-500">
                          {meeting.projects?.name} • {new Date(meeting.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {meeting.transcript && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Transcribed
                          </span>
                        )}
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showRecorder && meetings.length === 0 && (
          <div className="mt-8">
            <div className="text-center py-12">
              <Video className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start recording your first meeting to automatically extract tasks.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}