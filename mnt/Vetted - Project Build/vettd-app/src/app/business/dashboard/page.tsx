import { createClient } from '@/lib/supabase/server'
import { STAGE_LABELS } from '@/lib/utils'
import type { ApplicationStage } from '@/lib/types'

export default async function BusinessDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  if (!profile) {
    return (
      <div style={{ padding: '32px' }}>
        <p style={{ color: 'var(--muted)' }}>Setting up your business profile…</p>
      </div>
    )
  }

  const { data: jobs } = await supabase
    .from('job_postings')
    .select('id, title, status')
    .eq('business_id', profile.id)

  const { data: applications } = await supabase
    .from('applications')
    .select('id, stage, created_at, job_postings (title), candidate_profiles (first_name, last_name, clearance_level)')
    .eq('business_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const activeJobs = jobs?.filter(j => j.status === 'active').length ?? 0
  const totalApps = applications?.length ?? 0
  const stages: ApplicationStage[] = ['proposal', 'shortlisted', 'interviewing', 'hired']
  const stageCounts = stages.reduce((acc, s) => {
    acc[s] = applications?.filter(a => a.stage === s).length ?? 0
    return acc
  }, {} as Record<ApplicationStage, number>)

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {profile.company_name}
            {profile.is_verified && (
              <span style={{
                marginLeft: '8px', padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                background: 'rgba(16,185,129,0.15)', color: 'var(--green)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}>✓ Verified</span>
            )}
          </p>
        </div>
        <a href="/business/roles/new" style={{
          padding: '10px 20px', background: 'var(--red)', color: 'white',
          borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
        }}>
          + Post a Role
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Active Roles', value: activeJobs, colour: 'var(--red-l)' },
          { label: 'Total Applications', value: totalApps, colour: 'var(--text)' },
          { label: 'In Interview', value: stageCounts.interviewing, colour: 'var(--amber)' },
          { label: 'Hired', value: stageCounts.hired, colour: 'var(--green)' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '20px', background: 'var(--bg2)',
            border: '1px solid var(--border)', borderRadius: '10px',
          }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: stat.colour, marginBottom: '4px' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
            Pipeline Overview
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stages.map(stage => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)', width: '100px', flexShrink: 0 }}>
                  {STAGE_LABELS[stage]}
                </span>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg3)', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%',
                    width: totalApps > 0 ? `${(stageCounts[stage] / totalApps) * 100}%` : '0%',
                    background: stage === 'hired' ? 'var(--green)' : stage === 'interviewing' ? 'var(--amber)' : 'var(--red)',
                    borderRadius: '3px',
                  }} />
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text)', width: '24px', textAlign: 'right', flexShrink: 0 }}>
                  {stageCounts[stage]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
            Recent Activity
          </h2>
          {!applications || applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>
                No applications yet.
              </p>
              <a href="/business/talent" style={{
                fontSize: '13px', color: 'var(--red-l)', textDecoration: 'none',
              }}>Find talent →</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {applications.slice(0, 5).map((app: Record<string, unknown>) => {
                const job = app.job_postings as Record<string, unknown> | null
                const candidate = app.candidate_profiles as Record<string, unknown> | null
                return (
                  <div key={app.id as string} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                        {candidate?.first_name as string} {candidate?.last_name as string}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {job?.title as string}
                      </p>
                    </div>
                    <span style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                      background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)',
                    }}>
                      {STAGE_LABELS[app.stage as ApplicationStage]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{
        marginTop: '20px', padding: '20px', background: 'var(--bg2)',
        border: '1px solid var(--border)', borderRadius: '10px',
        display: 'flex', gap: '12px',
      }}>
        {[
          { label: 'Post a Role', href: '/business/roles/new', primary: true },
          { label: 'Find Talent', href: '/business/talent', primary: false },
          { label: 'View Pipeline', href: '/business/pipeline', primary: false },
          { label: 'Manage Roles', href: '/business/roles', primary: false },
        ].map(action => (
          <a key={action.label} href={action.href} style={{
            padding: '9px 18px',
            background: action.primary ? 'var(--red)' : 'var(--bg3)',
            color: action.primary ? 'white' : 'var(--muted)',
            border: action.primary ? 'none' : '1px solid var(--border)',
            borderRadius: '6px', textDecoration: 'none',
            fontSize: '13px', fontWeight: action.primary ? 600 : 400,
          }}>
            {action.label}
          </a>
        ))}
      </div>
    </div>
  )
}
