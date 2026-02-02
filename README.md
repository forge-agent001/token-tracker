# Token Tracker

A web app to track API token usage from Anthropic and Moonshot.ai.

**Live Demo**: https://token-tracker-tau.vercel.app

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fforge-agent001%2Ftoken-tracker&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ENCRYPTION_KEY&envDescription=Supabase%20and%20encryption%20environment%20variables&envLink=https%3A%2F%2Fgithub.com%2Fforge-agent001%2Ftoken-tracker%23environment-variables)

## Features

- 🔐 **Multiple Auth Methods**
  - GitHub OAuth (one-click sign in)
  - Magic Link email authentication (passwordless)
- 🔒 **Secure API Key Storage** - AES-256-GCM encryption at rest
- 📊 **Token Usage Dashboard** - Track usage from Anthropic & Moonshot.ai
- 🎨 **Clean, Responsive UI** - Built with Tailwind CSS
- 🚀 **Zero-Cost Stack** - Free tiers on Vercel, Supabase, and Brevo

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Auth | Supabase Auth (GitHub OAuth + Magic Link) |
| Database | Supabase PostgreSQL |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Email | Brevo SMTP (300 emails/day free) |
| Encryption | AES-256-GCM |

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- (Optional) Brevo account for email magic links
- (Optional) GitHub OAuth app for GitHub login

### 1. Clone and Install

```bash
git clone https://github.com/forge-agent001/token-tracker.git
cd token-tracker
npm install
```

### 2. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your Project URL and Anon Key from Settings > API

### 3. Configure Authentication

#### Option A: GitHub OAuth (Recommended)

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL to:
   `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase:
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable GitHub and paste your credentials

#### Option B: Magic Link Email

1. Create a free account at [brevo.com](https://brevo.com)
2. Generate an SMTP key (SMTP & API > SMTP Keys)
3. In Supabase Dashboard > Authentication > Email Templates:
   - Set SMTP Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: your Brevo SMTP username
   - Password: your Brevo SMTP key
   - Sender email: a verified sender email from Brevo

### 4. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

### Option 1: One-Click Deploy

Click the "Deploy with Vercel" button above and add the environment variables when prompted.

### Option 2: Manual Deploy

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your repository
4. Add environment variables
5. Deploy!

## API Providers

### Anthropic

- **Key Type**: Admin API key (for organization usage)
- **Features**: Token tracking, cost estimation
- **Endpoint**: `https://api.anthropic.com/v1/organizations/{org_id}/cost_report`

### Moonshot.ai

- **Key Type**: Standard API key
- **Features**: Balance tracking
- **Endpoint**: `https://api.moonshot.ai/v1/balance`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── anthropic/usage/route.ts   # Anthropic usage endpoint
│   │   ├── moonshot/usage/route.ts    # Moonshot usage endpoint
│   │   └── keys/route.ts              # API key CRUD operations
│   ├── auth/callback/route.ts         # OAuth/magic link callback
│   ├── dashboard/page.tsx             # Main dashboard
│   ├── login/page.tsx                 # Login page
│   ├── signup/page.tsx                # Signup page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                       # Landing page
├── components/
│   ├── Dashboard.tsx                  # Dashboard UI
│   ├── ApiKeyManager.tsx              # API key management
│   └── UsageStats.tsx                 # Usage display
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser client
│   │   └── server.ts                  # Server client
│   └── encryption.ts                  # AES-256-GCM encryption
├── middleware.ts                      # Auth middleware + rate limiting
└── types/
    └── index.ts
```

## Security

- **Encryption**: API keys encrypted with AES-256-GCM before storage
- **RLS**: Row Level Security ensures users only access their own data
- **Rate Limiting**: Built-in rate limiting on API routes (60 req/min)
- **Input Validation**: Strict validation on all inputs
- **Provider Whitelist**: Only anthropic and moonshot providers accepted

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Technical architecture and design decisions
- [Contributing](docs/CONTRIBUTING.md) - How to contribute to the project
- [Changelog](docs/CHANGELOG.md) - Version history and changes

## Future Enhancements

- [ ] Add more AI providers (OpenAI, Cohere, etc.)
- [ ] Usage history charts and analytics
- [ ] Cost alerting/notifications
- [ ] Team/organization support
- [ ] API for programmatic access

## License

MIT

---

Built with ❤️ by [Forge](https://github.com/forge-agent001) for [Roland](https://github.com/rolme)
