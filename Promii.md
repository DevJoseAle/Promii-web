# Promii — Resumen Funcional y Técnico

## ¿Qué es Promii?
Promii es una plataforma de promociones locales (promiis) que conecta negocios con consumidores e influencers.
Los negocios publican promiis, los usuarios compran y canjean cupones, y los influencers colaboran con marcas mediante códigos y ofertas.

---

## Tecnologías usadas
- Next.js 14 (App Router)
- React + TypeScript
- Supabase (Auth, Database, Storage)
- Stripe (pagos en USD)
- Resend (emails transaccionales)
- TailwindCSS + UI Components

---

## Roles (4)

### 1) Usuario (Consumer)
**Qué puede hacer**
- Explorar promiis (home, categorías, búsqueda, ciudades)
- Comprar promiis (manual o Stripe)
- Ver y canjear cupones
- Historial de compras
- Favoritos
- Programa Promii Red (referir negocios)

**Accesos principales**
- Público: `/`, `/search`, `/c/[category]`, `/c/[category]/[subcategory]`, `/city/[cityName]`, `/p/[id]`, `/influencers`
- Auth: `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/reset-password`
- Perfil: `/profile` con tabs internos

---

### 2) Merchant (Negocio)
**Qué puede hacer**
- Aplicar y completar perfil
- Crear y gestionar promiis
- Validar compras/canjes
- Gestionar influencers y asignaciones
- Comprar planes (Stripe)
- Enviar feedback

**Accesos principales**
- Apply: `/business/apply`
- Sign-in: `/business/sign-in`
- Pending: `/business/pending`
- Dashboard: `/business/dashboard/**`

---

### 3) Influencer
**Qué puede hacer**
- Aplicar y completar perfil
- Ver métricas, conversiones, revenue
- Responder solicitudes de partnership
- Gestionar promiis asignados
- Publicar ofertas (fixed/barter/mixed)
- Enviar feedback

**Accesos principales**
- Apply: `/inf/apply`
- Sign-in: `/inf/sign-in`
- Pending: `/inf/pending`
- Dashboard: `/inf/dashboard` (tabs internos)

---

### 4) Admin
**Qué puede hacer**
- Moderar merchants, influencers y promiis
- Gestionar Promii Red (pagos base/bonus)
- Responder feedback

**Accesos principales**
- Login: `/4dm1n/login`
- Admin Panel: `/admin/*`

---

## Control de acceso
- Middleware protege:
  - `/admin/**` solo admin
  - `/business/**` solo merchant
  - `/inf/**` solo influencer
- Directorio `/influencers/**` es público.

---

## Flujos clave

### Compra (Usuario)
1. Usuario compra promii (manual o Stripe).
2. Se crea `promii_purchases` en `pending_payment`.
3. Stripe webhook marca como `approved`.
4. Se genera cupón (`coupon_code`).
5. Usuario lo ve en `/profile`.

### Promii (Merchant)
1. Merchant crea promii → `draft`
2. Publica → `active`
3. Compra → cupón + canje

### Influencer (Partnership + Asignación)
1. Merchant solicita partnership
2. Influencer responde
3. Merchant asigna promii → referral code
4. Tracking de visitas/conversiones

---

# Documento de Endpoints + Modelos (para Mobile)

## API Endpoints (Next.js Route Handlers)

### Pagos
- `POST /api/payments/create-checkout`
  - Crea checkout Stripe para planes de merchant.
- `POST /api/payments/create-promii-checkout`
  - Crea checkout Stripe para compra de promii.
  - Acepta `promiiId` y `referralCode`.
- `POST /api/payments/webhook/stripe`
  - Webhook Stripe (idempotente).
  - Actualiza planes y promii_purchases.

### Emails
- `POST /api/send-coupon-email`
  - Envía email con cupón.
  - Solo si caller es comprador, merchant o admin.

### Storage
- `POST /api/merchant-documents/signed-url`
  - Genera signed URL de documentos privados.

---

## Modelos clave (DB)

### profiles
- `id`, `role` (user/merchant/influencer/admin), `state` (pending/approved/rejected/blocked), `first_name`, `last_name`, `email`, `referral_code`

### merchants
- Datos del negocio + plan (`plan_id`, `plan_status`, `monthly_promii_limit`, etc.)

### influencers
- Datos del influencer + `verification_status`

### promiis
- Promociones publicadas (status, precio, fechas, ciudad, etc.)

### promii_photos
- Fotos de promiis (storage_path, public_url)

### promii_purchases
- Compras de promiis
- Estados: `pending_payment`, `pending_validation`, `approved`, `redeemed`, etc.
- Cupón: `coupon_code`, `coupon_expires_at`

### influencer_partnerships
- Relaciones merchant–influencer con `status`

### promii_influencer_assignments
- Asignación promii–influencer
- `referral_code`, `commission`, `extra_discount`

### influencer_referral_visits
- Tracking de visitas y conversiones

### influencer_offers
- Ofertas públicas (fixed/barter/mixed)

### feedbacks
- Feedback de merchant/influencer + respuesta admin

### merchant_referrals + user_referral_stats
- Programa Promii Red

### merchant_subscriptions
- Suscripciones y pagos de planes

### stripe_webhook_events
- Idempotencia para Stripe webhooks

---

## Rutas UI relevantes (mobile)

### Público
- `/` Home
- `/search`
- `/c/[category]`
- `/c/[category]/[subcategory]`
- `/city/[cityName]`
- `/p/[id]`
- `/influencers`
- `/influencers/[slug]`

### Auth
- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`

### Usuario (consumer)
- `/profile` (cupones, historial, favoritos, promii-red)

### Merchant
- `/business/dashboard/*`

### Influencer
- `/inf/dashboard/*`
