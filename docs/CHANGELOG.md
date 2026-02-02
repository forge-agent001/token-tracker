# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-02-01

### Added
- Initial release of Token Tracker
- GitHub OAuth authentication
- Magic Link email authentication via Brevo SMTP
- Secure API key storage with AES-256-GCM encryption
- Anthropic API usage tracking
- Moonshot.ai API usage tracking
- Responsive dashboard UI
- Rate limiting middleware
- Row Level Security (RLS) policies

### Technical
- Next.js 15 with App Router
- Supabase for auth and database
- Tailwind CSS for styling
- Vercel for hosting
- TypeScript throughout

### Security
- Input validation on all API routes
- Provider whitelist (anthropic, moonshot only)
- Secure cookie handling
- Encrypted API key storage

## [Unreleased]

### Planned
- [ ] OpenAI API provider support
- [ ] Usage history charts
- [ ] Cost alerting/notifications
- [ ] Team/organization support
- [ ] API for programmatic access
- [ ] Automated testing suite

