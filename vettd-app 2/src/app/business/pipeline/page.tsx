import { createClient } from '@/lib/supabase/server'
import { STAGE_LABELS, CLEARANCE_COLOURS } from '@/lib/utils'
import type { ApplicationStage, ClearanceLevel } from '@/lib/types'

const STAGES: ApplicationStage[] = ['proposal', 'shortlisted', 'interviewing', 'hired']

const STAGE_BORDER: Record<ApplicationStage, string> = {
  proposal:    'var(--border)',
  shortlisted: 'rgba(59,130,246,0.4)',
  interviewing:'rgba(245,158,11,0.4)',
  hired:       'rgba(16,185,129,0.4)',
  rejected:    'var(--border)',
  withdrawn:   'var(--border)',
}

export default async function BusinessPipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      candidate_profiles (first_name, last_name, clearance_level, location, disciplines),
      job_postings (title)
    `)
    .eq('business_id', profile?.id ?? '')
    .in('stage', STAGES)

  const byStage = STAGES.reduce((acc, s) => {
    acc[s] = applications?.filter(a => a.stage === s) ?? []
    return acc
  }, {} as Record<ApplicationStage, typeof applications>)

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Pipeline</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {applications?.length ?? 0} active candidates across all stages
        </p>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', minHeight: '400px' }}>
        {STAGES.map(stage => {
          const cards = byStage[stage] ?? []
          return (
            <div key={stage} style={{
              background: 'var(--bg2)', border: `1px solid ${STAGE_BORDER[stage]}`,
              borderRadius: '10px', overflow: 'hidden',
            }}>
              {/* Column header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${STAGE_BORDER[stage]}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                  {STAGE_LABELS[stage]}
                </span>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: 'var(--muted)', fontWeight: 600,
                }}>
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cards.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--faint)', textAlign: 'center', padding: '16px 0' }}>
                    No candidates
                  </p>
                ) : (
                  cards.map((app: Record<string, unknown>) => {
                    const candidate = app.candidate_profiles as Record<string, unknown> | null
                    const job = app.job_postings as Record<string, unknown> | null
                    const clearance = candidate?.clearance_level as ClearanceLevel | null
                    return (
                      <div key={app.id as string} style={{
                        padding: '12px', background: 'var(--bg3)',
                        border: '1px solid var(--border)', borderRadius: '7px',
                      }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                          {candidate?.first_name as string} {candidate?.last_name as string}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>
                          {job?.title as string}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {clearance && (
                            <span style={{
                              padding: '2px 7px', borderRadius: '3px', fontSize: '11px', fontWeight: 600,
                              background: 'rgba(220,38,38,0.15)', color: 'var(--red-l)',
                              border: '1px solid rgba(220,38,38,0.2)',
                            }}>
                              {clearance}
                            </span>
                          )}
                          {candidate?.location && (
                            <span style={{
                              padding: '2px 7px', borderRadius: '3px', fontSize: '11px',
                              background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)',
                            }}>
                              {candidate.location as string}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
