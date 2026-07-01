'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DISCIPLINES, SECTORS } from '@/lib/utils'

const CLEARANCE_LEVELS = ['BPSS', 'SC', 'DV', 'TS', 'SCI'] as const

export default function NewRolePage() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [remoteOk, setRemoteOk] = useState(false)
  const [clearanceRequired, setClearanceRequired] = useState('')
  const [disciplines, setDisciplines] = useState<string[]>([])
  const [dayRateMin, setDayRateMin] = useState('')
  const [dayRateMax, setDayRateMax] = useState('')
  const [contractLength, setContractLength] = useState('')
  const [status, setStatus] = useState<'draft' | 'active'>('active')

  function toggleDiscipline(d: string) {
    setDisciplines(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSaving(false); return }

    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) { setError('Business profile not found'); setSaving(false); return }

    const { error: insertError } = await supabase.from('job_postings').insert({
      business_id: profile.id,
      title,
      description,
      location,
      remote_ok: remoteOk,
      clearance_required: clearanceRequired as 'BPSS' | 'SC' | 'DV' | 'TS' | 'SCI' | undefined,
      disciplines,
      day_rate_min: dayRateMin ? parseInt(dayRateMin) : null,
      day_rate_max: dayRateMax ? parseInt(dayRateMax) : null,
      contract_length: contractLength || null,
      status,
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push('/business/roles')
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '6px', color: 'var(--text)', fontSize: '14px', outline: 'none',
  }
  const labelStyle = {
    display: 'block' as const, fontSize: '13px', fontWeight: 500,
    color: 'var(--muted)', marginBottom: '6px',
  }
  const sectionStyle = {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '24px', marginBottom: '20px',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '28px' }}>
        <a href="/business/roles" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to Roles
        </a>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginTop: '12px', marginBottom: '4px' }}>
          Post a Role
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Roles are only visible to candidates who meet the clearance requirement.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Role Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Role title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} placeholder="e.g. Senior Cyber Security Engineer" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Role overview, responsibilities, requirements..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} placeholder="London, UK" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '2px' }}>
                <input type="checkbox" checked={remoteOk} onChange={e => setRemoteOk(e.target.checked)} style={{ accentColor: 'var(--red)' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Remote OK</span>
              </label>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Clearance & Disciplines</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Minimum clearance required</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {CLEARANCE_LEVELS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClearanceRequired(clearanceRequired === c ? '' : c)}
                    style={{
                      padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer',
                      background: clearanceRequired === c ? 'rgba(220,38,38,0.2)' : 'var(--bg3)',
                      border: `1px solid ${clearanceRequired === c ? 'var(--red)' : 'var(--border)'}`,
                      color: clearanceRequired === c ? 'var(--red-l)' : 'var(--muted)',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Required disciplines</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {DISCIPLINES.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDiscipline(d)}
                    style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                      background: disciplines.includes(d) ? 'rgba(220,38,38,0.2)' : 'var(--bg3)',
                      border: `1px solid ${disciplines.includes(d) ? 'var(--red)' : 'var(--border)'}`,
                      color: disciplines.includes(d) ? 'var(--red-l)' : 'var(--muted)',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Contract & Rate</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Day rate min (£)</label>
              <input type="number" value={dayRateMin} onChange={e => setDayRateMin(e.target.value)} style={inputStyle} placeholder="400" />
            </div>
            <div>
              <label style={labelStyle}>Day rate max (£)</label>
              <input type="number" value={dayRateMax} onChange={e => setDayRateMax(e.target.value)} style={inputStyle} placeholder="700" />
            </div>
            <div>
              <label style={labelStyle}>Contract length</label>
              <input value={contractLength} onChange={e => setContractLength(e.target.value)} style={inputStyle} placeholder="6 months" />
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px', background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px',
            color: 'var(--red-l)', fontSize: '13px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => { setStatus('draft'); }}
            style={{
              padding: '12px 24px', background: 'var(--bg3)',
              color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: '6px', fontSize: '14px', cursor: 'pointer',
            }}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 28px',
              background: saving ? 'var(--border2)' : 'var(--red)',
              color: 'white', border: 'none', borderRadius: '6px',
              fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Posting…' : 'Publish Role'}
          </button>
        </div>
      </form>
    </div>
  )
}
