# 📧 Email Templates para Promii

Templates de correo personalizados para Promii con diseño de marca.

## 🎨 Diseño

- **Colores principales:**
  - Morado: `#46248c` → `#d35df3` (gradiente)
  - Turquesa: `#2DD4BF` (CTAs)
  - Amarillo: `#f59e0b` (warnings)

- **Tipografía:** System fonts (Apple, Segoe UI, Roboto)
- **Responsive:** Compatible con todos los clientes de email

## 📂 Templates disponibles

### 1. Reset de Contraseña (`reset-password.html`)
**Variables de Supabase:**
- `{{ .ConfirmationURL }}` - URL para restablecer contraseña
- `{{ .Email }}` - Email del destinatario

**Uso:** Supabase Auth → Email Templates → Recovery email

---

## 🔧 Configuración en Supabase

### Opción 1: Via Dashboard (Manual)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. **Authentication** → **Email Templates**
3. Selecciona **Reset Password**
4. Copia y pega el contenido de `reset-password.html`
5. **Save**

### Opción 2: Via SMTP con Resend

1. En Supabase: **Project Settings** → **Auth** → **SMTP Settings**
2. Configura:
   ```
   Host: smtp.resend.com
   Port: 465 o 587
   User: resend
   Password: [tu API key de Resend]
   ```
3. Sender email: `noreply@promii.shop`

---

## 🧪 Cómo probar

### Opción A: En Supabase (recomendado)
1. Ir a Authentication → Users
2. Hacer clic en un usuario → Send recovery email
3. Revisar el email recibido

### Opción B: Con Resend API
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "Promii <noreply@promii.shop>",
    "to": "test@example.com",
    "subject": "Recupera tu contraseña - Promii",
    "html": "[copiar HTML aquí]"
  }'
```

---

## 📝 Notas

- Las variables `{{ .Variable }}` son específicas de Supabase
- Los estilos están inline para compatibilidad con clientes de email
- Testear en: Gmail, Outlook, Apple Mail, Yahoo Mail

---

## ✅ Templates completados

- [x] Reset de contraseña (`reset-password.html`)
- [x] Confirmación de email (`confirm-email.html`)
- [x] Bienvenida (`welcome.html`)
- [x] Aprobación de merchant (`merchant-approved.html`)
- [x] Aprobación de influencer (`influencer-approved.html`)

## 🚀 Templates futuros (opcional)

- [ ] Notificación de compra exitosa
- [ ] Código de validación de compra
- [ ] Recordatorio de promii próximo a expirar
- [ ] Newsletter de promociones destacadas
