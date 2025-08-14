'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Plus, CheckSquare } from 'lucide-react'

export default function TasksPage() {
  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
        
        <div className="mt-8">
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new task.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}