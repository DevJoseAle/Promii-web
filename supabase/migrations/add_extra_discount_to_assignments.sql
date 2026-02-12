-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Agregar descuento extra a assignments
-- Description: Permite definir descuento adicional cuando se usa código de influencer
-- ═══════════════════════════════════════════════════════════════

-- Agregar columnas de descuento extra
ALTER TABLE public.promii_influencer_assignments
  ADD COLUMN IF NOT EXISTS extra_discount_type TEXT CHECK (extra_discount_type IN ('percentage', 'fixed')),
  ADD COLUMN IF NOT EXISTS extra_discount_value NUMERIC(10, 2);

-- Comentarios
COMMENT ON COLUMN public.promii_influencer_assignments.extra_discount_type IS
  'Tipo de descuento extra: percentage (porcentaje) o fixed (monto fijo en la moneda del promii)';

COMMENT ON COLUMN public.promii_influencer_assignments.extra_discount_value IS
  'Valor del descuento extra. Si es percentage: número entre 0-100. Si es fixed: monto en la moneda del promii';

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Extra discount columns added to promii_influencer_assignments';
END $$;
