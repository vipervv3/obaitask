'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  CheckSquare, 
  Brain, 
  Copy, 
  Download,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TranscriptionResultsProps {
  result: {
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
  onClose?: () => void
}

export function TranscriptionResults({ result, onClose }: TranscriptionResultsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'tasks' | 'transcript' | 'insights'>('summary')
  const [isExpanded, setIsExpanded] = useState(true)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadTranscript = () => {
    if (!result.transcript) return

    const blob = new Blob([result.transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Brain },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: result.tasks?.length },
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ]

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">AI Analysis Results</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-1 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <tab.icon className="h-4 w-4 mr-1" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {result.summary ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Meeting Summary</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.summary!)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{result.summary}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No summary available</p>
                )}

                {result.highlights && result.highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Key Highlights</h4>
                    <div className="space-y-2">
                      {result.highlights.slice(0, 5).map((highlight: any, index: number) => (
                        <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-sm text-gray-700">{highlight.text}</p>
                          {highlight.rank && (
                            <span className="text-xs text-gray-500">Relevance: {Math.round(highlight.rank * 100)}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Extracted Tasks ({result.tasks?.length || 0})
                  </h4>
                  {result.tasks && result.tasks.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Tasks have been automatically created in your project
                    </p>
                  )}
                </div>

                {result.tasks && result.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {result.tasks.map((task, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">{task.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          </div>
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded border',
                            getPriorityColor(task.priority)
                          )}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No actionable tasks were identified in this recording</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Full Transcript</h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => result.transcript && copyToClipboard(result.transcript)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTranscript}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                {result.transcript ? (
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {result.transcript}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500">No transcript available</p>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Additional Insights</h4>

                {result.chapters && result.chapters.length > 0 ? (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Meeting Chapters</h5>
                    <div className="space-y-2">
                      {result.chapters.map((chapter: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-400 bg-blue-50 p-3 rounded">
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 text-blue-600 mr-1" />
                            <span className="text-sm font-medium text-blue-900">
                              {Math.floor(chapter.start / 1000 / 60)}:{String(Math.floor(chapter.start / 1000) % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <h6 className="font-medium text-gray-900 mb-1">{chapter.headline}</h6>
                          <p className="text-sm text-gray-600">{chapter.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No additional insights available</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Insights may include meeting chapters, sentiment analysis, and key topics
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}