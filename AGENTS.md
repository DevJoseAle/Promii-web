# Promii - Codex instructions (Security)

## Project context
- Next.js (App Router) web app
- Supabase as BaaS (Auth, DB, Storage, Edge Functions)
- Do not add new libraries unless strictly necessary.

## Security review focus (highest priority)
1) Supabase RLS: policies must prevent cross-tenant reads/writes (user/merchant/influencer separation).
2) Secrets: never expose service_role key, never log tokens/PII, verify env usage.
3) Auth/session: SSR/CSR boundaries, cookie settings, redirects, role checks.
4) XSS/Injection: user-generated content rendering, query params, server actions, API routes.
5) Webhooks: signature verification (Stripe / payment providers), idempotency.
6) File uploads: validate type/size, storage paths, public buckets, signed URLs.

## Output format required
- Findings grouped: P0 (critical), P1 (high), P2 (medium), P3 (low)
- For each finding: file path + exact code reference + impact + exploit scenario + fix (minimal diff)
- Provide verification steps (how to test the fix)

## Skills System
- Always scan `/skills/**` relevant to the current task before coding.
- Apply relevant rules silently (do not mention "skills" in PR descriptions or responses).
- Prefer minimal diffs, no new dependencies, and no version bumps unless explicitly requested.
- Follow existing patterns: TypeScript, Next.js App Router conventions, and Supabase best practices.
- For security tasks, enforce server-side authorization; never rely only on client gating.

## Internal Skills System (Extended)

- Always scan /skills/** before implementing changes.
- Apply relevant skills silently.
- Do not mention skill names in outputs.
- Prioritize:
  - security-hardening
  - supabase-rls-validation
  - performance-architecture
- Maintain compatibility with vercel-react-best-practices.
- Prefer minimal diffs.
- Never introduce breaking refactors unless requested.
- Never upgrade core dependencies unless explicitly asked.
