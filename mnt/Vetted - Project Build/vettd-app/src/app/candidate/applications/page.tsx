import { createClient } from '@/lib/supabase/server'
import { STAGE_LABELS, STAGE_COLOURS } from '@/lib/utils'
import type { ApplicationStage } from '@/lib/types'

export default async function CandidateApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      job_postings (
        title, location, clearance_required, day_rate_min, day_rate_max, contract_length,
        business_profiles (company_name, sector, is_verified)
      )
    `)
    .eq('candidate_id', profile?.id ?? '')
    .order('updated_at', { ascending: false })

  const stages: ApplicationStage[] = ['proposal', 'shortlisted', 'interviewing', 'hired']
  const stageCounts = stages.reduce((acc, s) => {
    acc[s] = applications?.filter(a => a.stage === s).length ?? 0
    return acc
  }, {} as Record<ApplicationStage, number>)

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>My Applications</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {applications?.length ?? 0} total applications
        </p>
      </div>

      {/* Pipeline summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px',
      }}>
        {stages.map(stage => (
          <div key={stage} style={{
            padding: '16px', background: 'var(--bg2)',
            border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {stageCounts[stage]}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{STAGE_LABELS[stage]}</p>
          </div>
        ))}
      </div>

      {!applications || applications.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center',
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px',
        }}>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>No applications yet.</p>
          <a href="/candidate/jobs" style={{
            padding: '10px 20px', background: 'var(--red)', color: 'white',
            borderRadius: '6px', textDecoration: 'none', fontSize: '14px',
          }}>Browse Open Roles</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {applications.map((app: Record<string, unknown>) => {
            const job = app.job_postings as Record<string, unknown> | null
            const biz = job?.business_profiles as Record<string, unknown> | null
            return (
              <div key={app.id as string} style={{
                padding: '18px 22px', background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                      {job?.title as string ?? 'Role'}
                    </h3>
                    {biz?.is_verified && (
                      <span style={{
                        fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                        background: 'rgba(16,185,129,0.15)', color: 'var(--green)',
                        border: '1px solid rgba(16,185,129,0.3)',
                      }}>✓</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {biz?.company_name as string} · {job?.location as string ?? 'TBC'}
                    {job?.clearance_required && ` · ${job.clearance_required} required`}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--faint)' }}>
                    {new Date(app.updated_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)',
                  }}>
                    {STAGE_LABELS[app.stage as ApplicationStage]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
