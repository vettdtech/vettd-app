import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let data, error

  if (userData?.role === 'candidate') {
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const result = await supabase
      .from('applications')
      .select('*, job_postings (title, business_profiles (company_name))')
      .eq('candidate_id', profile?.id ?? '')
      .order('created_at', { ascending: false })

    data = result.data
    error = result.error
  } else {
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const result = await supabase
      .from('applications')
      .select('*, candidate_profiles (first_name, last_name, clearance_level), job_postings (title)')
      .eq('business_id', profile?.id ?? '')
      .order('created_at', { ascending: false })

    data = result.data
    error = result.error
  }

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

  const body = await request.json()
  const { job_id } = body

  if (!job_id) {
    return NextResponse.json({ error: 'job_id required' }, { status: 400 })
  }

  // Get candidate profile
  const { data: candidate } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidate) {
    return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
  }

  // Get job to find business_id
  const { data: job } = await supabase
    .from('job_postings')
    .select('business_id')
    .eq('id', job_id)
    .single()

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id,
      candidate_id: candidate.id,
      business_id: job.business_id,
      stage: 'proposal',
    })
    .select()
    .single()

  if (error) {
    // Unique constraint = already applied
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already applied to this role' }, { status: 409 })
    }
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
  const appId = searchParams.get('id')
  const body = await request.json()

  const { data, error } = await supabase
    .from('applications')
    .update(body)
    .eq('id', appId!)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
