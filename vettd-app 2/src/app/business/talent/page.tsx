import { createClient } from '@/lib/supabase/server'
import { CLEARANCE_COLOURS, AVAILABILITY_LABELS, formatDayRate } from '@/lib/utils'
import type { ClearanceLevel, Availability } from '@/lib/types'

export default async function BusinessTalentPage({
  searchParams,
}: {
  searchParams: { clearance?: string; discipline?: string; availability?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('candidate_profiles')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })

  if (searchParams.clearance) {
    query = query.eq('clearance_level', searchParams.clearance)
  }
  if (searchParams.availability) {
    query = query.eq('availability', searchParams.availability)
  }
  if (searchParams.discipline) {
    query = query.contains('disciplines', [searchParams.discipline])
  }

  const { data: candidates } = await query.limit(50)

  const CLEARANCE_LEVELS = ['BPSS', 'SC', 'DV', 'TS', 'SCI']

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Find Talent</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {candidates?.length ?? 0} security-cleared professionals available
        </p>
      </div>

      {/* Filters */}
      <form style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select
          name="clearance"
          defaultValue={searchParams.clearance ?? ''}
          style={{
            padding: '9px 14px', background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '6px', color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
          }}
        >
          <option value="">All clearance levels</option>
          {CLEARANCE_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          name="availability"
          defaultValue={searchParams.availability ?? ''}
          style={{
            padding: '9px 14px', background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '6px', color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
          }}
        >
          <option value="">Any availability</option>
          <option value="immediate">Available Now</option>
          <option value="1_month">Within 1 Month</option>
          <option value="3_months">Within 3 Months</option>
        </select>

        <button type="submit" style={{
          padding: '9px 18px', background: 'var(--red)', color: 'white',
          border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
        }}>
          Filter
        </button>
        {(searchParams.clearance || searchParams.availability || searchParams.discipline) && (
          <a href="/business/talent" style={{
            padding: '9px 14px', background: 'var(--bg3)',
            border: '1px solid var(--border)', borderRadius: '6px',
            fontSize: '13px', color: 'var(--muted)', textDecoration: 'none',
          }}>
            Clear
          </a>
        )}
      </form>

      {/* Candidate grid */}
      {!candidates || candidates.length === 0 ? (
        <div style={{
          padding: '64px', textAlign: 'center',
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px',
        }}>
          <p style={{ color: 'var(--muted)' }}>No candidates match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {candidates.map((candidate: Record<string, unknown>) => {
            const clearance = candidate.clearance_level as ClearanceLevel | null
            return (
              <div key={candidate.id as string} style={{
                padding: '20px', background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: '10px',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                      {candidate.first_name as string} {candidate.last_name as string}
                    </p>
                    {candidate.headline && (
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{candidate.headline as string}</p>
                    )}
                  </div>
                  {clearance && (
                    <span style={{
                      padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      background: 'rgba(220,38,38,0.15)', color: 'var(--red-l)',
                      border: '1px solid rgba(220,38,38,0.2)', flexShrink: 0,
                    }}>
                      {clearance}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {candidate.location && (
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>📍 {candidate.location as string}</p>
                  )}
                  {candidate.availability && (
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      🕐 {AVAILABILITY_LABELS[candidate.availability as Availability]}
                    </p>
                  )}
                  {(candidate.day_rate_min || candidate.day_rate_max) && (
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      💷 {formatDayRate(candidate.day_rate_min as number | null, candidate.day_rate_max as number | null)}
                    </p>
                  )}
                </div>

                {/* Disciplines */}
                {(candidate.disciplines as string[]).length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {(candidate.disciplines as string[]).slice(0, 3).map(d => (
                      <span key={d} style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                        background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)',
                      }}>
                        {d}
                      </span>
                    ))}
                    {(candidate.disciplines as string[]).length > 3 && (
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                        background: 'var(--bg3)', color: 'var(--faint)', border: '1px solid var(--border)',
                      }}>
                        +{(candidate.disciplines as string[]).length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={`/business/talent/${candidate.id as string}`} style={{
                    flex: 1, padding: '8px', textAlign: 'center',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: '6px', fontSize: '12px', color: 'var(--text)', textDecoration: 'none',
                  }}>
                    View Profile
                  </a>
                  <form action="/api/saved-candidates" method="POST" style={{ flex: 1 }}>
                    <input type="hidden" name="candidate_id" value={candidate.id as string} />
                    <button type="submit" style={{
                      width: '100%', padding: '8px',
                      background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: '6px', fontSize: '12px', color: 'var(--red-l)', cursor: 'pointer',
                    }}>
                      Save
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
