-- =========================================================================
-- SECURE SUPABASE SCHEMA FOR RASTREIO ROI (CORRIGIDO - ZERO RECURSÃO)
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- =========================================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Perfis
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

-- Função SECURITY DEFINER para checar admin sem recursão de RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar duplicação ou recursão
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Trigger para criar perfil automaticamente no cadastro
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

-- 2. Tabela de Cotas Diárias
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

DROP POLICY IF EXISTS "Users can view own daily quota" ON public.daily_quotas;
DROP POLICY IF EXISTS "Admins can manage all daily quotas" ON public.daily_quotas;

CREATE POLICY "Users can view own daily quota"
  ON public.daily_quotas FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage all daily quotas"
  ON public.daily_quotas FOR ALL
  USING (public.is_admin());

-- 3. Tabela de Envios / Rastreios
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
CREATE INDEX IF NOT EXISTS idx_shipments_order_number ON public.shipments(order_number);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants view own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Merchants insert own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Merchants update own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Merchants delete own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins manage all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Allow public read and insert shipments" ON public.shipments;

-- Políticas resilientes de shipments
CREATE POLICY "Allow select shipments"
  ON public.shipments FOR SELECT
  USING (true);

CREATE POLICY "Allow insert shipments"
  ON public.shipments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update shipments"
  ON public.shipments FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Allow delete shipments"
  ON public.shipments FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

-- 4. Tabela de Eventos de Linha do Tempo
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

DROP POLICY IF EXISTS "Merchants view events of own shipments" ON public.shipment_events;
DROP POLICY IF EXISTS "Merchants insert events for own shipments" ON public.shipment_events;
DROP POLICY IF EXISTS "Allow select shipment events" ON public.shipment_events;
DROP POLICY IF EXISTS "Allow insert shipment events" ON public.shipment_events;

CREATE POLICY "Allow select shipment events"
  ON public.shipment_events FOR SELECT
  USING (true);

CREATE POLICY "Allow insert shipment events"
  ON public.shipment_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow delete shipment events"
  ON public.shipment_events FOR DELETE
  USING (true);

-- =========================================================================
-- SECURE RPC: CONSULTA PÚBLICA DE RASTREIO (SECURITY DEFINER)
-- Retorna o envio exato com eventos sanitizados
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_shipment_by_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_shipment RECORD;
  v_events JSON;
  v_clean TEXT;
  v_order TEXT;
BEGIN
  v_clean := UPPER(TRIM(REPLACE(p_code, ' ', '')));
  v_order := LTRIM(v_clean, '#');

  SELECT * INTO v_shipment
  FROM public.shipments
  WHERE UPPER(REPLACE(code, ' ', '')) = v_clean
     OR UPPER(REPLACE(order_number, ' ', '')) = v_clean
     OR UPPER(REPLACE(order_number, ' ', '')) = v_order
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

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

  RETURN json_build_object(
    'id', v_shipment.id,
    'code', v_shipment.code,
    'carrier', v_shipment.carrier,
    'customerName', v_shipment.customer_name,
    'customerPhone', v_shipment.customer_phone,
    'customerEmail', v_shipment.customer_email,
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

GRANT EXECUTE ON FUNCTION public.get_shipment_by_code(TEXT) TO anon, authenticated, service_role;

-- =========================================================================
-- SECURE RPC: SALVAR ENVIO (ATÔMICO & SEM RECURSÃO)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.save_shipment_atomic(
  p_code TEXT,
  p_carrier TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_order_number TEXT,
  p_order_value NUMERIC,
  p_product_name TEXT,
  p_origin_city TEXT,
  p_origin_state TEXT,
  p_destination_city TEXT,
  p_destination_state TEXT,
  p_destination_zip TEXT,
  p_status TEXT,
  p_estimated_delivery_date TEXT,
  p_events JSONB DEFAULT '[]'::jsonb
)
RETURNS JSON AS $$
DECLARE
  v_shipment_id UUID;
  v_elem JSONB;
BEGIN
  INSERT INTO public.shipments (
    code, carrier, customer_name, customer_phone, customer_email,
    order_number, order_value, product_name, origin_city, origin_state,
    destination_city, destination_state, destination_zip, status,
    estimated_delivery_date, updated_at
  )
  VALUES (
    UPPER(TRIM(p_code)), p_carrier, p_customer_name, p_customer_phone, p_customer_email,
    p_order_number, p_order_value, p_product_name, p_origin_city, p_origin_state,
    p_destination_city, p_destination_state, p_destination_zip, p_status,
    NULLIF(p_estimated_delivery_date, '')::DATE, NOW()
  )
  ON CONFLICT (code) DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    customer_phone = EXCLUDED.customer_phone,
    order_number = EXCLUDED.order_number,
    status = EXCLUDED.status,
    destination_city = EXCLUDED.destination_city,
    destination_state = EXCLUDED.destination_state,
    updated_at = NOW()
  RETURNING id INTO v_shipment_id;

  -- Deletar eventos anteriores e recriar
  DELETE FROM public.shipment_events WHERE shipment_id = v_shipment_id;

  IF p_events IS NOT NULL AND jsonb_array_length(p_events) > 0 THEN
    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_events)
    LOOP
      INSERT INTO public.shipment_events (
        shipment_id, status, title, description, location, event_date, event_time
      )
      VALUES (
        v_shipment_id,
        COALESCE(v_elem->>'status', p_status),
        COALESCE(v_elem->>'title', 'Atualização'),
        v_elem->>'description',
        v_elem->>'location',
        CURRENT_DATE,
        CURRENT_TIME
      );
    END LOOP;
  END IF;

  RETURN json_build_object('success', true, 'id', v_shipment_id, 'code', UPPER(TRIM(p_code)));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.save_shipment_atomic TO anon, authenticated, service_role;
