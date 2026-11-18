import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function generateTrackingCode(carrier: string = 'correios'): string {
  const nums = '0123456789';
  if (carrier === 'loggi') {
    let digits = '';
    for (let i = 0; i < 10; i++) digits += nums.charAt(Math.floor(Math.random() * nums.length));
    return `LG${digits}BR`;
  }
  if (carrier === 'jadlog') {
    let digits = '1008';
    for (let i = 0; i < 10; i++) digits += nums.charAt(Math.floor(Math.random() * nums.length));
    return digits;
  }
  // Correios default
  let digits = '';
  for (let i = 0; i < 9; i++) digits += nums.charAt(Math.floor(Math.random() * nums.length));
  return `NL${digits}BR`;
}

function parseWebhookPayload(platform: string, body: any) {
  let customerName = 'Cliente';
  let customerPhone = '';
  let customerEmail = '';
  let orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  let orderValue = 99.90;
  let productName = 'Produto';
  let destCity = 'São Paulo';
  let destState = 'SP';
  let destZip = '01000-000';

  if (!body) return { customerName, customerPhone, customerEmail, orderNumber, orderValue, productName, destCity, destState, destZip };

  switch (platform.toLowerCase()) {
    case 'shopify':
      customerName = `${body.customer?.first_name || ''} ${body.customer?.last_name || ''}`.trim() || body.shipping_address?.name || 'Cliente Shopify';
      customerPhone = body.customer?.phone || body.shipping_address?.phone || body.phone || '';
      customerEmail = body.customer?.email || body.email || '';
      orderNumber = body.order_number ? String(body.order_number) : (body.name || orderNumber);
      orderValue = parseFloat(body.total_price) || orderValue;
      productName = body.line_items?.[0]?.title || 'Pedido Shopify';
      destCity = body.shipping_address?.city || destCity;
      destState = body.shipping_address?.province_code || body.shipping_address?.province || destState;
      destZip = body.shipping_address?.zip || destZip;
      break;

    case 'yampi':
      customerName = body.customer?.name || body.shipping_address?.receiver || 'Cliente Yampi';
      customerPhone = body.customer?.phone?.full_number || body.customer?.cellphone || '';
      customerEmail = body.customer?.email || '';
      orderNumber = body.number ? String(body.number) : (body.id ? String(body.id) : orderNumber);
      orderValue = parseFloat(body.value_total) || orderValue;
      productName = body.items?.[0]?.product?.name || 'Pedido Yampi';
      destCity = body.shipping_address?.city || destCity;
      destState = body.shipping_address?.state || destState;
      destZip = body.shipping_address?.zipcode || destZip;
      break;

    case 'cartpanda':
      customerName = body.customer?.name || body.shipping_address?.first_name || 'Cliente CartPanda';
      customerPhone = body.customer?.phone || body.shipping_address?.phone || '';
      customerEmail = body.customer?.email || '';
      orderNumber = body.order_id ? String(body.order_id) : (body.id ? String(body.id) : orderNumber);
      orderValue = parseFloat(body.total_price) || orderValue;
      productName = body.line_items?.[0]?.name || 'Pedido CartPanda';
      destCity = body.shipping_address?.city || destCity;
      destState = body.shipping_address?.province || destState;
      destZip = body.shipping_address?.zip || destZip;
      break;

    case 'nuvemshop':
      customerName = body.customer?.name || body.billing_name || 'Cliente Nuvemshop';
      customerPhone = body.customer?.phone || body.billing_phone || '';
      customerEmail = body.customer?.email || '';
      orderNumber = body.number ? String(body.number) : (body.id ? String(body.id) : orderNumber);
      orderValue = parseFloat(body.total) || orderValue;
      productName = body.products?.[0]?.name || 'Pedido Nuvemshop';
      destCity = body.shipping_address?.city || destCity;
      destState = body.shipping_address?.province || destState;
      destZip = body.shipping_address?.zipcode || destZip;
      break;

    case 'kiwify':
      customerName = body.Customer?.full_name || body.Customer?.name || 'Cliente Kiwify';
      customerPhone = body.Customer?.mobile || body.Customer?.phone || '';
      customerEmail = body.Customer?.email || '';
      orderNumber = body.order_id ? String(body.order_id) : orderNumber;
      orderValue = (parseFloat(body.order_ref_amount) / 100) || orderValue;
      productName = body.Product?.product_name || 'Produto Físico Kiwify';
      destCity = body.Customer?.address_city || destCity;
      destState = body.Customer?.address_state || destState;
      destZip = body.Customer?.address_zip_code || destZip;
      break;

    default:
      customerName = body.name || body.customerName || customerName;
      customerPhone = body.phone || body.customerPhone || customerPhone;
      customerEmail = body.email || body.customerEmail || customerEmail;
      orderNumber = body.orderNumber || body.order_number || body.orderId || orderNumber;
      orderValue = parseFloat(body.orderValue || body.value || body.total) || orderValue;
      productName = body.productName || body.product || productName;
      destCity = body.city || body.destinationCity || destCity;
      destState = body.state || body.destinationState || destState;
      destZip = body.zip || body.destinationZip || destZip;
  }

  return { customerName, customerPhone, customerEmail, orderNumber, orderValue, productName, destCity, destState, destZip };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
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

  const { platform } = req.query;
  const platformStr = Array.isArray(platform) ? platform[0] : (platform || 'generic');

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      platform: platformStr,
      message: `Webhook endpoint para ${platformStr} está ativo e pronto para receber POST com compras aprovadas.`,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    const parsed = parseWebhookPayload(platformStr, body);

    const carrier = 'correios';
    const code = generateTrackingCode(carrier);
    const host = req.headers.host ? `https://${req.headers.host}` : 'https://roi-rastreio.site';
    const trackingUrl = `${host}/r/${code}`;

    // If Supabase is connected, save shipment and initial event
    if (supabase) {
      const { data: created, error } = await supabase
        .from('shipments')
        .upsert({
          code: code.toUpperCase(),
          carrier,
          customer_name: parsed.customerName,
          customer_phone: parsed.customerPhone,
          customer_email: parsed.customerEmail,
          order_number: String(parsed.orderNumber),
          order_value: parsed.orderValue,
          product_name: parsed.productName,
          origin_city: 'Cajamar',
          origin_state: 'SP',
          destination_city: parsed.destCity,
          destination_state: parsed.destState,
          destination_zip: parsed.destZip,
          status: 'posted',
          estimated_delivery_date: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
        }, { onConflict: 'code' })
        .select('id')
        .single();

      if (created?.id) {
        await supabase.from('shipment_events').insert([
          {
            shipment_id: created.id,
            status: 'posted',
            title: 'Objeto postado',
            description: 'Objeto recebido na agência. Aguardando triagem para envio.',
            location: 'Cajamar - SP',
            event_date: new Date().toISOString().split('T')[0],
            event_time: new Date().toTimeString().split(' ')[0],
          }
        ]);
      }
    }

    return res.status(200).json({
      success: true,
      platform: platformStr,
      trackingCode: code,
      trackingUrl,
      orderNumber: parsed.orderNumber,
      customerName: parsed.customerName,
      message: 'Código de rastreio gerado e pedido registrado com sucesso!',
    });
  } catch (err: any) {
    console.error('[Webhook Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro interno ao processar webhook',
    });
  }
}
