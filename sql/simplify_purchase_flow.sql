-- Simplify the purchase flow by removing the restrictive state machine trigger
-- RLS policies will still ensure only the right users can modify orders

-- Drop the restrictive trigger
DROP TRIGGER IF EXISTS enforce_purchase_state_machine_trigger ON promii_purchases;

-- Optionally, you can keep the trigger for filling snapshots on insert
-- but remove the state machine enforcement

-- If you want to recreate a simpler version that only validates ownership but not state transitions:
CREATE OR REPLACE FUNCTION public.enforce_purchase_ownership()
RETURNS trigger
LANGUAGE plpgsql
AS $$
declare
  is_admin boolean;
  is_owner_user boolean;
  is_owner_merchant boolean;
begin
  -- Admin bypass
  is_admin := public.is_admin();
  if is_admin then
    return new;
  end if;

  is_owner_user := (new.user_id = auth.uid());
  is_owner_merchant := (new.merchant_id = auth.uid());

  -- Only user or merchant can modify
  if not is_owner_user and not is_owner_merchant then
    raise exception 'Not allowed';
  end if;

  -- Auto-set fields when merchant approves
  if is_owner_merchant and new.status in ('approved','rejected') and new.validated_at is null then
    new.validated_at := now();
    new.validated_by := auth.uid();
  end if;

  -- Auto-set fields when merchant redeems
  if is_owner_merchant and new.status = 'redeemed' and new.redeemed_at is null then
    new.redeemed_at := now();
    new.redeemed_by := auth.uid();
  end if;

  return new;
end;
$$;

-- Create the simpler trigger
DROP TRIGGER IF EXISTS enforce_purchase_ownership_trigger ON promii_purchases;
CREATE TRIGGER enforce_purchase_ownership_trigger
BEFORE UPDATE ON promii_purchases
FOR EACH ROW
EXECUTE FUNCTION public.enforce_purchase_ownership();
