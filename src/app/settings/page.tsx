'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Mail, 
  Clock,
  Shield,
  Palette
} from 'lucide-react'

export default function SettingsPage() {
  const settingSections = [
    {
      title: 'Daily Assistant Settings',
      description: 'Configure how your AI assistant keeps you informed throughout the day',
      icon: Bell,
      items: [
        'Enable Email Notifications',
        'Morning Briefing (7:00 AM)',
        'Lunch Break Reminder (12:00 PM)',
        'End of Day Summary (5:00 PM)'
      ]
    },
    {
      title: 'Smart Notifications',
      description: 'Intelligent notifications and reminders',
      icon: Mail,
      items: [
        'Meeting Reminders',
        'Task Deadline Alerts',
        'AI Proactive Insights'
      ]
    },
    {
      title: 'Working Hours',
      description: 'Set your availability and working schedule',
      icon: Clock,
      items: [
        'Working Hours: 09:00 AM - 06:00 PM',
        'Notification Frequency: Hourly Digest',
        'Urgent Notifications Only'
      ]
    }
  ]

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center">
          <SettingsIcon className="h-8 w-8 text-gray-600 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
        
        <div className="mt-8 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Profile Settings
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button>Save Profile</Button>
              </div>
            </div>
          </div>

          {/* AI Assistant Settings */}
          {settingSections.map((section) => (
            <div key={section.title} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <section.icon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item}</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Test Email Configuration */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Test Email Configuration
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Verify your email service is working by sending a test email
              </p>
              <Button variant="outline">Test Email Configuration</Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save Preferences</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}