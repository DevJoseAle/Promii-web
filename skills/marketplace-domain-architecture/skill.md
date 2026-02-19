# Marketplace Domain Architecture

This skill ensures structural integrity of Promii as a multi-role marketplace.

## Rules

- Separate responsibilities by role:
  - User (purchase, redeem, referrals)
  - Merchant (create promii, validate, manage orders)
  - Influencer (assignments, tracking, earnings)
  - Admin (moderation, validation)
- Avoid cross-role logic leakage.
- Never mix admin logic into client bundles.
- Payments must update domain state atomically.
- Plan updates must not duplicate.
- Referral calculations must be deterministic.
- Avoid domain logic in UI components.
