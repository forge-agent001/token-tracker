# Contributing

Thank you for your interest in contributing to Token Tracker! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Local Development

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see README.md)
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

### Supabase Local Setup (Optional)

For full local development with Supabase:

1. Install Supabase CLI
2. Run `supabase start` to start local Supabase
3. Update `.env.local` to use local Supabase URL and keys

## Project Structure

```
token-tracker/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utility libraries
│   ├── middleware.ts  # Next.js middleware
│   └── types/         # TypeScript types
├── supabase/          # Supabase schema and migrations
├── docs/              # Documentation
└── public/            # Static assets
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define types in `src/types/index.ts`
- Avoid `any` type - use `unknown` with type guards instead

### Components

- Use functional components with hooks
- Place shared components in `src/components/`
- Use Tailwind CSS for styling
- Follow existing component patterns

### API Routes

- Place API routes in `src/app/api/`
- Use Route Handlers (route.ts files)
- Validate all inputs
- Return consistent error responses:
  ```typescript
  return NextResponse.json({ error: 'Message' }, { status: 400 });
  ```

### Naming Conventions

- **Files**: kebab-case (e.g., `api-key-manager.tsx`)
- **Components**: PascalCase (e.g., `ApiKeyManager`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Types**: PascalCase with descriptive names (e.g., `ApiKeyData`)

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(api): add moonshot balance endpoint

fix(auth): resolve magic link expiration issue
docs(readme): update deployment instructions
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commits
3. Test your changes locally
4. Update documentation if needed
5. Push your branch and create a Pull Request
6. Fill out the PR template
7. Wait for review and address feedback

## Testing

### Manual Testing

Before submitting a PR:

- [ ] Test authentication (both GitHub OAuth and Magic Link)
- [ ] Test API key storage and retrieval
- [ ] Test usage data fetching for both providers
- [ ] Verify responsive design on mobile
- [ ] Check for console errors
- [ ] Test logout flow

### Future: Automated Testing

We plan to add:
- Unit tests with Jest
- E2E tests with Playwright
- API integration tests

## Adding New API Providers

To add support for a new AI provider:

1. Create a new route at `src/app/api/{provider}/usage/route.ts`
2. Follow the pattern from existing providers
3. Add the provider to the whitelist in validation
4. Update the UI components to support the new provider
5. Add documentation

Example provider structure:

```typescript
// src/app/api/newprovider/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Fetch and decrypt API key
  // Call provider API
  // Return formatted data
}
```

## Security Guidelines

- Never commit secrets or API keys
- Always validate user input
- Use RLS policies for database access
- Encrypt sensitive data before storage
- Keep dependencies updated

## Documentation

- Update README.md if adding features
- Update ARCHITECTURE.md for structural changes
- Add comments for complex code
- Update CHANGELOG.md for releases

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase

## Code of Conduct

Be respectful and constructive in all interactions.
