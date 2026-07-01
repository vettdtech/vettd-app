import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BusinessSidebar from '@/components/layout/BusinessSidebar'

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('company_name, is_verified, plan')
    .eq('user_id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <BusinessSidebar
        profile={profile}
        userEmail={user.email ?? ''}
      />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
