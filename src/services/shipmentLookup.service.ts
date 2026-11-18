import { Shipment } from '../types';
import { Storage } from '../utils/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateDynamicShipment } from '../utils/generators';

export async function lookupShipment(
  rawCode: string,
  contextShipments?: Shipment[]
): Promise<Shipment | null> {
  const clean = (rawCode || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!clean) return null;

  const normalizedOrder = clean.replace(/^#/, '');

  // 1. Check in context shipments first (if provided)
  if (contextShipments && contextShipments.length > 0) {
    const foundInContext = contextShipments.find(s => {
      const sCode = (s.code || '').toUpperCase().replace(/\s+/g, '');
      const sOrder = (s.orderNumber || '').toUpperCase().replace(/\s+/g, '').replace(/^#/, '');
      return sCode === clean || sOrder === normalizedOrder || sCode === clean || sOrder === clean;
    });
    if (foundInContext) return foundInContext;
  }

  // 2. Check in all local storage shipments (across all users/guests)
  const foundInStorage = Storage.getShipmentByCode(clean);
  if (foundInStorage) {
    return foundInStorage;
  }

  // 3. Query Supabase (Remote DB)
  if (isSupabaseConfigured()) {
    try {
      // 3a. Try RPC get_shipment_by_code
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_shipment_by_code', {
        p_code: clean
      });

      if (rpcData && !rpcError && (rpcData as any).code) {
        return rpcData as Shipment;
      }

      // 3b. Fallback to direct query on shipments table
      const { data: tableData, error: tableError } = await supabase
        .from('shipments')
        .select('*')
        .or(`code.ilike.${clean},order_number.ilike.${clean},order_number.ilike.${normalizedOrder}`)
        .limit(1)
        .maybeSingle();

      if (tableData && !tableError) {
        // Fetch events for this shipment
        const { data: eventsData } = await supabase
          .from('shipment_events')
          .select('*')
          .eq('shipment_id', tableData.id)
          .order('event_date', { ascending: false });

        const mapped: Shipment = {
          id: tableData.id,
          code: tableData.code,
          carrier: tableData.carrier,
          customerName: tableData.customer_name,
          customerPhone: tableData.customer_phone || '',
          customerEmail: tableData.customer_email || '',
          orderNumber: tableData.order_number,
          orderValue: Number(tableData.order_value) || 0,
          productName: tableData.product_name || 'Produto',
          originCity: tableData.origin_city || 'Cajamar',
          originState: tableData.origin_state || 'SP',
          destinationCity: tableData.destination_city || 'São Paulo',
          destinationState: tableData.destination_state || 'SP',
          destinationZip: tableData.destination_zip || '',
          status: tableData.status,
          estimatedDeliveryDate: tableData.estimated_delivery_date || '',
          events: (eventsData || []).map((ev: any) => ({
            id: ev.id,
            status: ev.status,
            title: ev.title,
            description: ev.description,
            location: ev.location,
            date: ev.event_date,
            time: ev.event_time
          })),
          createdAt: tableData.created_at,
          updatedAt: tableData.updated_at,
          whatsappNotified: tableData.whatsapp_notified || false,
          emailNotified: tableData.email_notified || false,
          upsellClicks: tableData.upsell_clicks || 0,
          upsellConversions: tableData.upsell_conversions || 0
        };

        return mapped;
      }
    } catch (err) {
      console.warn('[shipmentLookup] Erro na consulta Supabase:', err);
    }
  }

  // 3.5 Query Universal Serverless API (/api/tracking)
  if (typeof window !== 'undefined') {
    try {
      const origin = window.location.origin || '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch(`${origin}/api/tracking?code=${encodeURIComponent(clean)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.shipment && json.shipment.code) {
          const apiShipment: Shipment = json.shipment;
          try {
            Storage.addShipment(apiShipment, 'api_cache');
          } catch {}
          return apiShipment;
        }
      }
    } catch (apiErr) {
      // API not reachable or timeout, proceed to fallback
    }
  }

  // 4. Intelligent Fallback Generation:
  // If the user entered any valid tracking code pattern, order format, or query (e.g. NL...BR, LG...BR, 1008..., TEX..., KG..., #1234, ORD-...),
  // dynamically generate a realistic timeline and cache it locally so it's always found!
  if (clean.length >= 4) {
    const dynamic = generateDynamicShipment(clean);
    try {
      Storage.addShipment(dynamic, 'dynamic_guest');
    } catch {}
    return dynamic;
  }

  return null;
}
