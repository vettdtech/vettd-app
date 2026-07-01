import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CandidateSidebar from '@/components/layout/CandidateSidebar'

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('first_name, last_name, avatar_url')
    .eq('user_id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <CandidateSidebar profile={profile} userEmail={user.email ?? ''} />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
