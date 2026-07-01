import { createClient } from '@/lib/supabase/server'
import { formatDayRate } from '@/lib/utils'
import type { ClearanceLevel } from '@/lib/types'

export default async function CandidateJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: jobs } = await supabase
    .from('job_postings')
    .select(`*, business_profiles (company_name, sector, is_verified)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: applied } = await supabase
    .from('applications')
    .select('job_id')
    .eq('candidate_id', profile?.id ?? '')

  const appliedJobIds = new Set(applied?.map(a => a.job_id) ?? [])

  const CLEARANCE_ORDER: Record<string, number> = { BPSS: 1, SC: 2, DV: 3, TS: 4, SCI: 5 }

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Open Roles</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {jobs?.length ?? 0} active roles matching cleared defence professionals
        </p>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center',
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px',
        }}>
          <p style={{ color: 'var(--muted)' }}>No active roles right now. Check back soon.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map((job: Record<string, unknown>) => {
            const biz = job.business_profiles as Record<string, unknown> | null
            const hasApplied = appliedJobIds.has(job.id as string)
            return (
              <div key={job.id as string} style={{
                padding: '20px 24px', background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                      {job.title as string}
                    </h3>
                    {biz?.is_verified && (
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                        background: 'rgba(16,185,129,0.15)', color: 'var(--green)',
                        border: '1px solid rgba(16,185,129,0.3)', fontWeight: 500,
                      }}>✓ Verified</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                    {biz?.company_name as string} · {job.location as string ?? 'Location TBC'}
                    {job.remote_ok && ' · Remote OK'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {job.clearance_required && (
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                        background: 'rgba(220,38,38,0.15)', color: 'var(--red-l)',
                        border: '1px solid rgba(220,38,38,0.3)',
                      }}>
                        {job.clearance_required as string} min.
                      </span>
                    )}
                    {job.contract_length && (
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '12px',
                        background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)',
                      }}>
                        {job.contract_length as string}
                      </span>
                    )}
                    <span style={{
                      padding: '3px 10px', borderRadius: '4px', fontSize: '12px',
                      background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)',
                    }}>
                      {formatDayRate(job.day_rate_min as number | null, job.day_rate_max as number | null)}
                    </span>
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {hasApplied ? (
                    <span style={{
                      padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                      background: 'var(--bg3)', color: 'var(--green)',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}>
                      ✓ Applied
                    </span>
                  ) : (
                    <form action={`/api/applications`} method="POST">
                      <input type="hidden" name="job_id" value={job.id as string} />
                      <button
                        type="submit"
                        style={{
                          padding: '8px 20px', background: 'var(--red)',
                          color: 'white', border: 'none', borderRadius: '6px',
                          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        }}
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
