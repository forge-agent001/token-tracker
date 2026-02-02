# Token Tracker

A web app to track API token usage from Anthropic and Moonshot.ai.

## Tech Stack

- **Next.js 15** - React framework
- **Supabase** - Auth & Database
- **Tailwind CSS** - Styling
- **Vercel** - Hosting

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/forge-agent001/token-tracker.git
cd token-tracker
npm install
```

### 2. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL in `supabase/schema.sql` in the SQL Editor
4. Copy your Project URL and Anon Key from Settings > API

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Encryption (generate a secure key)
ENCRYPTION_KEY=your_32_character_encryption_key
```

Generate encryption key:
```bash
openssl rand -base64 32
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

## Features

- User authentication (email/password)
- Secure API key storage (encrypted)
- Token usage dashboard for Anthropic & Moonshot.ai
- Clean, responsive UI

## API Providers

### Anthropic
- Usage endpoint: `GET /v1/organizations/{org_id}/cost_report`
- Admin API key required for organization-level usage

### Moonshot.ai
- Balance endpoint: `GET /v1/balance`
- Standard API key authentication
