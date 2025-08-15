'use client'

import { useState, useEffect } from 'react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase'
import { Plus, FolderOpen, Calendar, Users, CheckSquare, Edit, Trash2, Eye, Clock, Target, TrendingUp } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'paused'
  created_at: string
  due_date: string | null
  task_count?: number
  member_count?: number
}

// Date utility functions to handle timezone issues
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return ''
  // Parse the date and format as YYYY-MM-DD without timezone conversion
  const date = new Date(dateString + 'T00:00:00')
  return date.toISOString().split('T')[0]
}

const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return 'No due date'
  // Create date in local timezone to avoid shifts
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString()
}

const saveDateAsUTC = (dateString: string): string => {
  if (!dateString) return ''
  // Save as just the date without timezone conversion
  return dateString
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<string | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: ''
  })

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user)
      checkUserProfile()
      fetchProjects()
    }
  }, [user])

  const checkUserProfile = async () => {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()
    
    console.log('User profile:', profile, error)
    
    if (!profile && !error) {
      console.log('No profile found, creating one...')
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user?.id,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || null
        })
      console.log('Profile creation result:', createError)
    }
  }

  const fetchProjects = async () => {
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
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const projectsWithCounts = data?.map(project => ({
        ...project,
        task_count: project.tasks?.[0]?.count || 0,
        member_count: project.project_members?.[0]?.count || 0
      })) || []

      setProjects(projectsWithCounts)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name.trim()) return

    console.log('Creating project with user:', user.id)
    setCreating(true)
    setError('')
    const supabase = createClient()

    try {
      console.log('Inserting project:', {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        due_date: formData.due_date || null,
        created_by: user.id,
        status: 'active'
      })

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          due_date: saveDateAsUTC(formData.due_date) || null,
          created_by: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('Project creation error:', error)
        throw error
      }

      console.log('Project created:', data)

      // Add creator as project owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'owner'
        })

      if (memberError) {
        console.error('Project member creation error:', memberError)
        throw memberError
      }

      console.log('Project member added successfully')
      setFormData({ name: '', description: '', due_date: '' })
      setShowCreateForm(false)
      fetchProjects()
    } catch (error: any) {
      console.error('Error creating project:', error)
      setError(error.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    
    setFormData({
      name: project.name,
      description: project.description || '',
      due_date: formatDateForInput(project.due_date)
    })
    setShowCreateForm(true)
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingProject || !formData.name.trim()) return

    console.log('Updating project:', editingProject.id)
    setCreating(true)
    setError('')
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          due_date: saveDateAsUTC(formData.due_date) || null,
        })
        .eq('id', editingProject.id)
        .select()
        .single()

      if (error) {
        console.error('Project update error:', error)
        throw error
      }

      console.log('Project updated:', data)
      setFormData({ name: '', description: '', due_date: '' })
      setShowCreateForm(false)
      setEditingProject(null)
      fetchProjects()
    } catch (error: any) {
      console.error('Error updating project:', error)
      setError(error.message || 'Failed to update project')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return

    setDeletingProject(projectId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Project delete error:', error)
        throw error
      }

      console.log('Project deleted:', projectId)
      fetchProjects()
    } catch (error: any) {
      console.error('Error deleting project:', error)
      setError(error.message || 'Failed to delete project')
    } finally {
      setDeletingProject(null)
    }
  }

  const cancelEdit = () => {
    setEditingProject(null)
    setShowCreateForm(false)
    setFormData({ name: '', description: '', due_date: '' })
  }

  const handleViewProject = (project: Project) => {
    setViewingProject(project)
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

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Create/Edit Project Form */}
        {showCreateForm && (
          <div className="mt-8 bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            
            <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date (Optional)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project..."
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <Button type="submit" disabled={creating || !formData.name.trim()}>
                  {creating ? (editingProject ? 'Updating...' : 'Creating...') : (editingProject ? 'Update Project' : 'Create Project')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <CheckSquare className="h-4 w-4 mr-1" />
                    <span>{project.task_count} tasks</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{project.member_count} members</span>
                  </div>
                </div>

                {project.due_date && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due {formatDateForDisplay(project.due_date)}</span>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewProject(project)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProject(project)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
                        handleDeleteProject(project.id)
                      }
                    }}
                    disabled={deletingProject === project.id}
                  >
                    {deletingProject === project.id ? (
                      <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent mr-1" />
                    ) : (
                      <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    {deletingProject === project.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new project for your team.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Project View Modal */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-2">{viewingProject.name}</h2>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white`}>
                        {viewingProject.status.charAt(0).toUpperCase() + viewingProject.status.slice(1)}
                      </span>
                      <div className="flex items-center text-white text-opacity-90">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">Created {new Date(viewingProject.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingProject(null)}
                    className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Description Section */}
                {viewingProject.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Project Description
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{viewingProject.description}</p>
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium mb-1">Tasks</p>
                        <p className="text-3xl font-bold text-blue-800">{viewingProject.task_count || 0}</p>
                        <p className="text-blue-600 text-xs mt-1">Total tasks</p>
                      </div>
                      <CheckSquare className="h-12 w-12 text-blue-600 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium mb-1">Team</p>
                        <p className="text-3xl font-bold text-green-800">{viewingProject.member_count || 0}</p>
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
                          {formatDateForDisplay(viewingProject.due_date)}
                        </p>
                        <p className="text-purple-600 text-xs mt-1">
                          {viewingProject.due_date ? 
                            new Date(viewingProject.due_date + 'T00:00:00') > new Date() ? 'Upcoming' : 'Overdue'
                            : 'No deadline'
                          }
                        </p>
                      </div>
                      <Calendar className="h-12 w-12 text-purple-600 opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Project Progress Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Project Progress
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {viewingProject.task_count ? Math.round((0 / viewingProject.task_count) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${viewingProject.task_count ? Math.round((0 / viewingProject.task_count) * 100) : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      0 of {viewingProject.task_count || 0} tasks completed
                    </p>
                  </div>
                </div>

                {/* Project Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Project ID</span>
                      <span className="text-sm text-gray-900 font-mono">{viewingProject.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingProject.status)}`}>
                        {viewingProject.status.charAt(0).toUpperCase() + viewingProject.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Created</span>
                      <span className="text-sm text-gray-900">{new Date(viewingProject.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    onClick={() => {
                      setViewingProject(null)
                      handleEditProject(viewingProject)
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setViewingProject(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}