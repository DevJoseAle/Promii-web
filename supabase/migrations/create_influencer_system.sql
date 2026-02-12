-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Influencer Partnership System
-- Description: Tables and policies for merchant-influencer collaboration
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. TABLA: influencer_partnerships
-- Relación entre merchant e influencer (solicitudes y aprobaciones)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.influencer_partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relaciones
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,

  -- Estado de la partnership
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',

  -- Mensajes y notas
  merchant_message TEXT, -- Mensaje opcional del merchant al solicitar
  influencer_notes TEXT, -- Notas internas del influencer

  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(merchant_id, influencer_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_partnerships_merchant_status
  ON public.influencer_partnerships(merchant_id, status);

CREATE INDEX IF NOT EXISTS idx_partnerships_influencer_status
  ON public.influencer_partnerships(influencer_id, status);

CREATE INDEX IF NOT EXISTS idx_partnerships_status
  ON public.influencer_partnerships(status)
  WHERE status = 'pending';

-- Trigger para updated_at
CREATE TRIGGER trg_partnerships_updated_at
  BEFORE UPDATE ON public.influencer_partnerships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.influencer_partnerships IS
  'Manages partnership requests between merchants and influencers';


-- ─────────────────────────────────────────────────────────────
-- 2. TABLA: promii_influencer_assignments
-- Asignación de influencers a promiis específicos
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promii_influencer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relaciones
  promii_id UUID NOT NULL REFERENCES public.promiis(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,

  -- Código de referido único
  referral_code TEXT NOT NULL UNIQUE,

  -- Comisión acordada (definida por merchant)
  commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value NUMERIC(10, 2), -- Porcentaje (ej: 10.00) o monto fijo (ej: 5.00)
  commission_notes TEXT, -- Notas sobre el acuerdo

  -- Estado de la asignación
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints: un influencer solo puede estar asignado 1 vez al mismo promii
  UNIQUE(promii_id, influencer_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_assignments_promii_active
  ON public.promii_influencer_assignments(promii_id, is_active);

CREATE INDEX IF NOT EXISTS idx_assignments_influencer_active
  ON public.promii_influencer_assignments(influencer_id, is_active);

CREATE INDEX IF NOT EXISTS idx_assignments_merchant
  ON public.promii_influencer_assignments(merchant_id);

CREATE INDEX IF NOT EXISTS idx_assignments_referral_code
  ON public.promii_influencer_assignments(referral_code)
  WHERE is_active = TRUE;

COMMENT ON TABLE public.promii_influencer_assignments IS
  'Tracks which influencers are assigned to which promiis with their referral codes';


-- ─────────────────────────────────────────────────────────────
-- 3. TABLA: influencer_referral_visits
-- Tracking de visitas desde links de influencers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.influencer_referral_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relaciones
  assignment_id UUID NOT NULL REFERENCES public.promii_influencer_assignments(id) ON DELETE CASCADE,
  promii_id UUID NOT NULL REFERENCES public.promiis(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,

  -- Data del visitante
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT, -- URL de donde vino

  -- Conversión (si compró)
  converted BOOLEAN NOT NULL DEFAULT FALSE,
  purchase_id UUID REFERENCES public.promii_purchases(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_referral_visits_assignment
  ON public.influencer_referral_visits(assignment_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_visits_influencer_converted
  ON public.influencer_referral_visits(influencer_id, converted, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_visits_promii
  ON public.influencer_referral_visits(promii_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_visits_purchase
  ON public.influencer_referral_visits(purchase_id)
  WHERE purchase_id IS NOT NULL;

COMMENT ON TABLE public.influencer_referral_visits IS
  'Tracks clicks and conversions from influencer referral links';


-- ─────────────────────────────────────────────────────────────
-- 4. MODIFICAR TABLA: promii_purchases
-- Agregar campos de referido
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.promii_purchases
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS influencer_id UUID REFERENCES public.influencers(id) ON DELETE SET NULL;

-- Índices para búsquedas de conversiones
CREATE INDEX IF NOT EXISTS idx_purchases_referral_code
  ON public.promii_purchases(referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_influencer
  ON public.promii_purchases(influencer_id, status, created_at DESC)
  WHERE influencer_id IS NOT NULL;

COMMENT ON COLUMN public.promii_purchases.referral_code IS
  'Referral code used if purchase came from influencer link';

COMMENT ON COLUMN public.promii_purchases.influencer_id IS
  'Influencer who referred this purchase (if any)';


-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- RLS: influencer_partnerships
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.influencer_partnerships ENABLE ROW LEVEL SECURITY;

-- Merchants pueden ver sus partnerships
CREATE POLICY "Merchants can view their partnerships"
  ON public.influencer_partnerships
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  );

-- Influencers pueden ver partnerships donde están involucrados
CREATE POLICY "Influencers can view their partnerships"
  ON public.influencer_partnerships
  FOR SELECT
  TO authenticated
  USING (
    influencer_id IN (
      SELECT i.id
      FROM public.influencers i
      JOIN public.profiles p ON p.id = i.id
      WHERE p.id = auth.uid() AND p.role = 'influencer'
    )
  );

-- Merchants pueden crear partnerships (solicitar seguir)
CREATE POLICY "Merchants can create partnerships"
  ON public.influencer_partnerships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  );

-- Influencers pueden actualizar (aprobar/rechazar) sus partnerships
CREATE POLICY "Influencers can update their partnerships"
  ON public.influencer_partnerships
  FOR UPDATE
  TO authenticated
  USING (
    influencer_id IN (
      SELECT i.id
      FROM public.influencers i
      JOIN public.profiles p ON p.id = i.id
      WHERE p.id = auth.uid() AND p.role = 'influencer'
    )
  )
  WITH CHECK (
    influencer_id IN (
      SELECT i.id
      FROM public.influencers i
      JOIN public.profiles p ON p.id = i.id
      WHERE p.id = auth.uid() AND p.role = 'influencer'
    )
  );

-- Merchants pueden cancelar sus solicitudes pendientes
CREATE POLICY "Merchants can delete pending partnerships"
  ON public.influencer_partnerships
  FOR DELETE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
    AND status = 'pending'
  );


-- ─────────────────────────────────────────────────────────────
-- RLS: promii_influencer_assignments
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.promii_influencer_assignments ENABLE ROW LEVEL SECURITY;

-- Merchants pueden ver assignments de sus promiis
CREATE POLICY "Merchants can view their assignments"
  ON public.promii_influencer_assignments
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  );

-- Influencers pueden ver sus assignments
CREATE POLICY "Influencers can view their assignments"
  ON public.promii_influencer_assignments
  FOR SELECT
  TO authenticated
  USING (
    influencer_id IN (
      SELECT i.id
      FROM public.influencers i
      JOIN public.profiles p ON p.id = i.id
      WHERE p.id = auth.uid() AND p.role = 'influencer'
    )
  );

-- Merchants pueden crear assignments (asignar influencer a promii)
CREATE POLICY "Merchants can create assignments"
  ON public.promii_influencer_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  );

-- Merchants pueden actualizar/desactivar sus assignments
CREATE POLICY "Merchants can update their assignments"
  ON public.promii_influencer_assignments
  FOR UPDATE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  )
  WITH CHECK (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  );

-- Merchants pueden eliminar assignments
CREATE POLICY "Merchants can delete their assignments"
  ON public.promii_influencer_assignments
  FOR DELETE
  TO authenticated
  USING (
    merchant_id IN (
      SELECT m.id
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- RLS: influencer_referral_visits
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.influencer_referral_visits ENABLE ROW LEVEL SECURITY;

-- Influencers pueden ver sus propias visitas
CREATE POLICY "Influencers can view their visits"
  ON public.influencer_referral_visits
  FOR SELECT
  TO authenticated
  USING (
    influencer_id IN (
      SELECT i.id
      FROM public.influencers i
      JOIN public.profiles p ON p.id = i.id
      WHERE p.id = auth.uid() AND p.role = 'influencer'
    )
  );

-- Merchants pueden ver visitas de sus promiis
CREATE POLICY "Merchants can view visits to their promiis"
  ON public.influencer_referral_visits
  FOR SELECT
  TO authenticated
  USING (
    promii_id IN (
      SELECT pr.id
      FROM public.promiis pr
      JOIN public.merchants m ON m.id = pr.merchant_id
      JOIN public.profiles p ON p.id = m.id
      WHERE p.id = auth.uid() AND p.role = 'merchant'
    )
  );

-- Sistema puede insertar visitas (público)
CREATE POLICY "Anyone can insert visits"
  ON public.influencer_referral_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Sistema puede actualizar conversiones
CREATE POLICY "System can update conversions"
  ON public.influencer_referral_visits
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);


-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS Y TRIGGERS ÚTILES
-- ═══════════════════════════════════════════════════════════════

-- Función para generar código de referido único
CREATE OR REPLACE FUNCTION public.generate_referral_code(
  p_influencer_id UUID,
  p_promii_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_display_name TEXT;
  v_base_name TEXT;
  v_random TEXT;
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Obtener nombre del influencer
  SELECT display_name INTO v_display_name
  FROM public.influencers
  WHERE id = p_influencer_id;

  -- Limpiar nombre (solo letras, max 6 chars)
  v_base_name := UPPER(REGEXP_REPLACE(v_display_name, '[^A-Za-z]', '', 'g'));
  v_base_name := SUBSTRING(v_base_name, 1, 6);

  -- Generar código único
  LOOP
    v_random := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    v_code := 'INF_' || v_base_name || '_' || v_random;

    -- Verificar si existe
    SELECT EXISTS(
      SELECT 1 FROM public.promii_influencer_assignments
      WHERE referral_code = v_code
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$;

COMMENT ON FUNCTION public.generate_referral_code IS
  'Generates a unique referral code for influencer assignments';


-- ═══════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_partnerships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promii_influencer_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.influencer_referral_visits TO authenticated;
GRANT INSERT ON public.influencer_referral_visits TO anon;

-- Grant execute on function
GRANT EXECUTE ON FUNCTION public.generate_referral_code TO authenticated;


-- ═══════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Influencer Partnership System tables created successfully';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ Helper functions added';
END $$;
