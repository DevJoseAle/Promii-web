# TODO - Promii Platform

## Pending Features

### Reviews & Ratings System
- [ ] Create `reviews` table in Supabase
  - Fields: id, promii_id, user_id, rating (1-5), comment, created_at, updated_at
  - Add RLS policies
- [ ] Implement review submission form on promii detail page
- [ ] Display reviews list with pagination
- [ ] Show average rating and review count
- [ ] Add helpful/unhelpful voting on reviews

### Sales Statistics
- [ ] Determine data source for sales count display ("500+ vendidos")
  - Option 1: Use existing `merchant_coupon_counters` table
  - Option 2: Create new `promii_sales_stats` table
  - Option 3: Count from `orders` table when implemented
- [ ] Implement sales count display on promii cards
- [ ] Implement sales count display on promii detail page
- [ ] Add trending/popular badges based on sales velocity

### Order & Payment System (Venezuela-focused)
- [ ] Create `orders` table in Supabase
  - Fields: id, promii_id, user_id, merchant_id, status, amount, bank_transfer_proof_url, created_at, validated_at
  - Statuses: pending_payment, pending_validation, validated, completed, cancelled
- [ ] Implement order creation flow
- [ ] WhatsApp integration for bank transfer details
- [ ] Merchant validation dashboard
- [ ] Upload proof of payment functionality
- [ ] Order history for users

### Influencer Features (Phase 2)
- [ ] Influencer codes tracking system
- [ ] Commission calculation logic
- [ ] Payout management
- [ ] Influencer dashboard analytics
- [ ] Code generation and management

### Additional Enhancements
- [ ] Email notifications (order confirmation, validation, etc.)
- [ ] Push notifications (optional)
- [ ] Advanced search with filters
- [ ] User profiles with purchase history
- [ ] Merchant analytics dashboard improvements
- [ ] Mobile app (future consideration)

---

**Priority**: Reviews & Sales Stats are needed for promii detail page completion.
