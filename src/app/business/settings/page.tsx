'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SECTORS } from '@/lib/utils'
import type { BusinessProfile } from '@/lib/types'

export default function BusinessSettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [sector, setSector] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [companySize, setCompanySize] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setProfile(data)
        setCompanyName(data.company_name ?? '')
        setSector(data.sector ?? '')
        setWebsite(data.website ?? '')
        setDescription(data.description ?? '')
        setCompanySize(data.company_size ?? '')
      }
    }
    load()
  }, [supabase])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase
      .from('business_profiles')
      .update({ company_name: companyName, sector, website, description, company_size: companySize as BusinessProfile['company_size'] })
      .eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
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

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Manage your company profile and account</p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '24px', marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
            Company Profile
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Company name</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Sector</label>
                <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Company size</label>
                <select value={companySize} onChange={e => setCompanySize(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="201-1000">201–1,000</option>
                  <option value="1000+">1,000+</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://example.com" />
            </div>
            <div>
              <label style={labelStyle}>Company description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
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
            marginBottom: '24px',
          }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </form>

      {/* Plan info */}
      {profile && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '24px', marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
            Plan & Billing
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px', textTransform: 'capitalize' }}>
                {profile.plan} Plan
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                {profile.plan === 'trial' ? 'Free trial — upgrade to access all features' : 'Active subscription'}
              </p>
            </div>
            {profile.plan === 'trial' && (
              <button style={{
                padding: '9px 18px', background: 'var(--red)',
                color: 'white', border: 'none', borderRadius: '6px',
                fontSize: '13px', cursor: 'pointer', fontWeight: 500,
              }}>
                Upgrade
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sign out */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '24px',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
          Account
        </h2>
        <button
          onClick={handleSignOut}
          style={{
            padding: '10px 20px', background: 'transparent',
            border: '1px solid rgba(220,38,38,0.4)', borderRadius: '6px',
            fontSize: '13px', color: 'var(--red-l)', cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
