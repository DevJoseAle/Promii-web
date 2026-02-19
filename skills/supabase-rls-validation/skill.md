# Supabase RLS & Multi-Tenant Integrity

This enforces strict multi-tenant isolation for marketplace roles:
- user
- merchant
- influencer
- admin

## Rules

- Assume all client calls are hostile.
- Ensure every table has RLS enabled.
- Enforce row ownership policies.
- Merchant must not access other merchants’ records.
- Influencer must not access other influencers’ assignments.
- Orders must validate purchaser_id and merchant_id boundaries.
- Admin-only RPCs must not be callable by anon/auth users.
- Avoid broad "authenticated" policies.
- Always verify that updates include ownership constraints.
