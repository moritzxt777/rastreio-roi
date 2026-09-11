-- =========================================================================
-- SECURE SUPABASE SCHEMA FOR RASTREIO ROI
-- Run this script in your Supabase SQL Editor
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  store_name TEXT DEFAULT 'Minha Loja',
  role TEXT DEFAULT 'merchant' CHECK (role IN ('admin', 'merchant')),
  daily_limit INTEGER DEFAULT 100,
  is_unlimited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, store_name, role, daily_limit, is_unlimited)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Lojista'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'store_name', 'Minha Loja'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'merchant'),
    100,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Daily Quotas Table
CREATE TABLE IF NOT EXISTS public.daily_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quota_date DATE NOT NULL DEFAULT CURRENT_DATE,
  used_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 100,
  is_unlimited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quota_date)
);

ALTER TABLE public.daily_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily quota"
  ON public.daily_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all daily quotas"
  ON public.daily_quotas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  carrier TEXT NOT NULL DEFAULT 'correios',
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  order_number TEXT NOT NULL,
  order_value NUMERIC(10,2) DEFAULT 0.00,
  product_name TEXT DEFAULT 'Produto',
  origin_city TEXT DEFAULT 'Cajamar',
  origin_state TEXT DEFAULT 'SP',
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  destination_zip TEXT,
  status TEXT NOT NULL DEFAULT 'posted',
  estimated_delivery_date DATE,
  whatsapp_notified BOOLEAN DEFAULT FALSE,
  email_notified BOOLEAN DEFAULT FALSE,
  upsell_clicks INTEGER DEFAULT 0,
  upsell_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_code ON public.shipments(code);
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments(user_id);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- STRICT RLS: Only the owner merchant can access their shipments table
CREATE POLICY "Merchants view own shipments"
  ON public.shipments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants insert own shipments"
  ON public.shipments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants update own shipments"
  ON public.shipments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants delete own shipments"
  ON public.shipments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all shipments"
  ON public.shipments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Shipment Events Table
CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE DEFAULT CURRENT_DATE,
  event_time TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_shipment_id ON public.shipment_events(shipment_id);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants view events of own shipments"
  ON public.shipment_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.shipments WHERE id = shipment_events.shipment_id AND user_id = auth.uid())
  );

CREATE POLICY "Merchants insert events for own shipments"
  ON public.shipment_events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shipments WHERE id = shipment_id AND user_id = auth.uid())
  );

-- 5. WhatsApp Templates & Logs
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  trigger_status TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own templates" ON public.whatsapp_templates FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  tracking_code TEXT,
  status TEXT DEFAULT 'sent',
  trigger_status TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own logs" ON public.whatsapp_logs FOR ALL USING (auth.uid() = user_id);

-- =========================================================================
-- SECURE RPC: PUBLIC TRACKING QUERY (ZERO LEAKAGE)
-- Returns only the single matched shipment + its events for anonymous users
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_shipment_by_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_shipment RECORD;
  v_events JSON;
BEGIN
  -- Lookup single shipment by code or order number (case insensitive)
  SELECT * INTO v_shipment
  FROM public.shipments
  WHERE UPPER(code) = UPPER(TRIM(p_code))
     OR UPPER(order_number) = UPPER(TRIM(p_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get timeline events for this shipment
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', id,
        'status', status,
        'title', title,
        'description', description,
        'location', location,
        'date', TO_CHAR(event_date, 'DD/MM/YYYY'),
        'time', TO_CHAR(event_time, 'HH24:MI')
      ) ORDER BY event_date DESC, event_time DESC
    ), '[]'::json
  ) INTO v_events
  FROM public.shipment_events
  WHERE shipment_id = v_shipment.id;

  -- Return sanitized single object
  RETURN json_build_object(
    'id', v_shipment.id,
    'code', v_shipment.code,
    'carrier', v_shipment.carrier,
    'customerName', v_shipment.customer_name,
    'customerPhone', v_shipment.customer_phone,
    'orderNumber', v_shipment.order_number,
    'orderValue', v_shipment.order_value,
    'productName', v_shipment.product_name,
    'originCity', v_shipment.origin_city,
    'originState', v_shipment.origin_state,
    'destinationCity', v_shipment.destination_city,
    'destinationState', v_shipment.destination_state,
    'destinationZip', v_shipment.destination_zip,
    'status', v_shipment.status,
    'estimatedDeliveryDate', TO_CHAR(v_shipment.estimated_delivery_date, 'YYYY-MM-DD'),
    'events', v_events
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anonymous & authenticated users to execute only this RPC
GRANT EXECUTE ON FUNCTION public.get_shipment_by_code(TEXT) TO anon, authenticated;

-- =========================================================================
-- ATOMIC QUOTA CONSUMPTION RPC
-- =========================================================================
CREATE OR REPLACE FUNCTION public.consume_daily_quota(p_user_id UUID, p_count INTEGER DEFAULT 1)
RETURNS JSON AS $$
DECLARE
  v_quota RECORD;
  v_limit INTEGER;
  v_unlimited BOOLEAN;
BEGIN
  -- Get user limit configuration
  SELECT daily_limit, is_unlimited INTO v_limit, v_unlimited 
  FROM public.profiles 
  WHERE id = p_user_id;

  IF v_limit IS NULL THEN
    v_limit := 100;
    v_unlimited := FALSE;
  END IF;

  -- Insert or get today's quota
  INSERT INTO public.daily_quotas (user_id, quota_date, used_count, daily_limit, is_unlimited)
  VALUES (p_user_id, CURRENT_DATE, p_count, v_limit, v_unlimited)
  ON CONFLICT (user_id, quota_date) 
  DO UPDATE SET 
    used_count = daily_quotas.used_count + p_count,
    daily_limit = v_limit,
    is_unlimited = v_unlimited,
    updated_at = NOW()
  RETURNING * INTO v_quota;

  IF NOT v_quota.is_unlimited AND v_quota.used_count > v_quota.daily_limit THEN
    -- Rollback increment
    UPDATE public.daily_quotas 
    SET used_count = used_count - p_count 
    WHERE id = v_quota.id;

    RETURN json_build_object(
      'success', false, 
      'message', 'Limite diário atingido (' || v_quota.used_count || '/' || v_quota.daily_limit || '). A cota zera à meia-noite.'
    );
  END IF;

  RETURN json_build_object(
    'success', true, 
    'used', v_quota.used_count,
    'limit', v_quota.daily_limit,
    'is_unlimited', v_quota.is_unlimited
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.consume_daily_quota(UUID, INTEGER) TO authenticated;
