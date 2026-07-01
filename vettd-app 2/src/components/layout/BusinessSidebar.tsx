'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  profile: { company_name: string; is_verified: boolean; plan: string } | null
  userEmail: string
}

const NAV = [
  { href: '/business/dashboard', label: 'Dashboard',     icon: '⊞' },
  { href: '/business/roles',     label: 'My Roles',      icon: '📌' },
  { href: '/business/pipeline',  label: 'Pipeline',      icon: '⟿' },
  { href: '/business/talent',    label: 'Find Talent',   icon: '🔍' },
  { href: '/business/settings',  label: 'Settings',      icon: '⚙' },
]

export default function BusinessSidebar({ profile, userEmail }: Props) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '220px',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
          borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M4.5 5L10 15L15.5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>Vettd</span>
      </div>

      {/* Company name */}
      {profile && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.company_name}
            </p>
            {profile.is_verified && (
              <span style={{ fontSize: '11px', color: 'var(--green)', flexShrink: 0 }}>✓</span>
            )}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', textTransform: 'capitalize' }}>
            {profile.plan} plan
          </p>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/business/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '6px',
                textDecoration: 'none', transition: 'background 0.15s',
                background: active ? 'rgba(220,38,38,0.12)' : 'transparent',
                color: active ? 'var(--red-l)' : 'var(--muted)',
                fontSize: '13px', fontWeight: active ? 600 : 400,
              }}
            >
              <span style={{ fontSize: '14px', opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div style={{ margin: '8px 0', borderTop: '1px solid var(--border)' }} />

        <Link
          href="/business/roles/new"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '9px 10px', borderRadius: '6px',
            textDecoration: 'none', background: 'rgba(220,38,38,0.15)',
            border: '1px solid rgba(220,38,38,0.3)', color: 'var(--red-l)',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          + Post a Role
        </Link>
      </nav>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '11px', color: 'var(--muted)', padding: '4px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userEmail}
        </p>
      </div>
    </aside>
  )
}
