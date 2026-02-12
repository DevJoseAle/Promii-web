# TODO - Promii MVP

## ✅ Completado
- [x] Sistema de autenticación (User, Merchant, Influencer)
- [x] Dashboard de Merchant (CRUD Promiis, validación de compras)
- [x] Flujo de compra completo (User → Payment → Coupon)
- [x] Dashboard de Usuario (Cupones, Historial, Perfil, Favoritos)
- [x] Página de detalle de Promii
- [x] Sistema de favoritos (localStorage)
- [x] Galería de fotos de Promiis
- [x] **Dashboard Influencer - Diseño unificado** (12 feb 2026)
  - Layout profesional con InfluencerShell y InfluencerSidebar
  - 5 tabs funcionales: Overview, Solicitudes, Mis Marcas, Mis Promiis, Perfil
  - Navegación con query params correctamente implementada
  - Diseño responsive (sidebar desktop, drawer móvil)
- [x] **Sistema de autenticación Influencer corregido** (12 feb 2026)
  - Sign-in verifica rol y redirige a portal correcto si no coincide
  - Apply ahora crea registros en tabla `influencers` automáticamente
  - Conversión de state/city IDs a nombres, limpieza de handles sociales

---

## 🔥 Prioridad Alta (MVP Core)

### 1. Sistema Merchant ↔ Influencer
**Objetivo:** Definir y construir el flujo de colaboración entre merchants e influencers

**Tareas:**
- [ ] **Definir modelo de negocio:**
  - ¿El merchant invita al influencer o viceversa?
  - ¿Comisión fija o porcentual?
  - ¿Aprobación manual o automática?
  - ¿Tracking de conversiones por código de referido?

- [ ] **Backend (Supabase):**
  - [ ] Tabla `influencer_partnerships` (merchant_id, influencer_id, commission_rate, status)
  - [ ] Tabla `influencer_conversions` (purchase_id, influencer_id, commission_earned)
  - [ ] RLS policies para partnerships

- [ ] **Dashboard Merchant:**
  - [ ] Sección "Influencers" con tabs:
    - [ ] "Mis Influencers" (lista de partnerships activas)
    - [ ] "Solicitudes" (pending approvals)
    - [ ] "Buscar Influencers" (directorio público)
  - [ ] Estadísticas por influencer (ventas, conversiones, comisiones)

- [ ] **Dashboard Influencer:**
  - [ ] Sección "Mis Merchants" (partnerships activas)
  - [ ] Sección "Buscar Promiis" (explorar promiis con allow_influencers=true)
  - [ ] "Solicitar Partnership" (enviar request a merchant)
  - [ ] Estadísticas de ganancias y conversiones
  - [ ] Generador de links con código de referido

**Decisiones pendientes:**
1. ¿Modelo de invitación? (Merchant invita vs Influencer solicita)
2. ¿Comisión default? (ej: 10% o monto fijo)
3. ¿El influencer puede ver promiis antes de partnership?

---

### 2. Dashboard Influencer
**Objetivo:** Portal completo para influencers con estadísticas y herramientas

**Tareas:**
- [x] Layout base (`/inf/dashboard`) ✅ **Completado 12/feb/2026**
  - [x] InfluencerShell con sidebar profesional
  - [x] Navegación responsive (desktop sidebar + mobile drawer)
  - [x] Navegación por query params (?tab=...)
- [x] Tabs principales: ✅ **Estructura completada 12/feb/2026**
  - [x] **Overview** (métricas generales)
    - [x] Total ganado este mes
    - [x] Conversiones totales
    - [x] Promiis activos
    - [x] Gráfico de ganancias (con Tremor)
  - [x] **Solicitudes** (solicitudes de colaboración de merchants)
    - [x] Lista de requests pendientes
    - [x] Aprobar/Rechazar partnerships
  - [x] **Mis Promiis** (promiis asignados con códigos de referido)
    - [x] Lista de assignments con stats
    - [x] Copiar código y link de referido
    - [x] Métricas: visitas, conversiones, revenue
  - [x] **Mis Merchants** (partnerships activas)
    - [x] Lista de merchants colaboradores
    - [x] Stats por merchant
  - [x] **Perfil** (editar datos públicos)
    - [x] Información básica (nombre, bio, ubicación)
    - [x] Redes sociales (Instagram, TikTok, YouTube, Twitter)
    - [x] Nicho/categoría
  - [ ] **Ganancias** (historial de comisiones) - Pendiente
  - [ ] **Herramientas** (generador de links, códigos QR) - Pendiente

- [x] Servicios Supabase: ✅ **Completado**
  - [x] `influencer-stats.service.ts` (fetch earnings, conversions)
  - [x] `influencer-promiis.service.ts` (fetch available promiis, assignments)
  - [x] `influencer-partnerships.service.ts` (manage partnerships, respond to requests)

---

### 3. Conexión Categorías y Footer con Supabase
**Objetivo:** Páginas dinámicas conectadas a datos reales

**Tareas:**
- [ ] **Página de Categoría (`/c/[category]`):**
  - [ ] Conectar con servicio real (fetch promiis by category)
  - [ ] Paginación (infinit scroll o numbered)
  - [ ] Filtros: precio, ubicación, fecha
  - [ ] Empty state si no hay promiis

- [ ] **Página de Subcategoría (`/c/[category]/[subcategory]`):**
  - [ ] Similar a categoría pero filtrado por subcategory
  - [ ] Breadcrumbs (Home > Categoría > Subcategoría)

- [ ] **Footer Links:**
  - [ ] Actualizar links del footer (actualmente son placeholders)
  - [ ] Verificar que apunten a páginas existentes

---

### 4. Barra de Búsqueda y Resultados
**Objetivo:** Sistema de búsqueda funcional en toda la app

**Tareas:**
- [ ] **Search Bar (Header):**
  - [ ] Diseño de input con ícono
  - [ ] Autocomplete (opcional, sugerencias mientras escribes)
  - [ ] Submit redirige a `/search?q={query}`

- [ ] **Página de Resultados (`/search`):**
  - [ ] Layout con filtros laterales (categoría, precio, ubicación)
  - [ ] Grid de resultados (PromiiCard)
  - [ ] Ordenamiento (relevancia, precio, fecha)
  - [ ] Empty state

- [ ] **Backend:**
  - [ ] Servicio `search.service.ts`
  - [ ] Query optimizado con full-text search (Supabase `to_tsquery`)
  - [ ] Búsqueda en: title, description, category, merchant_name

---

## 📧 Comunicaciones

### 5. Mejorar Correo de Verificación
**Objetivo:** Email HTML profesional y branded

**Tareas:**
- [ ] Diseñar template HTML responsive
  - [ ] Header con logo Promii
  - [ ] CTA button destacado
  - [ ] Footer con links (términos, soporte)
- [ ] Implementar en Supabase Auth (custom email templates)
- [ ] Testing en múltiples clientes de email

---

### 6. Integración con Resend
**Objetivo:** Servicio de email transaccional profesional

**Tareas:**
- [ ] Crear cuenta en Resend
- [ ] Configurar dominio y DNS (SPF, DKIM)
- [ ] Crear templates en Resend:
  - [ ] Verificación de email
  - [ ] Recuperación de contraseña
  - [ ] Notificación de compra (user)
  - [ ] Notificación de venta (merchant)
  - [ ] Aprobación de partnership (influencer)
- [ ] Implementar servicio `email.service.ts`
- [ ] Migrar de Supabase emails a Resend

---

### 7. Flujo de Recuperación de Contraseña
**Objetivo:** Permitir a usuarios resetear su contraseña

**Tareas:**
- [ ] **Página "Olvidé mi contraseña" (`/auth/forgot-password`):**
  - [ ] Form con input de email
  - [ ] Validación
  - [ ] Mensaje de confirmación
- [ ] **Página de reset (`/auth/reset-password`):**
  - [ ] Recibe token por URL
  - [ ] Form para nueva contraseña
  - [ ] Confirmación y redirect a login
- [ ] Integrar con Supabase Auth (`resetPasswordForEmail`)
- [ ] Email de recuperación (template en Resend)

---

## 📄 Páginas Legales y Marketing

### 8. Páginas Institucionales
**Objetivo:** Cumplimiento legal y transparencia

**Tareas:**
- [ ] `/legal/terms` (Términos y Condiciones)
  - [ ] Redactar contenido legal
  - [ ] Layout simple y legible
- [ ] `/legal/privacy` (Política de Privacidad)
  - [ ] Cumplimiento GDPR/CCPA
  - [ ] Uso de cookies
  - [ ] Datos recolectados
- [ ] `/help` (Centro de Ayuda)
  - [ ] FAQ acordeón
  - [ ] Secciones: Compradores, Merchants, Influencers
  - [ ] Formulario de contacto (opcional)

---

### 9. Página Programa Influencer
**Objetivo:** Landing page para atraer influencers

**Tareas:**
- [ ] `/influencers/program` (Landing page)
  - [ ] Hero con value proposition
  - [ ] Sección "Cómo funciona" (3-4 pasos)
  - [ ] Testimonios (opcional, fake data inicial)
  - [ ] CTA "Únete ahora" → `/inf/apply`
- [ ] Copy y diseño atractivo
- [ ] Stats destacadas (ej: "Gana hasta 15% de comisión")

---

## 💰 Planes y Monetización

### 10. Definir Planes para Merchants
**Objetivo:** Sistema de suscripción para merchants

**Decisiones pendientes:**
1. ¿Modelo de negocio?
   - Comisión por venta (%)
   - Suscripción mensual (Fixed fee)
   - Híbrido (suscripción + comisión reducida)

2. ¿Tiers de planes?
   - **Free**: 1 promii activo, comisión 15%
   - **Basic** ($20/mes): 5 promiis, comisión 10%
   - **Pro** ($50/mes): Ilimitados, comisión 5%, analytics

**Tareas:**
- [ ] Definir estructura de planes
- [ ] Tabla `merchant_subscriptions` (merchant_id, plan, status, expires_at)
- [ ] Integración con Stripe (pagos recurrentes)
- [ ] Dashboard Merchant: sección "Suscripción"
  - [ ] Ver plan actual
  - [ ] Upgrade/downgrade
  - [ ] Historial de pagos
- [ ] Lógica de límites (max_promiis según plan)

---

## 🔧 Mejoras Técnicas (Post-MVP)

### Optimizaciones
- [ ] Image optimization (Next.js Image loader para Supabase Storage)
- [ ] Caching (React Query o SWR)
- [ ] Analytics (Google Analytics o Posthog)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

### Features Secundarias
- [ ] Notificaciones push (web push)
- [ ] Sistema de ratings y reviews
- [ ] Wishlist pública (share favoritos)
- [ ] Mapa interactivo (geolocalización)
- [ ] Dark mode

---

## 📝 Notas de Arquitectura

### Decisiones de Diseño a Tomar

**1. Modelo Influencer-Merchant:**
- [ ] ¿Partnership requiere aprobación mutua?
- [ ] ¿Comisión se define por promii o por partnership?
- [ ] ¿Influencer puede promover promiis sin partnership? (link genérico)

**2. Sistema de Pagos:**
- [ ] ¿Payout manual o automático para influencers?
- [ ] ¿Frecuencia de payout? (mensual, quincenal)
- [ ] ¿Mínimo para retirar? (ej: $50 mínimo)

**3. Tracking de Conversiones:**
- [ ] ¿Código de referido único por influencer?
- [ ] ¿Persistir en cookie o localStorage?
- [ ] ¿Ventana de atribución? (7 días, 30 días)

---

## 🚀 Plan de Ejecución Sugerido

### Sprint 1: Sistema Influencer (1-2 semanas)
1. Definir modelo de negocio completo
2. Crear tablas y RLS en Supabase
3. Dashboard Influencer básico (overview + mis promiis)
4. Partnership flow (solicitar, aprobar)

### Sprint 2: Búsqueda y Categorías (1 semana)
1. Barra de búsqueda funcional
2. Página de resultados con filtros
3. Conectar categorías con Supabase
4. Optimizar queries

### Sprint 3: Emails y Legal (1 semana)
1. Integrar Resend
2. Templates HTML profesionales
3. Recuperación de contraseña
4. Páginas legales (terms, privacy, help)

### Sprint 4: Planes y Monetización (1-2 semanas)
1. Definir tiers de planes
2. Integrar Stripe
3. Dashboard de suscripción
4. Lógica de límites y upgrades

---

## 📞 Contacto y Decisiones

**Stakeholders a consultar:**
- Legal: Términos, privacidad, compliance
- Finanzas: Modelo de comisiones, pricing
- Marketing: Landing influencer, copywriting

**Próximos pasos inmediatos:**
1. ✅ Commit del dashboard de usuario
2. ⏭️ Definir modelo influencer-merchant
3. ⏭️ Crear wireframes del dashboard influencer
4. ⏭️ Setup Resend + templates

---

*Última actualización: 12 de febrero de 2026 - Dashboard Influencer completado y bugs de autenticación corregidos*
