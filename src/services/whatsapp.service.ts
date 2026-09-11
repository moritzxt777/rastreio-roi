// src/services/whatsapp.service.ts

const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:3000/api';
const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY || 'change-me';

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
  const trackingLink = customTrackingUrl || (typeof window !== 'undefined' ? window.location.origin + '/#tracking=' + trackingCode : 'https://rastreio-roi.vercel.app/#tracking=' + trackingCode);
  
  return templateMessage
    .replace(/{nome}/g, customerName.split(' ')[0] || customerName)
    .replace(/{pedido}/g, orderNumber)
    .replace(/{codigo}/g, trackingCode)
    .replace(/{link_rastreio}/g, trackingLink)
    .replace(/{produto}/g, productName);
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
  // Formata o texto substituindo as variaveis dinamicas
  const message = formatWhatsAppMessage({
    customerName,
    orderNumber,
    trackingCode,
    productName,
    templateMessage,
    customTrackingUrl,
  });

  // Limpa o numero de telefone removendo caracteres nao numericos
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    const response = await fetch(WHATSAPP_API_URL + '/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': WHATSAPP_API_KEY,
      },
      body: JSON.stringify({
        instanceId: 'main',
        phone: cleanPhone,
        message: message,
      }),
    });

    const data = await response.json().catch(() => ({ success: response.ok }));

    if (!response.ok || (data && data.success === false)) {
      const errorMsg = data?.error?.message || data?.message || ('HTTP ' + response.status + ': Falha ao enviar notificacao no WhatsApp');
      throw new Error(errorMsg);
    }

    return {
      success: true,
      data,
      message,
      phone: cleanPhone,
    };
  } catch (error: any) {
    console.warn('[WhatsApp Service] Aviso ao enviar mensagem:', error.message || error);
    throw error;
  }
}
