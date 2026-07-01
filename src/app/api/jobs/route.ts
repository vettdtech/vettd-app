import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const clearance = searchParams.get('clearance')
  const discipline = searchParams.get('discipline')
  const availability = searchParams.get('availability')

  let query = supabase
    .from('job_postings')
    .select('*, business_profiles (company_name, sector, is_verified)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (clearance) query = query.eq('clearance_required', clearance)
  if (discipline) query = query.contains('disciplines', [discipline])

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('job_postings')
    .insert({ ...body, business_id: profile.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('id')

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('job_postings')
    .update(body)
    .eq('id', jobId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
