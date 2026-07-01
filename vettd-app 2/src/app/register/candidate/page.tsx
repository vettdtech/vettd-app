'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DISCIPLINES } from '@/lib/utils'

const CLEARANCE_LEVELS = ['BPSS', 'SC', 'DV', 'TS', 'SCI'] as const

export default function CandidateRegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 — Profile
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [clearance, setClearance] = useState('')
  const [location, setLocation] = useState('')
  const [disciplines, setDisciplines] = useState<string[]>([])
  const [availability, setAvailability] = useState('')

  // Step 3 — Terms
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptConfidentiality, setAcceptConfidentiality] = useState(false)

  function toggleDiscipline(d: string) {
    setDisciplines(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

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
      }
      setError(null)
      setStep(s => s + 1)
      return
    }

    // Final submission
    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'candidate' },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Create candidate profile
      await supabase.from('candidate_profiles').insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        clearance_level: clearance as 'BPSS' | 'SC' | 'DV' | 'TS' | 'SCI' | undefined,
        location,
        disciplines,
        availability: availability as 'immediate' | '1_month' | '3_months' | 'not_looking' | undefined,
      })
    }

    router.push('/candidate/dashboard')
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
          {['Account', 'Profile', 'Confirm'].map((label, i) => (
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
          {step === 1 && 'Create your account'}
          {step === 2 && 'Tell us about yourself'}
          {step === 3 && 'Almost there'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>
          {step === 1 && <>Already registered? <Link href="/login" style={{ color: 'var(--red-l)', textDecoration: 'none' }}>Sign in</Link></>}
          {step === 2 && 'You can update this later from your profile'}
          {step === 3 && 'Review and agree to our terms to complete registration'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {step === 1 && (
            <>
              <div>
                <label style={labelStyle}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="you@example.com" />
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} placeholder="Jane" />
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} placeholder="Smith" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Current clearance level</label>
                <select value={clearance} onChange={e => setClearance(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select clearance…</option>
                  {CLEARANCE_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location (city / country)</label>
                <input value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} placeholder="London, UK" />
              </div>
              <div>
                <label style={labelStyle}>Primary disciplines (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
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
                        transition: 'all 0.15s',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select availability…</option>
                  <option value="immediate">Available Immediately</option>
                  <option value="1_month">Available in 1 Month</option>
                  <option value="3_months">Available in 3 Months</option>
                  <option value="not_looking">Not Currently Looking</option>
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{
                padding: '16px', background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: '8px',
                fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6,
              }}>
                <p style={{ marginBottom: '12px' }}>
                  By registering, you agree that information you provide will be shared with verified businesses on the platform in connection with defence and government roles. Your security clearance status is treated as sensitive information.
                </p>
                <p>
                  All businesses on Vettd are subject to our vetting process. You can manage your privacy settings and profile visibility at any time.
                </p>
              </div>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} style={{ marginTop: '2px', accentColor: 'var(--red)' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  I agree to the Vettd Terms of Service and Privacy Policy
                </span>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={acceptConfidentiality} onChange={e => setAcceptConfidentiality(e.target.checked)} style={{ marginTop: '2px', accentColor: 'var(--red)' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  I understand that my profile information, including clearance level, will be shared with vetted businesses seeking cleared candidates
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
              disabled={loading || (step === 3 && (!acceptTerms || !acceptConfidentiality))}
              style={{
                flex: 1, padding: '12px',
                background: loading || (step === 3 && (!acceptTerms || !acceptConfidentiality)) ? 'var(--border2)' : 'var(--red)',
                color: 'white', border: 'none', borderRadius: '6px',
                fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Creating account…' : step < 3 ? 'Continue' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
