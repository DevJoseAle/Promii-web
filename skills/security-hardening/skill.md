# Security Hardening Standard

Applies to all API routes, server actions, storage operations and payment logic.

## Rules

- Never rely only on client-side role gates.
- Every mutation must validate:
  - authentication
  - role
  - ownership
- Supabase service_role must never be exposed to client.
- Storage:
  - Sensitive buckets must be private.
  - Use signed URLs for documents.
- Stripe:
  - Verify webhook signature.
  - Enforce event.id deduplication.
- Redirect URLs must be validated against allowlist.
- Do not trust Origin headers.
- All dynamic inputs must be sanitized before DB usage.
- Avoid exposing internal error messages to client.
- Avoid leaking stack traces.
