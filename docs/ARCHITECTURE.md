# Architecture

This document describes the technical architecture and design decisions for Token Tracker.

## Overview

Token Tracker is a Next.js 15 application using the App Router architecture. It uses Supabase for authentication and data persistence, with client-side encryption for sensitive API keys.

## System Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   User Browser  │────▶│  Vercel Edge │────▶│   Supabase      │
│                 │◀────│   (Next.js)  │◀────│  (Auth + DB)    │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  GitHub OAuth   │                           │  API Providers  │
│   (Optional)    │                           │  - Anthropic    │
└─────────────────┘                           │  - Moonshot     │
                                              └─────────────────┘
```

## Authentication Flow

### GitHub OAuth

```
1. User clicks "Continue with GitHub"
2. Supabase redirects to GitHub OAuth
3. GitHub redirects to Supabase callback
4. Supabase redirects to /auth/callback with code
5. Server exchanges code for session
6. User redirected to dashboard
```

### Magic Link

```
1. User enters email and clicks "Send magic link"
2. Supabase generates OTP and sends email via Brevo SMTP
3. User clicks link in email
4. Link goes to Supabase verify endpoint
5. Supabase validates OTP and redirects to /auth/callback with code
6. Server exchanges code for session
7. User redirected to dashboard
```

## Data Flow

### Storing API Keys

```
1. User enters API key in dashboard
2. Client validates provider (anthropic/moonshot only)
3. Client encrypts key using AES-256-GCM
4. Encrypted data sent to Supabase
5. Supabase stores with RLS (user can only access own data)
```

### Fetching Usage

```
1. Dashboard requests usage data
2. Server fetches encrypted keys from Supabase
3. Server decrypts keys
4. Server calls provider APIs with decrypted keys
5. Server returns usage data to client
```

## Database Schema

### Tables

#### `api_keys`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| provider | text | Provider name (anthropic/moonshot) |
| encrypted_key | text | AES-256-GCM encrypted API key |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

**RLS Policy**: Users can only access rows where `user_id = auth.uid()`

## Encryption

### Algorithm

- **Algorithm**: AES-256-GCM
- **Key**: 32-byte key from `ENCRYPTION_KEY` env var
- **IV**: Random 16-byte initialization vector (stored with ciphertext)
- **Tag**: 16-byte authentication tag (GCM)

### Format

Encrypted data is stored as:

```
base64(iv + ciphertext + tag)
```

On decryption:
1. Decode base64
2. Extract IV (first 16 bytes)
3. Extract tag (last 16 bytes)
4. Extract ciphertext (middle bytes)
5. Decrypt using AES-256-GCM

## Security Considerations

### Why Client-Side Encryption?

We encrypt API keys before sending to Supabase because:
1. Database backups could contain sensitive data
2. RLS protects against unauthorized access but not from database admins
3. Adds defense-in-depth

### Rate Limiting

- In-memory rate limiting on API routes (60 requests/minute per IP)
- For production, recommend Redis-based rate limiting
- Middleware also protects dashboard routes

### CORS and CSRF

- CORS configured in Next.js config
- Supabase handles CSRF protection for auth
- No sensitive mutations without authenticated session

## Middleware

The `middleware.ts` file handles:

1. **Rate Limiting**: API routes limited to 60 req/min per IP
2. **Auth Refresh**: Refreshes expired Supabase sessions
3. **Route Protection**:
   - `/dashboard` - requires auth
   - `/api/*` (except auth) - requires auth
   - `/login`, `/signup` - redirects to dashboard if already logged in

## Error Handling

### API Errors

```typescript
// Standardized error response
{
  error: string;      // Human-readable error message
  code?: string;      // Optional error code
}
```

### Auth Errors

Auth errors are handled by:
1. Client-side form validation
2. Server-side error responses
3. Redirect to `/login` with error in URL hash

## Performance

### Optimizations

- Edge runtime for API routes where possible
- Supabase client caching
- Minimal JavaScript on landing page

### Known Limitations

- In-memory rate limiting doesn't work across multiple Vercel regions
- No caching of API provider responses (real-time data)

## Monitoring

Recommend adding:
- Vercel Analytics for performance
- Sentry for error tracking
- Supabase logs for database monitoring

## Deployment

### Environment Requirements

- Node.js 18+
- Environment variables configured
- Supabase project with schema applied
- (Optional) Brevo SMTP for magic links
- (Optional) GitHub OAuth app configured

### Build Process

1. Next.js builds static pages where possible
2. API routes use Node.js runtime
3. Middleware runs at edge
4. Supabase client created per-request
