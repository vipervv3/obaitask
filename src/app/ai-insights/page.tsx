'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Brain, TrendingUp, Users, Clock } from 'lucide-react'

export default function AIInsightsPage() {
  const insights = [
    {
      title: 'Project Health Analysis',
      description: 'AI-powered analysis of your project progress and potential bottlenecks',
      icon: TrendingUp,
      status: 'Coming Soon'
    },
    {
      title: 'Task Completion Predictions',
      description: 'Smart predictions on task completion times based on historical data',
      icon: Clock,
      status: 'Coming Soon'
    },
    {
      title: 'Workload Balancing',
      description: 'Intelligent suggestions for optimal task distribution across team members',
      icon: Users,
      status: 'Coming Soon'
    },
    {
      title: 'Meeting Insights',
      description: 'Automated extraction of action items and insights from meeting recordings',
      icon: Brain,
      status: 'Coming Soon'
    }
  ]

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">AI Insights</h1>
        </div>
        <p className="mt-2 text-gray-600">
          Intelligent analysis and recommendations powered by AI
        </p>
        
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {insights.map((insight) => (
            <div key={insight.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <insight.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{insight.description}</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {insight.status}
                      </span>
                    </div>
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