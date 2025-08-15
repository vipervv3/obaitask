'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase'
import { 
  Plus, CheckSquare, Calendar, User, Edit, Trash2, Filter, 
  ArrowUp, ArrowDown, Clock, Target, AlertCircle, Users
} from 'lucide-react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  due_date: string | null
  projects: {
    name: string
  }
  assigned_user?: {
    full_name: string | null
    email: string
  }
  creator?: {
    full_name: string | null
    email: string
  }
}

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  full_name: string | null
  email: string
}

// Date utility functions
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return ''
  try {
    if (!dateString.includes('T') && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }
    if (dateString.includes('T')) {
      return dateString.split('T')[0]
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
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

const saveDateAsUTC = (dateString: string): string => {
  if (!dateString) return ''
  return `${dateString}T12:00:00`
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [projectMembers, setProjectMembers] = useState<User[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: ''
  })

  useEffect(() => {
    if (user) {
      fetchTasks()
      fetchProjects()
    }
  }, [user])

  const fetchTasks = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects!inner(name),
          assigned_user:profiles!tasks_assigned_to_fkey(full_name, email),
          creator:profiles!tasks_created_by_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('created_by', user?.id)
        .order('name')

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchProjectMembers = async (projectId: string) => {
    if (!projectId) {
      setProjectMembers([])
      return
    }

    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          profiles(id, full_name, email)
        `)
        .eq('project_id', projectId)

      if (error) throw error
      
      const members = data?.map(item => item.profiles).filter(Boolean) || []
      setProjectMembers(members.flat() as User[])
    } catch (error) {
      console.error('Error fetching project members:', error)
      setProjectMembers([])
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim() || !formData.project_id) return

    setCreating(true)
    setError('')
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          project_id: formData.project_id,
          assigned_to: formData.assigned_to || null,
          priority: formData.priority,
          due_date: saveDateAsUTC(formData.due_date) || null,
          created_by: user.id,
          status: 'todo'
        })
        .select()
        .single()

      if (error) throw error

      setFormData({
        title: '',
        description: '',
        project_id: '',
        assigned_to: '',
        priority: 'medium',
        due_date: ''
      })
      setShowCreateForm(false)
      setProjectMembers([])
      fetchTasks()
    } catch (error: any) {
      console.error('Error creating task:', error)
      setError(error.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id,
      assigned_to: task.assigned_to || '',
      priority: task.priority,
      due_date: formatDateForInput(task.due_date)
    })
    fetchProjectMembers(task.project_id)
    setShowCreateForm(true)
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingTask || !formData.title.trim()) return

    setCreating(true)
    setError('')
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          project_id: formData.project_id,
          assigned_to: formData.assigned_to || null,
          priority: formData.priority,
          due_date: saveDateAsUTC(formData.due_date) || null,
        })
        .eq('id', editingTask.id)

      if (error) throw error

      setFormData({
        title: '',
        description: '',
        project_id: '',
        assigned_to: '',
        priority: 'medium',
        due_date: ''
      })
      setShowCreateForm(false)
      setEditingTask(null)
      setProjectMembers([])
      fetchTasks()
    } catch (error: any) {
      console.error('Error updating task:', error)
      setError(error.message || 'Failed to update task')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error: any) {
      console.error('Error updating task status:', error)
      setError(error.message || 'Failed to update task status')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return

    setDeletingTask(taskId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error: any) {
      console.error('Error deleting task:', error)
      setError(error.message || 'Failed to delete task')
    } finally {
      setDeletingTask(null)
    }
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setShowCreateForm(false)
    setProjectMembers([])
    setFormData({
      title: '',
      description: '',
      project_id: '',
      assigned_to: '',
      priority: 'medium',
      due_date: ''
    })
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false
      if (filterProject !== 'all' && task.project_id !== filterProject) return false
      return true
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0
          break
        default:
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />
      case 'high':
        return <ArrowUp className="h-4 w-4" />
      case 'low':
        return <ArrowDown className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters and Sorting */}
        <div className="mt-6 bg-white rounded-lg border p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Created Date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="due_date">Due Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Create/Edit Task Form */}
        {showCreateForm && (
          <div className="mt-6 bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="project_id">Project *</Label>
                  <select
                    id="project_id"
                    value={formData.project_id}
                    onChange={(e) => {
                      setFormData({ ...formData, project_id: e.target.value, assigned_to: '' })
                      fetchProjectMembers(e.target.value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <select
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.project_id}
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name || member.email}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the task..."
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
                <Button type="submit" disabled={creating || !formData.title.trim() || !formData.project_id}>
                  {creating ? (editingTask ? 'Updating...' : 'Creating...') : (editingTask ? 'Update Task' : 'Create Task')}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="mt-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedTasks.length > 0 ? (
          <div className="mt-6 space-y-4">
            {filteredAndSortedTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityIcon(task.priority)}
                        <span className="ml-1">{task.priority}</span>
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Project: <span className="font-medium">{task.projects.name}</span>
                    </p>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {task.assigned_user ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{task.assigned_user.full_name || task.assigned_user.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Unassigned</span>
                        </div>
                      )}
                      
                      {task.due_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due {formatDateForDisplay(task.due_date)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {task.status !== 'completed' && (
                      <div className="flex space-x-1">
                        {task.status === 'todo' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                          handleDeleteTask(task.id)
                        }
                      }}
                      disabled={deletingTask === task.id}
                    >
                      {deletingTask === task.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent mr-1" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      {deletingTask === task.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="text-center py-12">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {tasks.length === 0 
                  ? "Get started by creating a new task."
                  : "Try adjusting your filters to see more tasks."
                }
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}