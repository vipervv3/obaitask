'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase'
import { 
  ArrowLeft, Calendar, Users, CheckSquare, Edit, Trash2, 
  Clock, Target, TrendingUp, Plus, MoreVertical 
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'paused'
  created_at: string
  due_date: string | null
  created_by: string
  task_count?: number
  member_count?: number
}

// Date utility functions
const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return 'No due date'
  try {
    // Handle both date-only and datetime strings
    const date = dateString.includes('T') 
      ? new Date(dateString)
      : new Date(dateString + 'T00:00:00')
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Date parsing error:', error)
    return 'Invalid date'
  }
}

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return ''
  try {
    // Handle both date-only and datetime strings
    const date = dateString.includes('T')
      ? new Date(dateString)
      : new Date(dateString + 'T00:00:00')
    
    if (isNaN(date.getTime())) {
      return ''
    }
    
    // Format as YYYY-MM-DD for input field
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Date parsing error:', error)
    return ''
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'active' as 'active' | 'completed' | 'paused'
  })

  useEffect(() => {
    if (user && projectId) {
      fetchProject()
    }
  }, [user, projectId])

  const fetchProject = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(count),
          project_members(count)
        `)
        .eq('id', projectId)
        .single()

      if (error) throw error

      const projectWithCounts = {
        ...data,
        task_count: data.tasks?.[0]?.count || 0,
        member_count: data.project_members?.[0]?.count || 0
      }

      setProject(projectWithCounts)
      setFormData({
        name: data.name,
        description: data.description || '',
        due_date: formatDateForInput(data.due_date),
        status: data.status
      })
    } catch (error) {
      console.error('Error fetching project:', error)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !project) return

    setError('')
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          due_date: formData.due_date || null,
          status: formData.status
        })
        .eq('id', project.id)
        .select()
        .single()

      if (error) throw error

      // Update the project state with the new data
      setProject({
        ...data,
        task_count: project?.task_count || 0,
        member_count: project?.member_count || 0
      })
      setEditing(false)
      // Refresh the project data
      fetchProject()
    } catch (error: any) {
      console.error('Error updating project:', error)
      setError(error.message || 'Failed to update project')
    }
  }

  const handleDelete = async () => {
    if (!user || !project) return
    
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error

      router.push('/projects')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      setError(error.message || 'Failed to delete project')
      setDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
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

          {!editing ? (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <div className="flex items-center text-white text-opacity-90">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">Created {formatDateForDisplay(project.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
              {project.description && (
                <p className="mt-4 text-white text-opacity-90">{project.description}</p>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'paused' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button type="submit">
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false)
                      setFormData({
                        name: project.name,
                        description: project.description || '',
                        due_date: formatDateForInput(project.due_date),
                        status: project.status
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Tasks</p>
                <p className="text-3xl font-bold text-blue-800">{project.task_count || 0}</p>
                <p className="text-blue-600 text-xs mt-1">Total tasks</p>
              </div>
              <CheckSquare className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Team</p>
                <p className="text-3xl font-bold text-green-800">{project.member_count || 0}</p>
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
                  {project.due_date ? 
                    new Date(project.due_date + 'T00:00:00') > new Date() ? 'Upcoming' : 'Overdue'
                    : 'No deadline'
                  }
                </p>
              </div>
              <Calendar className="h-12 w-12 text-purple-600 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs for Tasks, Team, etc */}
        <div className="bg-white rounded-xl border">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button className="py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium">
                Tasks
              </button>
              <button className="py-4 px-2 border-b-2 border-transparent hover:border-gray-300 text-gray-600 font-medium">
                Team Members
              </button>
              <button className="py-4 px-2 border-b-2 border-transparent hover:border-gray-300 text-gray-600 font-medium">
                Activity
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Tasks</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            <div className="text-center py-12 text-gray-500">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium mb-1">No tasks yet</p>
              <p className="text-sm">Create your first task to get started</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}