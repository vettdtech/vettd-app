import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClearanceLevel, Availability, ApplicationStage } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CLEARANCE_LABELS: Record<ClearanceLevel, string> = {
  BPSS: 'BPSS',
  SC: 'SC',
  DV: 'DV',
  TS: 'TS/SCI',
  SCI: 'SCI',
}

export const CLEARANCE_COLOURS: Record<ClearanceLevel, string> = {
  BPSS: 'bg-gray-700 text-gray-200',
  SC:   'bg-blue-900 text-blue-200',
  DV:   'bg-amber-900 text-amber-200',
  TS:   'bg-red-900 text-red-200',
  SCI:  'bg-purple-900 text-purple-200',
}

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  immediate:  'Available Immediately',
  '1_month':  'Available in 1 Month',
  '3_months': 'Available in 3 Months',
  not_looking:'Not Currently Looking',
}

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  proposal:    'Proposal',
  shortlisted: 'Shortlisted',
  interviewing:'Interviewing',
  hired:       'Hired',
  rejected:    'Rejected',
  withdrawn:   'Withdrawn',
}

export const STAGE_COLOURS: Record<ApplicationStage, string> = {
  proposal:    'bg-gray-700 text-gray-200',
  shortlisted: 'bg-blue-900 text-blue-200',
  interviewing:'bg-amber-900 text-amber-200',
  hired:       'bg-green-900 text-green-200',
  rejected:    'bg-red-900 text-red-200',
  withdrawn:   'bg-gray-800 text-gray-400',
}

export const DISCIPLINES = [
  'Software Engineering',
  'Cyber Security',
  'Intelligence Analysis',
  'Systems Engineering',
  'Project Management',
  'Logistics & Supply Chain',
  'Communications & Networks',
  'Electronic Warfare',
  'ISTAR',
  'Data Science & AI',
  'Finance & Commercial',
  'Legal & Compliance',
  'Human Resources',
  'Operations',
]

export const SECTORS = [
  'Defence Prime',
  'Government / MOD',
  'Intelligence Agency',
  'Law Enforcement',
  'Aerospace',
  'Maritime',
  'Land Systems',
  'Cyber & Information',
  'Consultancy',
  'Technology',
]

export function formatDayRate(min: number | null, max: number | null): string {
  if (!min && !max) return 'Rate negotiable'
  if (min && max) return `£${min.toLocaleString()} – £${max.toLocaleString()}/day`
  if (min) return `£${min.toLocaleString()}+/day`
  return `Up to £${max!.toLocaleString()}/day`
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.[0] ?? ''
  const l = lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '??'
}
