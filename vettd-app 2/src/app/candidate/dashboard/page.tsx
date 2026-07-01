import { createClient } from '@/lib/supabase/server'
import { CLEARANCE_COLOURS, AVAILABILITY_LABELS, STAGE_LABELS, STAGE_COLOURS } from '@/lib/utils'
import type { ClearanceLevel, Availability, ApplicationStage } from '@/lib/types'

export default async function CandidateDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id, stage, created_at,
      job_postings (title, business_profiles (company_name))
    `)
    .eq('candidate_id', profile?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: jobs } = await supabase
    .from('job_postings')
    .select('*')
    .eq('status', 'active')
    .limit(3)

  const profileComplete = profile
    ? [profile.first_name, profile.last_name, profile.clearance_level, profile.disciplines?.length, profile.availability].filter(Boolean).length * 20
    : 0

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Here&apos;s what&apos;s happening with your Vettd profile.
        </p>
      </div>

      {/* Profile completeness banner */}
      {profileComplete < 100 && (
        <div style={{
          padding: '16px 20px', marginBottom: '28px',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Profile completeness</span>
              <span style={{ fontSize: '13px', color: 'var(--red-l)' }}>{profileComplete}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px' }}>
              <div style={{
                height: '100%', width: `${profileComplete}%`,
                background: 'linear-gradient(90deg, var(--red-d), var(--red))',
                borderRadius: '3px', transition: 'width 0.3s',
              }} />
            </div>
          </div>
          <a href="/candidate/profile" style={{
            padding: '8px 16px', background: 'var(--red)', color: 'white',
            borderRadius: '6px', fontSize: '13px', textDecoration: 'none', fontWeight: 500,
            flexShrink: 0,
          }}>
            Complete Profile
          </a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile summary */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
            Your Profile
          </h2>
          {profile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {profile.clearance_level && (
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    ...Object.fromEntries(
                      CLEARANCE_COLOURS[profile.clearance_level as ClearanceLevel]
                        .split(' ').map(c => c.startsWith('bg-') ? ['background', c] : ['color', c])
                    ),
                  }}>
                    {profile.clearance_level}
                  </span>
                )}
                {profile.availability && (
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)',
                  }}>
                    {AVAILABILITY_LABELS[profile.availability as Availability]}
                  </span>
                )}
              </div>
              {profile.location && (
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>📍 {profile.location}</p>
              )}
              {profile.disciplines && profile.disciplines.length > 0 && (
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {profile.disciplines.slice(0, 3).join(' · ')}
                  {profile.disciplines.length > 3 && ` +${profile.disciplines.length - 3} more`}
                </p>
              )}
              <div style={{
                paddingTop: '12px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: '6px',
              }}>
                <span style={{
                  padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                  background: profile.is_public ? 'rgba(16,185,129,0.15)' : 'var(--bg3)',
                  color: profile.is_public ? 'var(--green)' : 'var(--muted)',
                  border: `1px solid ${profile.is_public ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                }}>
                  {profile.is_public ? '✓ Profile visible to employers' : '⊘ Profile hidden'}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Complete your profile to appear in talent searches.
            </p>
          )}
        </div>

        {/* Recent applications */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
            Recent Applications
          </h2>
          {applications && applications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {applications.map((app: Record<string, unknown>) => {
                const posting = app.job_postings as Record<string, unknown> | null
                const business = posting?.business_profiles as Record<string, unknown> | null
                return (
                  <div key={app.id as string} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                        {posting?.title as string ?? 'Role'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {business?.company_name as string ?? 'Unknown company'}
                      </p>
                    </div>
                    <span style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                      background: 'var(--bg3)', color: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }}>
                      {STAGE_LABELS[app.stage as ApplicationStage]}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              No applications yet. Browse open roles to get started.
            </p>
          )}
        </div>
      </div>

      {/* Open roles */}
      {jobs && jobs.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Open Roles for You</h2>
            <a href="/candidate/jobs" style={{ fontSize: '13px', color: 'var(--red-l)', textDecoration: 'none' }}>View all →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {jobs.map((job: Record<string, unknown>) => (
              <div key={job.id as string} style={{
                padding: '16px 20px', background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                    {job.title as string}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {job.location as string ?? 'Location TBC'}
                    {job.clearance_required && ` · ${job.clearance_required} required`}
                  </p>
                </div>
                <a href={`/candidate/jobs`} style={{
                  padding: '7px 14px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '12px', color: 'var(--text)', textDecoration: 'none',
                }}>
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
