'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DISCIPLINES, CLEARANCE_COLOURS } from '@/lib/utils'
import type { CandidateProfile, ClearanceLevel } from '@/lib/types'

const CLEARANCE_LEVELS = ['BPSS', 'SC', 'DV', 'TS', 'SCI'] as const

export default function CandidateProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [clearance, setClearance] = useState('')
  const [disciplines, setDisciplines] = useState<string[]>([])
  const [yearsExp, setYearsExp] = useState('')
  const [availability, setAvailability] = useState('')
  const [dayRateMin, setDayRateMin] = useState('')
  const [dayRateMax, setDayRateMax] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setProfile(data)
        setFirstName(data.first_name ?? '')
        setLastName(data.last_name ?? '')
        setHeadline(data.headline ?? '')
        setBio(data.bio ?? '')
        setLocation(data.location ?? '')
        setClearance(data.clearance_level ?? '')
        setDisciplines(data.disciplines ?? [])
        setYearsExp(data.years_experience?.toString() ?? '')
        setAvailability(data.availability ?? '')
        setDayRateMin(data.day_rate_min?.toString() ?? '')
        setDayRateMax(data.day_rate_max?.toString() ?? '')
        setIsPublic(data.is_public)
      }
    }
    load()
  }, [supabase])

  function toggleDiscipline(d: string) {
    setDisciplines(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase
      .from('candidate_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        headline,
        bio,
        location,
        clearance_level: clearance as ClearanceLevel || null,
        disciplines,
        years_experience: yearsExp ? parseInt(yearsExp) : null,
        availability: availability as CandidateProfile['availability'] || null,
        day_rate_min: dayRateMin ? parseInt(dayRateMin) : null,
        day_rate_max: dayRateMax ? parseInt(dayRateMax) : null,
        is_public: isPublic,
      })
      .eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>My Profile</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>This is how employers see you on Vettd</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ accentColor: 'var(--red)', width: '16px', height: '16px' }} />
          <span style={{ fontSize: '13px', color: isPublic ? 'var(--green)' : 'var(--muted)' }}>
            {isPublic ? 'Profile visible' : 'Profile hidden'}
          </span>
        </label>
      </div>

      <form onSubmit={handleSave}>
        {/* Basic info */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Basic Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Professional headline</label>
              <input value={headline} onChange={e => setHeadline(e.target.value)} style={inputStyle} placeholder="e.g. Senior Cyber Security Engineer — DV Cleared" />
            </div>
            <div>
              <label style={labelStyle}>Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Brief professional summary..." />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} placeholder="London, UK" />
            </div>
          </div>
        </div>

        {/* Clearance & availability */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Clearance & Availability</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Security clearance level</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {CLEARANCE_LEVELS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClearance(c)}
                    style={{
                      padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer',
                      background: clearance === c ? 'rgba(220,38,38,0.2)' : 'var(--bg3)',
                      border: `1px solid ${clearance === c ? 'var(--red)' : 'var(--border)'}`,
                      color: clearance === c ? 'var(--red-l)' : 'var(--muted)',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Availability</label>
              <select value={availability} onChange={e => setAvailability(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select…</option>
                <option value="immediate">Available Immediately</option>
                <option value="1_month">Available in 1 Month</option>
                <option value="3_months">Available in 3 Months</option>
                <option value="not_looking">Not Currently Looking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Disciplines */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Disciplines</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {DISCIPLINES.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDiscipline(d)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                  background: disciplines.includes(d) ? 'rgba(220,38,38,0.2)' : 'var(--bg3)',
                  border: `1px solid ${disciplines.includes(d) ? 'var(--red)' : 'var(--border)'}`,
                  color: disciplines.includes(d) ? 'var(--red-l)' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Rate & experience */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Rate & Experience</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Day rate min (£)</label>
              <input type="number" value={dayRateMin} onChange={e => setDayRateMin(e.target.value)} style={inputStyle} placeholder="400" />
            </div>
            <div>
              <label style={labelStyle}>Day rate max (£)</label>
              <input type="number" value={dayRateMax} onChange={e => setDayRateMax(e.target.value)} style={inputStyle} placeholder="600" />
            </div>
            <div>
              <label style={labelStyle}>Years experience</label>
              <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} style={inputStyle} placeholder="8" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 28px',
            background: saved ? 'var(--green)' : saving ? 'var(--border2)' : 'var(--red)',
            color: 'white', border: 'none', borderRadius: '6px',
            fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
