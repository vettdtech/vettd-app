'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getInitials } from '@/lib/utils'

interface Props {
  profile: { first_name: string | null; last_name: string | null; avatar_url: string | null } | null
  userEmail: string
}

const NAV = [
  { href: '/candidate/dashboard',    label: 'Dashboard',     icon: '⊞' },
  { href: '/candidate/jobs',         label: 'Open Roles',    icon: '🎯' },
  { href: '/candidate/applications', label: 'Applications',  icon: '📋' },
  { href: '/candidate/profile',      label: 'My Profile',    icon: '👤' },
]

export default function CandidateSidebar({ profile, userEmail }: Props) {
  const pathname = usePathname()
  const initials = getInitials(profile?.first_name, profile?.last_name)
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : userEmail

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
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
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

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
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
              {active && (
                <div style={{
                  marginLeft: 'auto', width: '4px', height: '4px',
                  background: 'var(--red)', borderRadius: '50%',
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px', borderRadius: '6px', cursor: 'pointer',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--red-d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Candidate</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
