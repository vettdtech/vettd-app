# Vettd App — Setup Guide

This guide takes you from zero to a live app at `app.vettd.com` in approximately 2–3 hours.

---

## Prerequisites

- Node.js 18+ installed on your computer
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- A [Resend](https://resend.com) account (free tier is fine for trial)
- Your domain (`vettd.com`) managed via your DNS provider

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g. `vettd-prod`), a strong database password, and the **Europe West** region
4. Wait ~2 minutes for the project to provision

### Get your credentials

In the Supabase dashboard → **Settings → API**:

- Copy **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role key** (keep this secret) → this is your `SUPABASE_SERVICE_ROLE_KEY`

### Run the schema

1. In the Supabase dashboard → **SQL Editor**
2. Click **New query**
3. Open `supabase/schema.sql` from this project and paste the entire contents
4. Click **Run** — you should see "Success. No rows returned."

### Configure Auth

In Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://app.vettd.com`
- **Redirect URLs**: Add `https://app.vettd.com/api/auth/callback`

For local development also add:
- `http://localhost:3000`
- `http://localhost:3000/api/auth/callback`

---

## Step 2 — Set up environment variables locally

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=re_your_key
   RESEND_FROM_EMAIL=no-reply@vettd.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## Step 3 — Run locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the Vettd login page.

**Test the flow:**
1. Go to `/register/candidate` and create a test candidate account
2. Go to `/register/business` and create a test business account
3. Sign in as business → post a role
4. Sign in as candidate → apply to the role
5. Sign in as business → check the pipeline

---

## Step 4 — Deploy to Vercel

### Connect the project

1. Push this folder to a GitHub repository (make it private)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Vercel will detect Next.js automatically

### Add environment variables in Vercel

In the Vercel project → **Settings → Environment Variables**, add all five variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_APP_URL=https://app.vettd.com
```

5. Click **Deploy**

---

## Step 5 — Connect your domain

### In Vercel

1. Go to your project → **Settings → Domains**
2. Add `app.vettd.com`
3. Vercel will show you the DNS records to add (typically a CNAME)

### In your DNS provider

Add the CNAME record Vercel gives you, pointing `app` to Vercel's servers.

DNS propagation takes 5–30 minutes.

---

## Step 6 — Update Supabase with the production URL

Back in Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://app.vettd.com`
- **Redirect URLs**: `https://app.vettd.com/api/auth/callback`

---

## Step 7 — Set up Resend (email)

1. Go to [resend.com](https://resend.com) → create an account
2. Add your domain (`vettd.com`) and verify it (adds DNS records)
3. Create an API key and add it to your Vercel environment variables
4. Update `RESEND_FROM_EMAIL` to `no-reply@vettd.com`

---

## File Structure

```
vettd-app/
├── supabase/
│   └── schema.sql              # Run this in Supabase SQL Editor
├── src/
│   ├── app/
│   │   ├── login/              # Sign in page
│   │   ├── register/
│   │   │   ├── candidate/      # Candidate registration (3-step)
│   │   │   └── business/       # Business registration (3-step)
│   │   ├── candidate/          # Candidate portal
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── jobs/
│   │   │   └── applications/
│   │   ├── business/           # Business portal
│   │   │   ├── dashboard/
│   │   │   ├── roles/
│   │   │   ├── pipeline/
│   │   │   ├── talent/
│   │   │   └── settings/
│   │   └── api/                # API routes
│   │       ├── auth/callback/
│   │       ├── candidate/profile/
│   │       ├── jobs/
│   │       └── applications/
│   ├── components/
│   │   ├── layout/             # Sidebars
│   │   └── shared/             # Reusable components
│   └── lib/
│       ├── supabase/           # Client + server helpers
│       ├── types.ts            # TypeScript types + Database schema
│       └── utils.ts            # Helpers, constants
├── middleware.ts               # Route protection
└── .env.local.example          # Environment variables template
```

---

## Day-1 checklist for your trial launch

- [ ] Schema running in Supabase
- [ ] At least one business account created and verified manually
- [ ] At least one role posted
- [ ] First candidate invited to register
- [ ] Custom domain live at app.vettd.com
- [ ] Email sending confirmed via Resend

---

## Support

Questions? Contact: jamie@fidaris.io
