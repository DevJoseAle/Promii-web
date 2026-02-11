# TODO - Promii Platform

## ✅ Completed Features

### Order & Payment System (Venezuela-focused) ✓
- [x] Create `promii_purchases` table in Supabase
- [x] Implement order creation flow
- [x] WhatsApp integration for payment coordination
- [x] Merchant validation dashboard (/validate/pending)
- [x] Merchant claim dashboard (/validate/claim)
- [x] Order history dashboard (/validate)
- [x] RLS policies and triggers
- [x] Coupon generation on approval
- [x] Order status flow: pending_payment → pending_validation → approved → redeemed
- [x] Compact order cards with filters and search

### Home & Detail Pages ✓
- [x] Connect home page to real Supabase data
- [x] Server-side services for promiis
- [x] Photo gallery component
- [x] Share buttons component
- [x] Favorite button component (UI only)
- [x] Server/Client component separation for SSR optimization

---

## 🔄 In Progress / Pending Features

### Sales Statistics
- [ ] Implement sales count using `promii_purchases` data
  - Count approved + redeemed orders per promii
- [ ] Display sales count on promii cards ("X vendidos")
- [ ] Display sales count on promii detail page
- [ ] Add trending/popular badges based on sales velocity
- [ ] Cache sales counts for performance

### Reviews & Ratings System
- [ ] Create `promii_reviews` table in Supabase
  - Fields: id, promii_id, user_id, rating (1-5), comment, created_at, updated_at
  - Add RLS policies
- [ ] Implement review submission form on promii detail page
- [ ] Display reviews list with pagination
- [ ] Show average rating and review count on cards
- [ ] Add helpful/unhelpful voting on reviews
- [ ] Prevent duplicate reviews (1 per user per promii)

### User Experience Improvements
- [ ] User order history page (/profile/orders or similar)
- [ ] Upload payment proof functionality (optional - currently via WhatsApp)
- [ ] Email notifications for order status changes
- [ ] Better error handling and user feedback messages
- [ ] Loading states and skeletons
- [ ] Empty states for all dashboards

### Influencer Features (Phase 2)
- [ ] Influencer codes redemption tracking
- [ ] Commission calculation logic (based on sales with their code)
- [ ] Payout management dashboard
- [ ] Influencer analytics (conversion rate, earnings, etc.)
- [ ] Code generation and management UI
- [ ] Link influencer codes to purchases in DB

### Merchant Dashboard Enhancements
- [ ] Sales analytics charts (daily, weekly, monthly)
- [ ] Revenue tracking
- [ ] Top performing promiis
- [ ] Export orders to CSV/Excel
- [ ] Bulk actions for orders

### Additional Enhancements
- [ ] Push notifications (optional)
- [ ] Advanced search with filters (price range, category, rating)
- [ ] User profiles with favorites and purchase history
- [ ] Mobile app (future consideration)
- [ ] SEO optimization (meta tags, sitemap, etc.)

---

## 🐛 Known Issues / Tech Debt

- [ ] Fix Supabase client issues (currently using @supabase/supabase-js, SSR version had problems)
- [ ] Implement proper error boundaries
- [ ] Add API rate limiting
- [ ] Optimize bundle size
- [ ] Add E2E tests for critical flows

---

**Current Priority**:
1. Sales statistics (use existing orders data)
2. Reviews & ratings system
3. User order history page
