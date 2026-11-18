// src/services/whatsapp.service.ts
import { Storage } from '../utils/storage';

export interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  enabled: boolean;
}

const STORAGE_KEY_WHATSAPP_CONFIG = 'rastreio_whatsapp_config_v1';

export function getWhatsAppConfig(): WhatsAppConfig {
  const envUrl = import.meta.env.VITE_WHATSAPP_API_URL;
  const envKey = import.meta.env.VITE_WHATSAPP_API_KEY;

  const raw = localStorage.getItem(STORAGE_KEY_WHATSAPP_CONFIG);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        apiUrl: parsed.apiUrl || envUrl || '',
        apiKey: parsed.apiKey || envKey || '',
        instanceName: parsed.instanceName || 'main',
        enabled: parsed.enabled !== false,
      };
    } catch {}
  }

  return {
    apiUrl: envUrl || '',
    apiKey: envKey && envKey !== 'change-me' ? envKey : '',
    instanceName: 'main',
    enabled: true,
  };
}

export function saveWhatsAppConfig(config: WhatsAppConfig): void {
  localStorage.setItem(STORAGE_KEY_WHATSAPP_CONFIG, JSON.stringify(config));
}

export interface SendTrackingMessageParams {
  phone: string;
  customerName: string;
  orderNumber: string;
  trackingCode: string;
  productName: string;
  templateMessage: string;
  customTrackingUrl?: string;
}

export function formatWhatsAppMessage({
  customerName,
  orderNumber,
  trackingCode,
  productName,
  templateMessage,
  customTrackingUrl,
}: Omit<SendTrackingMessageParams, 'phone'>): string {
  const cleanCode = encodeURIComponent((trackingCode || '').trim().toUpperCase().replace(/\s+/g, ''));
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://roi-rastreio.site';
  
  let defaultLink = `${origin}/loggi/rastreamento/${cleanCode}`;
  if (trackingCode.toUpperCase().startsWith('1008') || trackingCode.toUpperCase().startsWith('JAD') || /^\d{9,}$/.test(cleanCode)) {
    defaultLink = `${origin}/jadlog/rastreamento/${cleanCode}`;
  }
  const trackingLink = customTrackingUrl || defaultLink;

  return templateMessage
    .replace(/{nome}/g, customerName.split(' ')[0] || customerName)
    .replace(/{pedido}/g, orderNumber)
    .replace(/{codigo}/g, trackingCode)
    .replace(/{link_rastreio}/g, trackingLink)
    .replace(/{produto}/g, productName);
}

export function buildDirectWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(text)}`;
}

export async function sendWhatsAppTrackingNotification({
  phone,
  customerName,
  orderNumber,
  trackingCode,
  productName,
  templateMessage,
  customTrackingUrl,
}: SendTrackingMessageParams) {
  const message = formatWhatsAppMessage({
    customerName,
    orderNumber,
    trackingCode,
    productName,
    templateMessage,
    customTrackingUrl,
  });

  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) {
    throw new Error('Número de telefone do cliente inválido ou vazio.');
  }

  const config = getWhatsAppConfig();

  // If no external Evolution/Z-API configured or disabled, fallback to direct WhatsApp Web URL
  if (!config.apiUrl || !config.apiKey || config.apiUrl.includes('localhost') && !window.location.hostname.includes('localhost')) {
    const directUrl = buildDirectWhatsAppUrl(cleanPhone, message);
    return {
      success: true,
      mode: 'direct_link',
      directUrl,
      message,
      phone: cleanPhone,
    };
  }

  const endpoint = config.apiUrl.replace(/\/+$/, '') + '/messages/send';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      apikey: config.apiKey,
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      instanceId: config.instanceName || 'main',
      instance: config.instanceName || 'main',
      number: cleanPhone,
      phone: cleanPhone,
      message,
    }),
  });

  const data = await response.json().catch(() => ({ success: response.ok }));

  if (!response.ok || (data && data.success === false)) {
    const errorMsg = data?.error?.message || data?.message || `HTTP ${response.status}: Falha ao enviar notificação no WhatsApp`;
    throw new Error(errorMsg);
  }

  return {
    success: true,
    mode: 'api',
    data,
    message,
    phone: cleanPhone,
  };
}
