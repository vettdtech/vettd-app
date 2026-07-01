import { createClient } from '@/lib/supabase/server'
import { formatDayRate } from '@/lib/utils'
import type { JobStatus } from '@/lib/types'

const STATUS_COLOURS: Record<JobStatus, { bg: string; text: string }> = {
  active:  { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  draft:   { bg: 'var(--bg3)', text: 'var(--muted)' },
  closed:  { bg: 'var(--bg3)', text: 'var(--faint)' },
  filled:  { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' },
}

export default async function BusinessRolesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: jobs } = await supabase
    .from('job_postings')
    .select('*')
    .eq('business_id', profile?.id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>My Roles</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {jobs?.filter(j => j.status === 'active').length ?? 0} active · {jobs?.length ?? 0} total
          </p>
        </div>
        <a href="/business/roles/new" style={{
          padding: '10px 20px', background: 'var(--red)', color: 'white',
          borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
        }}>
          + Post a Role
        </a>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div style={{
          padding: '64px', textAlign: 'center',
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px',
        }}>
          <p style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '15px' }}>
            No roles posted yet.
          </p>
          <a href="/business/roles/new" style={{
            padding: '10px 24px', background: 'var(--red)', color: 'white',
            borderRadius: '6px', textDecoration: 'none', fontSize: '14px',
          }}>Post Your First Role</a>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Role', 'Clearance', 'Rate', 'Status', 'Posted', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: 500, color: 'var(--muted)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job: Record<string, unknown>, i: number) => {
                const colours = STATUS_COLOURS[job.status as JobStatus]
                return (
                  <tr key={job.id as string} style={{
                    borderBottom: i < jobs.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>
                        {job.title as string}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {job.location as string ?? 'Location TBC'}
                        {job.remote_ok && ' · Remote OK'}
                      </p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                        background: 'rgba(220,38,38,0.15)', color: 'var(--red-l)',
                        border: '1px solid rgba(220,38,38,0.2)',
                      }}>
                        {job.clearance_required as string ?? 'Any'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--muted)' }}>
                      {formatDayRate(job.day_rate_min as number | null, job.day_rate_max as number | null)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                        background: colours.bg, color: colours.text,
                      }}>
                        {(job.status as string).charAt(0).toUpperCase() + (job.status as string).slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--muted)' }}>
                      {new Date(job.created_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <a href={`/business/roles/${job.id as string}`} style={{
                        padding: '6px 14px', background: 'var(--bg3)',
                        border: '1px solid var(--border)', borderRadius: '5px',
                        fontSize: '12px', color: 'var(--text)', textDecoration: 'none',
                      }}>
                        Manage
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
