-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Feedbacks (merchant/influencer)
-- Description: Stores feedback from merchants and influencers + admin responses
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('merchant', 'influencer')),

  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'bug', 'idea', 'support')),
  rating SMALLINT NULL CHECK (rating >= 1 AND rating <= 5),

  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  admin_response TEXT NULL,
  responded_at TIMESTAMPTZ NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id_created_at
  ON public.feedbacks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedbacks_status
  ON public.feedbacks(status);

DROP TRIGGER IF EXISTS trg_feedbacks_updated_at ON public.feedbacks;

CREATE TRIGGER trg_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.feedbacks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create feedback for their own account and role
CREATE POLICY "Users can create own feedback"
  ON public.feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text = feedbacks.role
    )
  );

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback"
  ON public.feedbacks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Admins can update feedback (respond/close)
CREATE POLICY "Admins can update feedback"
  ON public.feedbacks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );
