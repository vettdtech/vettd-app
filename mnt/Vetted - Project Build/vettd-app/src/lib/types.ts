export type ClearanceLevel = 'BPSS' | 'SC' | 'DV' | 'TS' | 'SCI'
export type UserRole = 'candidate' | 'business'
export type Availability = 'immediate' | '1_month' | '3_months' | 'not_looking'
export type ApplicationStage = 'proposal' | 'shortlisted' | 'interviewing' | 'hired' | 'rejected' | 'withdrawn'
export type JobStatus = 'draft' | 'active' | 'closed' | 'filled'
export type Plan = 'trial' | 'starter' | 'pro' | 'enterprise'
export type TeamRole = 'admin' | 'recruiter' | 'viewer'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          role?: UserRole
          updated_at?: string
        }
      }
      candidate_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          headline: string | null
          bio: string | null
          location: string | null
          clearance_level: ClearanceLevel | null
          clearance_verified: boolean
          disciplines: string[]
          years_experience: number | null
          availability: Availability | null
          day_rate_min: number | null
          day_rate_max: number | null
          is_public: boolean
          avatar_url: string | null
          cv_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          clearance_level?: ClearanceLevel | null
          clearance_verified?: boolean
          disciplines?: string[]
          years_experience?: number | null
          availability?: Availability | null
          day_rate_min?: number | null
          day_rate_max?: number | null
          is_public?: boolean
          avatar_url?: string | null
          cv_url?: string | null
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          clearance_level?: ClearanceLevel | null
          disciplines?: string[]
          years_experience?: number | null
          availability?: Availability | null
          day_rate_min?: number | null
          day_rate_max?: number | null
          is_public?: boolean
          avatar_url?: string | null
          cv_url?: string | null
          updated_at?: string
        }
      }
      business_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_size: string | null
          sector: string | null
          website: string | null
          description: string | null
          logo_url: string | null
          is_verified: boolean
          plan: Plan
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_size?: string | null
          sector?: string | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          is_verified?: boolean
          plan?: Plan
        }
        Update: {
          company_name?: string
          company_size?: string | null
          sector?: string | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string | null
          location: string | null
          remote_ok: boolean
          clearance_required: ClearanceLevel | null
          disciplines: string[]
          day_rate_min: number | null
          day_rate_max: number | null
          contract_length: string | null
          status: JobStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          description?: string | null
          location?: string | null
          remote_ok?: boolean
          clearance_required?: ClearanceLevel | null
          disciplines?: string[]
          day_rate_min?: number | null
          day_rate_max?: number | null
          contract_length?: string | null
          status?: JobStatus
        }
        Update: {
          title?: string
          description?: string | null
          location?: string | null
          remote_ok?: boolean
          clearance_required?: ClearanceLevel | null
          disciplines?: string[]
          day_rate_min?: number | null
          day_rate_max?: number | null
          contract_length?: string | null
          status?: JobStatus
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          business_id: string
          stage: ApplicationStage
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          business_id: string
          stage?: ApplicationStage
          notes?: string | null
        }
        Update: {
          stage?: ApplicationStage
          notes?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          application_id: string
          sender_id: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          sender_id: string
          body: string
          read_at?: string | null
        }
        Update: {
          read_at?: string | null
        }
      }
      saved_candidates: {
        Row: {
          id: string
          business_id: string
          candidate_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          candidate_id: string
          notes?: string | null
        }
        Update: {
          notes?: string | null
        }
      }
      team_members: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          email: string
          role: TeamRole
          status: 'active' | 'pending'
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id?: string | null
          email: string
          role?: TeamRole
          status?: 'active' | 'pending'
        }
        Update: {
          role?: TeamRole
          status?: 'active' | 'pending'
        }
      }
    }
  }
}

// Convenience type helpers
export type User = Database['public']['Tables']['users']['Row']
export type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
export type BusinessProfile = Database['public']['Tables']['business_profiles']['Row']
export type JobPosting = Database['public']['Tables']['job_postings']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type SavedCandidate = Database['public']['Tables']['saved_candidates']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
