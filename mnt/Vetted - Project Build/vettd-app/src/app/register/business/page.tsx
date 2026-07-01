'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SECTORS } from '@/lib/utils'

export default function BusinessRegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 — Company info
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactTitle, setContactTitle] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [sector, setSector] = useState('')
  const [referral, setReferral] = useState('')

  // Step 3 — Confirm
  const [acceptTerms, setAcceptTerms] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (step < 3) {
      if (step === 1) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters')
          return
        }
        if (!companyName && step === 1) {
          // allow through — company collected in step 2
        }
      }
      setError(null)
      setStep(s => s + 1)
      return
    }

    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'business', company_name: companyName, contact_name: contactName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase.from('business_profiles').insert({
        user_id: authData.user.id,
        company_name: companyName,
        company_size: companySize as '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | undefined,
        sector,
      })
    }

    router.push('/business/dashboard')
    router.refresh()
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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
            borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M4.5 5L10 15L15.5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>Vettd</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {['Account', 'Company', 'Review'].map((label, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '3px', borderRadius: '2px', marginBottom: '6px',
                background: i + 1 <= step ? 'var(--red)' : 'var(--border)',
                transition: 'background 0.2s',
              }} />
              <span style={{ fontSize: '11px', color: i + 1 === step ? 'var(--red-l)' : 'var(--faint)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          {step === 1 && 'Create a business account'}
          {step === 2 && 'About your organisation'}
          {step === 3 && 'Review & submit'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>
          {step === 1 && <>Registering as a candidate? <Link href="/register/candidate" style={{ color: 'var(--red-l)', textDecoration: 'none' }}>Sign up here</Link></>}
          {step === 2 && 'This information helps us match you with the right candidates'}
          {step === 3 && 'Business accounts are manually reviewed before activation (typically within 1 business day)'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {step === 1 && (
            <>
              <div>
                <label style={labelStyle}>Work email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="you@company.com" />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label style={labelStyle}>Confirm password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label style={labelStyle}>Company name</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} required style={inputStyle} placeholder="e.g. BAE Systems" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Your name</label>
                  <input value={contactName} onChange={e => setContactName(e.target.value)} style={inputStyle} placeholder="Jane Smith" />
                </div>
                <div>
                  <label style={labelStyle}>Job title</label>
                  <input value={contactTitle} onChange={e => setContactTitle(e.target.value)} style={inputStyle} placeholder="Talent Acquisition" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Company size</label>
                <select value={companySize} onChange={e => setCompanySize(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-1000">201–1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Primary sector</label>
                <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>How did you hear about Vettd?</label>
                <select value={referral} onChange={e => setReferral(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="recommendation">Recommendation / Word of mouth</option>
                  <option value="search">Online search</option>
                  <option value="event">Industry event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Summary */}
              <div style={{
                padding: '16px', background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                {[
                  ['Email', email],
                  ['Company', companyName],
                  ['Contact', contactName || '—'],
                  ['Sector', sector || '—'],
                  ['Size', companySize || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted)' }}>{k}</span>
                    <span style={{ color: 'var(--text)' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '14px', background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px',
                fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6,
              }}>
                Business accounts are subject to manual review to ensure all organisations using Vettd operate in the defence and security sector. You will receive a confirmation email within 1 business day.
              </div>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} style={{ marginTop: '2px', accentColor: 'var(--red)' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  I agree to the Vettd Terms of Service, Privacy Policy, and confirm this organisation operates in the defence, security or intelligence sector
                </span>
              </label>
            </>
          )}

          {error && (
            <div style={{
              padding: '12px', background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px',
              color: 'var(--red-l)', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setStep(s => s - 1); setError(null) }}
                style={{
                  flex: 1, padding: '12px',
                  background: 'var(--bg3)', color: 'var(--muted)',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading || (step === 3 && !acceptTerms)}
              style={{
                flex: 1, padding: '12px',
                background: loading || (step === 3 && !acceptTerms) ? 'var(--border2)' : 'var(--red)',
                color: 'white', border: 'none', borderRadius: '6px',
                fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting…' : step < 3 ? 'Continue' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
