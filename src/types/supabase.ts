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
          resume_url: string | null
          resume_content: string | null
          linkedin_url: string | null
          personal_website: string | null
          job_preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          resume_url?: string | null
          resume_content?: string | null
          linkedin_url?: string | null
          personal_website?: string | null
          job_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          resume_url?: string | null
          resume_content?: string | null
          linkedin_url?: string | null
          personal_website?: string | null
          job_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          location: string
          type: string
          salary: string | null
          description: string
          requirements: string[]
          posted_at: string
          source: string
          source_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          location: string
          type: string
          salary?: string | null
          description: string
          requirements?: string[]
          posted_at?: string
          source: string
          source_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string
          type?: string
          salary?: string | null
          description?: string
          requirements?: string[]
          posted_at?: string
          source?: string
          source_url?: string | null
          active?: boolean
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          job_id: string
          status: string
          applied_at: string
          last_contact_at: string | null
          customized_resume: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          status?: string
          applied_at?: string
          last_contact_at?: string | null
          customized_resume?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          status?: string
          applied_at?: string
          last_contact_at?: string | null
          customized_resume?: string | null
          notes?: string | null
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
      application_status: 'applied' | 'contacted' | 'rejected' | 'accepted'
    }
  }
}