# Performance & Scalability Standard

This skill enforces backend-aware performance rules for a marketplace architecture using Next.js + Supabase.

## Rules

- Always limit database queries (never unbounded selects).
- Enforce pagination limits.
- Avoid N+1 Supabase queries.
- Use indexes for filtered DB columns.
- Avoid client-heavy data fetching if server components are possible.
- Avoid unnecessary useEffect fetch chains.
- Prevent large payload responses in API routes.
- Prefer server-side filtering over client filtering when data size > 50 rows.
- Avoid JSON.stringify logging of large objects.
- Ensure Stripe webhook logic is idempotent.
- Validate that search filters cannot cause query explosion.
