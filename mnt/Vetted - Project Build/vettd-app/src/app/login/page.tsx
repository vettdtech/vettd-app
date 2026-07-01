'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Get user role to redirect appropriately
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user!.id)
      .single()

    router.push(userData?.role === 'business' ? '/business/dashboard' : '/candidate/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left branding panel */}
      <div style={{
        width: '420px',
        background: 'linear-gradient(160deg, #150f0f 0%, #0f0d0d 60%, #080707 100%)',
        borderRight: '1px solid var(--border)',
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4.5 5L10 15L15.5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>Vettd</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px', lineHeight: 1.2 }}>
            The defence talent platform built for clearance.
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
            Connecting security-cleared professionals with the UK's leading defence and intelligence employers.
          </p>
        </div>

        {/* Trust items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '🔒', text: 'Clearance-verified talent only' },
            { icon: '🎯', text: 'Defence-exclusive platform' },
            { icon: '⚡', text: 'No noise from unrelated sectors' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
            Sign in to Vettd
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: '32px', fontSize: '14px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register/candidate" style={{ color: 'var(--red-l)', textDecoration: 'none' }}>
              Register as a Candidate
            </Link>
            {' '}or{' '}
            <Link href="/register/business" style={{ color: 'var(--red-l)', textDecoration: 'none' }}>
              Register your Business
            </Link>
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: '6px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: '6px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px', background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px',
                color: 'var(--red-l)', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? 'var(--border2)' : 'var(--red)',
                color: 'white', border: 'none', borderRadius: '6px',
                fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--faint)', textAlign: 'center' }}>
            By signing in you agree to the Vettd Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
