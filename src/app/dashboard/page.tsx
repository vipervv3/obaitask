'use client'

import { useEffect, useState } from 'react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { FolderOpen, CheckSquare, Users, Activity } from 'lucide-react'

interface DashboardStats {
  totalProjects: number
  activeTasks: number
  completedTasks: number
  teamMembers: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    const supabase = createClient()
    
    try {
      // Fetch projects count
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user?.id)

      // Fetch active tasks count (only for user's projects)
      const { count: activeTasksCount } = await supabase
        .from('tasks')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .neq('status', 'completed')
        .eq('projects.created_by', user?.id)

      // Fetch completed tasks count (only for user's projects)
      const { count: completedTasksCount } = await supabase
        .from('tasks')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('projects.created_by', user?.id)

      // Fetch team members count (only for user's projects)
      const { count: teamMembersCount } = await supabase
        .from('project_members')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('projects.created_by', user?.id)

      setStats({
        totalProjects: projectsCount || 0,
        activeTasks: activeTasksCount || 0,
        completedTasks: completedTasksCount || 0,
        teamMembers: teamMembersCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Tasks',
      value: stats.activeTasks,
      icon: CheckSquare,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckSquare,
      color: 'bg-green-500'
    },
    {
      title: 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      color: 'bg-purple-500'
    }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-300 rounded"></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${card.color}`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new project or task.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}