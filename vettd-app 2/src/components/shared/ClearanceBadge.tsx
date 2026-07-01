import { CLEARANCE_COLOURS } from '@/lib/utils'
import type { ClearanceLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  level: ClearanceLevel
  verified?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export default function ClearanceBadge({ level, verified = false, size = 'md', className }: Props) {
  const colourClass = CLEARANCE_COLOURS[level]
  const padding = size === 'sm' ? '2px 7px' : '4px 10px'
  const fontSize = size === 'sm' ? '11px' : '12px'

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        borderRadius: '4px',
        fontSize,
        fontWeight: 600,
        background: 'rgba(220,38,38,0.15)',
        color: 'var(--red-l)',
        border: '1px solid rgba(220,38,38,0.2)',
      }}
    >
      {level}
      {verified && (
        <span style={{ color: 'var(--green)', fontSize: '10px' }}>✓</span>
      )}
    </span>
  )
}
