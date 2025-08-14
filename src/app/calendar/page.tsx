'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
        
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Calendar view coming soon</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Integrated calendar with meeting scheduling and deadline tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}