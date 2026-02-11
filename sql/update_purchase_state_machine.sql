-- Update the enforce_purchase_state_machine trigger to allow merchant to mark payment as received
-- This allows: pending_payment -> pending_validation (by merchant)

CREATE OR REPLACE FUNCTION public.enforce_purchase_state_machine()
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

  -- Solo user/merchant relacionados pueden tocar la fila
  if not is_owner_user and not is_owner_merchant then
    raise exception 'Not allowed';
  end if;

  -- Si es USER (y NO es merchant de esa fila)
  if is_owner_user and not is_owner_merchant then
    -- User NO puede cambiar a estados finales ni intermedios indebidos
    if new.status <> old.status then
      if not (old.status = 'pending_payment' and new.status = 'pending_validation') then
        raise exception 'User cannot change status from % to %', old.status, new.status;
      end if;
    end if;

    -- User NO puede tocar validación/canje/cupón
    if new.validated_at is distinct from old.validated_at
      or new.validated_by is distinct from old.validated_by
      or new.rejection_reason is distinct from old.rejection_reason
      or new.coupon_code is distinct from old.coupon_code
      or new.coupon_expires_at is distinct from old.coupon_expires_at
      or new.redeemed_at is distinct from old.redeemed_at
      or new.redeemed_by is distinct from old.redeemed_by
      or new.redeem_notes is distinct from old.redeem_notes
    then
      raise exception 'User cannot modify validation/coupon/redeem fields';
    end if;

    -- User NO puede cambiar el monto/moneda/método una vez creado (evita fraude)
    if new.paid_amount is distinct from old.paid_amount
      or new.paid_currency is distinct from old.paid_currency
      or new.payment_method is distinct from old.payment_method
    then
      raise exception 'User cannot modify paid_amount/paid_currency/payment_method';
    end if;

    return new;
  end if;

  -- Si es MERCHANT (y NO es el user dueño)
  if is_owner_merchant and not is_owner_user then
    -- Merchant solo puede transicionar:
    -- pending_payment -> pending_validation (NEW: marcar comprobante recibido)
    -- pending_validation -> approved|rejected
    -- approved -> redeemed
    if new.status <> old.status then
      if old.status = 'pending_payment' and new.status = 'pending_validation' then
        -- NEW: Allow merchant to mark payment as received
        null;
      elsif old.status = 'pending_validation' and new.status in ('approved','rejected') then
        -- ok
        null;
      elsif old.status = 'approved' and new.status = 'redeemed' then
        -- ok
        null;
      else
        raise exception 'Merchant cannot change status from % to %', old.status, new.status;
      end if;
    end if;

    -- Merchant NO puede cambiar campos de pago del usuario
    if new.paid_amount is distinct from old.paid_amount
      or new.paid_currency is distinct from old.paid_currency
      or new.payment_method is distinct from old.payment_method
      or new.payment_reference is distinct from old.payment_reference
      or new.payment_proof_url is distinct from old.payment_proof_url
      or new.paid_at is distinct from old.paid_at
    then
      raise exception 'Merchant cannot modify payment fields';
    end if;

    -- Merchant no debería tocar snapshot
    if new.promii_snapshot_title is distinct from old.promii_snapshot_title
      or new.promii_snapshot_terms is distinct from old.promii_snapshot_terms
      or new.promii_snapshot_price_amount is distinct from old.promii_snapshot_price_amount
      or new.promii_snapshot_price_currency is distinct from old.promii_snapshot_price_currency
    then
      raise exception 'Merchant cannot modify snapshot fields';
    end if;

    -- Si merchant aprueba/rechaza, debe setear validated_at (recomendación)
    if new.status in ('approved','rejected') and new.validated_at is null then
      new.validated_at := now();
      new.validated_by := auth.uid();
    end if;

    -- Si merchant marca como pending_validation, setear paid_at si no existe
    if new.status = 'pending_validation' and old.status = 'pending_payment' and new.paid_at is null then
      new.paid_at := now();
    end if;

    -- Si merchant canjea, debe setear redeemed_at
    if new.status = 'redeemed' and new.redeemed_at is null then
      new.redeemed_at := now();
      new.redeemed_by := auth.uid();
    end if;

    return new;
  end if;

  -- Caso raro: si auth.uid() coincide con user_id y merchant_id (no debería)
  return new;
end;
$$;
