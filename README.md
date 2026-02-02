# Token Tracker

A web app to track API token usage from Anthropic and Moonshot.ai.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fforge-agent001%2Ftoken-tracker&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ENCRYPTION_KEY&envDescription=Supabase%20and%20encryption%20environment%20variables&envLink=https%3A%2F%2Fgithub.com%2Fforge-agent001%2Ftoken-tracker%23environment-variables)

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Supabase** - Auth & Database
- **Tailwind CSS** - Styling
- **Vercel** - Hosting

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/forge-agent001/token-tracker.git
cd token-tracker
npm install
```

### 2. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to the SQL Editor and run the schema from `supabase/schema.sql`
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

### Option 1: One-Click Deploy (Recommended)

Click the "Deploy with Vercel" button above and follow the prompts.

### Option 2: Manual Deploy

1. Push to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Add environment variables from above
6. Deploy!

## Features

- 🔐 User authentication (email/password via Supabase Auth)
- 🔒 Secure API key storage (AES-256-GCM encryption)
- 📊 Token usage dashboard for Anthropic & Moonshot.ai
- 📱 Clean, responsive UI with Tailwind CSS

## API Providers

### Anthropic
- Requires Admin API key for organization-level usage
- Supports token tracking and cost estimation
- API endpoint: `https://api.anthropic.com/v1/organizations/{org_id}/cost_report`

### Moonshot.ai
- Standard API key authentication
- Balance tracking available
- API endpoint: `https://api.moonshot.ai/v1/balance`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── anthropic/usage/route.ts
│   │   ├── moonshot/usage/route.ts
│   │   └── keys/route.ts
│   ├── auth/callback/page.tsx
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx
│   ├── ApiKeyManager.tsx
│   └── UsageStats.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── encryption.ts
├── middleware.ts
└── types/
    └── index.ts
```

## Security Notes

- API keys are encrypted before storage using AES-256-GCM
- Each user can only access their own data (RLS policies)
- Encryption key should be kept secret and rotated periodically
- Use Supabase's built-in auth for secure session management

## License

MIT
