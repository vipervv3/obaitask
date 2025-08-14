export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'active' | 'completed' | 'paused'
          created_by: string
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'active' | 'completed' | 'paused'
          created_by: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'completed' | 'paused'
          created_by?: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      tasks: {
        Row: {
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
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          recording_url: string | null
          transcript: string | null
          ai_summary: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          recording_url?: string | null
          transcript?: string | null
          ai_summary?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          recording_url?: string | null
          transcript?: string | null
          ai_summary?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      meeting_attendees: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}