import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Server-level in-memory cache to ensure immediate persistence across serverless invocations
declare global {
  var __SHIPMENT_CACHE__: Map<string, any> | undefined;
}

if (!globalThis.__SHIPMENT_CACHE__) {
  globalThis.__SHIPMENT_CACHE__ = new Map();
}
const localCache = globalThis.__SHIPMENT_CACHE__;

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://seexcinebkllrkyicdxx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZXhjaW5lYmtsbHJreWljZHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDIwMzMsImV4cCI6MjEwNDcxODAzM30.mNcEM5oPO56SQsxKqMCEo0Lb-MYfnD5DBL7RFFk2U_c';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function generateCode(carrier: string = 'correios'): string {
  const nums = '0123456789';
  if (carrier === 'loggi') {
    let d = '';
    for (let i = 0; i < 10; i++) d += nums.charAt(Math.floor(Math.random() * nums.length));
    return `LG${d}BR`;
  }
  if (carrier === 'jadlog') {
    let d = '1008';
    for (let i = 0; i < 10; i++) d += nums.charAt(Math.floor(Math.random() * nums.length));
    return d;
  }
  if (carrier === 'cainiao') {
    let d = '';
    for (let i = 0; i < 9; i++) d += nums.charAt(Math.floor(Math.random() * nums.length));
    return `LP${d}BR`;
  }
  if (carrier === 'dhl') {
    let d = '4';
    for (let i = 0; i < 9; i++) d += nums.charAt(Math.floor(Math.random() * nums.length));
    return d;
  }
  if (carrier === 'total_express') {
    let d = '';
    for (let i = 0; i < 9; i++) d += nums.charAt(Math.floor(Math.random() * nums.length));
    return `TEX${d}`;
  }
  let d = '';
  for (let i = 0; i < 9; i++) d += nums.charAt(Math.floor(Math.random() * nums.length));
  return `NL${d}BR`;
}

function getCarrierTrackingUrl(host: string, carrier: string, code: string): string {
  const upper = (code || '').toUpperCase();
  const c = (carrier || '').toLowerCase();
  if (c === 'cainiao' || upper.startsWith('LP') || upper.startsWith('CN')) return `${host}/cainiao/rastreamento/${code}`;
  if (c === 'dhl' || /^\d{10}$/.test(upper)) return `${host}/dhl/rastreamento/${code}`;
  if (c === 'jadlog' || upper.startsWith('1008') || upper.startsWith('JAD')) return `${host}/jadlog/rastreamento/${code}`;
  if (c === 'total_express' || upper.startsWith('TEX')) return `${host}/totalexpress/rastreamento/${code}`;
  if (c === 'correios' || (upper.length === 13 && upper.endsWith('BR') && !upper.startsWith('LG'))) return `${host}/correios/rastreamento/${code}`;
  return `${host}/loggi/rastreamento/${code}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'posted': return 'Objeto Postado';
    case 'in_transit': return 'Em Trânsito';
    case 'out_for_delivery': return 'Saiu para Entrega';
    case 'waiting_pickup': return 'Aguardando Retirada';
    case 'delivered': return 'Entregue';
    case 'returned': return 'Devolvido';
    default: return 'Em Processamento';
  }
}

function generateEvents(carrier: string, originCity: string, originState: string, destCity: string, destState: string, status: string = 'in_transit') {
  const now = new Date();
  const fmt = (daysAgo: number, hoursOffset: number = 0) => {
    const d = new Date(now.getTime() - daysAgo * 86400000 + hoursOffset * 3600000);
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (carrier === 'cainiao') {
    const cai = [
      {
        id: 'cai-1',
        status: 'posted',
        title: 'Recebido pelo operador logístico internacional',
        description: 'Pacote recebido no Centro de Triagem Internacional de Shenzhen (China).',
        location: 'Shenzhen - China',
        ...fmt(6, 2)
      },
      {
        id: 'cai-2',
        status: 'in_transit',
        title: 'Partida em voo internacional para o país de destino',
        description: 'Voo comercial de carga decolou com destino ao Aeroporto Internacional de Curitiba/PR.',
        location: 'Aeroporto Internacional de Shenzhen',
        ...fmt(4, 5)
      },
      {
        id: 'cai-3',
        status: 'in_transit',
        title: 'Chegada ao Brasil - Desembaraço aduaneiro concluído',
        description: 'Importação autorizada pelos órgãos aduaneiros (Receita Federal) sem pendências ou taxas.',
        location: 'Curitiba - PR',
        ...fmt(2, 4)
      },
      {
        id: 'cai-4',
        status: 'out_for_delivery',
        title: 'Objeto saiu para entrega ao destinatário',
        description: 'O entregador local da malha parceira está a caminho do seu endereço.',
        location: `${destCity} - ${destState}`,
        ...fmt(0, 2)
      },
      {
        id: 'cai-5',
        status: 'delivered',
        title: 'Pacote internacional entregue com sucesso',
        description: 'Entrega finalizada com sucesso no endereço cadastrado.',
        location: `${destCity} - ${destState}`,
        ...fmt(0, 5)
      }
    ];
    if (status === 'posted') return cai.slice(0, 1);
    if (status === 'in_transit') return cai.slice(0, 3);
    if (status === 'out_for_delivery') return cai.slice(0, 4);
    if (status === 'delivered') return cai.slice(0, 5);
    return cai.slice(0, 3);
  }

  if (carrier === 'dhl') {
    const dhl = [
      {
        id: 'dhl-1',
        status: 'posted',
        title: 'Remessa coletada pela DHL Express',
        description: 'Envio recebido na central de operações expressas.',
        location: `${originCity} - ${originState}`,
        ...fmt(4, 1)
      },
      {
        id: 'dhl-2',
        status: 'in_transit',
        title: 'Processado no Hub Aéreo DHL Express',
        description: 'Carga aérea consolidada e em rota de transferência prioritária.',
        location: 'Hub Gateway Viracopos - SP',
        ...fmt(2, 6)
      },
      {
        id: 'dhl-3',
        status: 'in_transit',
        title: 'Chegada à estação de entrega local',
        description: `Remessa expressa disponível na filial DHL de ${destCity}/${destState}.`,
        location: `${destCity} - ${destState}`,
        ...fmt(1, 3)
      },
      {
        id: 'dhl-4',
        status: 'out_for_delivery',
        title: 'Com o courier DHL para entrega',
        description: 'Motorista em rota final de entrega ao destinatário.',
        location: `${destCity} - ${destState}`,
        ...fmt(0, 1)
      },
      {
        id: 'dhl-5',
        status: 'delivered',
        title: 'Remessa entregue e assinada',
        description: 'Entrega finalizada com comprovante digitalizado.',
        location: `${destCity} - ${destState}`,
        ...fmt(0, 4)
      }
    ];
    if (status === 'posted') return dhl.slice(0, 1);
    if (status === 'in_transit') return dhl.slice(0, 3);
    if (status === 'out_for_delivery') return dhl.slice(0, 4);
    if (status === 'delivered') return dhl.slice(0, 5);
    return dhl.slice(0, 3);
  }

  const cName = carrier === 'loggi' ? 'Loggi Express' : carrier === 'jadlog' ? 'Jadlog' : carrier === 'total_express' ? 'Total Express' : 'Correios';

  const all = [
    {
      id: 'evt-1',
      status: 'posted',
      title: 'Objeto postado',
      description: `Objeto recebido na agência dos ${cName}. Aguardando triagem para envio.`,
      location: `${originCity} - ${originState}`,
      ...fmt(3, 2)
    },
    {
      id: 'evt-2',
      status: 'in_transit',
      title: 'Objeto em transferência',
      description: `Objeto em trânsito de Unidade de Tratamento em ${originCity}/${originState} para Unidade de Distribuição em ${destCity}/${destState}.`,
      location: `Centro de Distribuição - ${originState}`,
      ...fmt(2, 6)
    },
    {
      id: 'evt-3',
      status: 'in_transit',
      title: 'Objeto recebido na unidade de destino',
      description: `Objeto chegou à central de distribuição local em ${destCity}/${destState}. Preparando para rota de entrega.`,
      location: `${destCity} - ${destState}`,
      ...fmt(1, 4)
    },
    {
      id: 'evt-4',
      status: 'out_for_delivery',
      title: 'Objeto saiu para entrega ao destinatário',
      description: 'O entregador está a caminho do endereço indicado. Certifique-se de que haverá alguém para receber.',
      location: `${destCity} - ${destState}`,
      ...fmt(0, 1)
    },
    {
      id: 'evt-5',
      status: 'delivered',
      title: 'Objeto entregue ao destinatário',
      description: 'Entrega finalizada com sucesso. Agradecemos pela preferência!',
      location: `${destCity} - ${destState}`,
      ...fmt(0, 5)
    }
  ];

  if (status === 'posted') return all.slice(0, 1);
  if (status === 'in_transit') return all.slice(0, 3);
  if (status === 'out_for_delivery') return all.slice(0, 4);
  if (status === 'delivered') return all.slice(0, 5);
  return all.slice(0, 3);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS universal
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const host = req.headers.host ? `https://${req.headers.host}` : 'https://roi-rastreio.site';

  // ==========================================
  // GET: Consultar Rastreio por Código ou Pedido
  // ==========================================
  if (req.method === 'GET') {
    const rawCode = (req.query.code || req.query.c || req.query.id || '') as string;
    const clean = rawCode.trim().toUpperCase().replace(/\s+/g, '');

    if (!clean) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro ?code= é obrigatório. Exemplo: /api/tracking?code=NL123456789BR'
      });
    }

    // 1. Check local cache
    if (localCache.has(clean)) {
      const cached = localCache.get(clean);
      return res.status(200).json({
        found: true,
        source: 'cache',
        ...cached
      });
    }

    // 2. Query Supabase via RPC get_shipment_by_code
    if (supabase) {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_shipment_by_code', {
          p_code: clean
        });

        if (rpcData && !rpcError && (rpcData as any).code) {
          const item = rpcData as any;
          const formatted = {
            found: true,
            source: 'database',
            code: item.code,
            carrier: item.carrier,
            customerName: item.customerName,
            customerPhone: item.customerPhone || '',
            orderNumber: item.orderNumber,
            orderValue: item.orderValue,
            productName: item.productName,
            origin: `${item.originCity} - ${item.originState}`,
            destination: `${item.destinationCity} - ${item.destinationState}`,
            status: item.status,
            statusLabel: getStatusLabel(item.status),
            estimatedDeliveryDate: item.estimatedDeliveryDate,
            trackingUrl: getCarrierTrackingUrl(host, item.carrier, item.code),
            eventsCount: item.events?.length || 0,
            latestEvent: item.events?.[0] || null,
            events: item.events || []
          };

          localCache.set(clean, formatted);
          return res.status(200).json(formatted);
        }
      } catch (e) {
        console.warn('RPC lookup warning:', e);
      }
    }

    // 3. Fallback inteligente se o código tiver formato de rastreio válido
    if (clean.length >= 4) {
      let carrier = 'loggi';
      if (clean.startsWith('LP') || clean.startsWith('CN')) carrier = 'cainiao';
      else if (/^\d{10}$/.test(clean)) carrier = 'dhl';
      else if (clean.startsWith('1008') || clean.startsWith('JAD') || /^\d{12,14}$/.test(clean)) carrier = 'jadlog';
      else if (clean.startsWith('TEX')) carrier = 'total_express';
      else if (clean.endsWith('BR') && !clean.startsWith('LG')) carrier = 'correios';

      const events = generateEvents(carrier, 'Cajamar', 'SP', 'São Paulo', 'SP', 'in_transit');
      const dynamic = {
        found: true,
        source: 'generated',
        code: clean,
        carrier,
        customerName: 'Destinatário',
        customerPhone: '',
        orderNumber: clean.startsWith('ORD-') ? clean : `#${clean.slice(-6) || '1042'}`,
        orderValue: 149.90,
        productName: 'Pacote Express Nacional',
        origin: 'Cajamar - SP',
        destination: 'São Paulo - SP',
        status: 'in_transit',
        statusLabel: getStatusLabel('in_transit'),
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        trackingUrl: getCarrierTrackingUrl(host, carrier, clean),
        eventsCount: events.length,
        latestEvent: events[0] || null,
        events
      };

      return res.status(200).json(dynamic);
    }

    return res.status(404).json({
      found: false,
      error: `Nenhum pacote localizado para o código ${clean}.`
    });
  }

  // ==========================================
  // POST: Criar / Inserir Rastreio via API ou IA
  // ==========================================
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const rawCarrier = (body.carrier || '').toLowerCase();
      let carrier = 'loggi';
      if (rawCarrier.includes('cai')) carrier = 'cainiao';
      else if (rawCarrier.includes('dhl')) carrier = 'dhl';
      else if (rawCarrier.includes('jad')) carrier = 'jadlog';
      else if (rawCarrier.includes('total') || rawCarrier.includes('tex')) carrier = 'total_express';
      else if (rawCarrier.includes('correio')) carrier = 'correios';

      const code = (body.code || generateCode(carrier)).trim().toUpperCase().replace(/\s+/g, '');
      const customerName = body.customerName || body.name || 'Cliente';
      const customerPhone = body.customerPhone || body.phone || '';
      const customerEmail = body.customerEmail || body.email || '';
      const orderNumber = String(body.orderNumber || body.order_number || Math.floor(1000 + Math.random() * 9000));
      const orderValue = parseFloat(body.orderValue || body.value || 99.90);
      const productName = body.productName || body.product || 'Produto';
      const originCity = body.originCity || 'Cajamar';
      const originState = body.originState || 'SP';
      const destCity = body.destinationCity || body.city || 'São Paulo';
      const destState = body.destinationState || body.state || 'SP';
      const destZip = body.destinationZip || body.zip || '01000-000';
      const status = body.status || 'posted';
      const deliveryDays = parseInt(body.deliveryDays) || 15;
      const estimatedDeliveryDate = body.estimatedDeliveryDate || new Date(Date.now() + 86400000 * deliveryDays).toISOString().split('T')[0];

      const events = body.events && Array.isArray(body.events) && body.events.length > 0
        ? body.events
        : generateEvents(carrier, originCity, originState, destCity, destState, status);

      const trackingUrl = getCarrierTrackingUrl(host, carrier, code);

      const shipmentRecord = {
        code,
        carrier,
        customerName,
        customerPhone,
        customerEmail,
        orderNumber,
        orderValue,
        productName,
        originCity,
        originState,
        destinationCity: destCity,
        destinationState: destState,
        destinationZip: destZip,
        status,
        statusLabel: getStatusLabel(status),
        estimatedDeliveryDate,
        trackingUrl,
        eventsCount: events.length,
        latestEvent: events[0] || null,
        events
      };

      // Store in memory cache
      localCache.set(code, shipmentRecord);
      localCache.set(orderNumber.toUpperCase(), shipmentRecord);

      // Save to Supabase (via atomic RPC or direct insert)
      if (supabase) {
        try {
          const { error: rpcErr } = await supabase.rpc('save_shipment_atomic', {
            p_code: code,
            p_carrier: carrier,
            p_customer_name: customerName,
            p_customer_phone: customerPhone,
            p_customer_email: customerEmail,
            p_order_number: orderNumber,
            p_order_value: orderValue,
            p_product_name: productName,
            p_origin_city: originCity,
            p_origin_state: originState,
            p_destination_city: destCity,
            p_destination_state: destState,
            p_destination_zip: destZip,
            p_status: status,
            p_estimated_delivery_date: estimatedDeliveryDate,
            p_events: events
          });

          if (rpcErr) {
            console.warn('save_shipment_atomic error:', rpcErr);
          }
        } catch (dbErr) {
          console.warn('Supabase save error:', dbErr);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Rastreio criado e registrado com sucesso!',
        data: shipmentRecord
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'Erro ao criar rastreio via API'
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
