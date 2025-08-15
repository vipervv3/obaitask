'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Calendar, Users, CheckSquare } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'paused'
  created_at: string
  due_date: string | null
  created_by: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && projectId) {
      fetchProject()
    }
  }, [user, projectId])

  const fetchProject = async () => {
    if (!projectId || !user) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Project fetch error:', error)
        setError('Project not found')
        return
      }

      if (!data) {
        setError('Project not found')
        return
      }

      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return 'No due date'
    try {
      const datePart = dateString.split('T')[0]
      const [year, month, day] = datePart.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString()
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Project not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  <div className="flex items-center text-white text-opacity-90">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">Created {formatDateForDisplay(project.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            {project.description && (
              <p className="mt-4 text-white text-opacity-90">{project.description}</p>
            )}
            {project.due_date && (
              <div className="mt-4 flex items-center text-white text-opacity-90">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Due {formatDateForDisplay(project.due_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Tasks</p>
                <p className="text-3xl font-bold text-blue-800">--</p>
                <p className="text-blue-600 text-xs mt-1">Total tasks</p>
              </div>
              <CheckSquare className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Team</p>
                <p className="text-3xl font-bold text-green-800">--</p>
                <p className="text-green-600 text-xs mt-1">Members</p>
              </div>
              <Users className="h-12 w-12 text-green-600 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Due Date</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatDateForDisplay(project.due_date)}
                </p>
                <p className="text-purple-600 text-xs mt-1">
                  {project.due_date ? (() => {
                    const datePart = project.due_date.split('T')[0]
                    const [year, month, day] = datePart.split('-').map(Number)
                    const dueDate = new Date(year, month - 1, day)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return dueDate >= today ? 'Upcoming' : 'Overdue'
                  })() : 'No deadline'}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-purple-600 opacity-80" />
            </div>
          </div>
        </div>

        {/* Simple Actions */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => router.push('/tasks')}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Manage Tasks
            </Button>
            <Button variant="outline" onClick={() => router.push('/team')}>
              <Users className="h-4 w-4 mr-2" />
              Team Management
            </Button>
            <Button variant="outline" onClick={() => router.push('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This is a simplified view. Full project details and tabs are temporarily disabled 
              while we resolve server issues. You can still manage tasks and team members from their respective pages.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}