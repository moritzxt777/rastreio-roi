export type CarrierType = 'correios' | 'loggi' | 'jadlog' | 'total_express' | 'kangu' | 'cainiao';

export type TrackingStatus = 
  | 'posted'              // Objeto Postado
  | 'in_transit'          // Em Trânsito
  | 'out_for_delivery'    // Saiu para Entrega
  | 'delivery_attempt'    // Tentativa de Entrega
  | 'waiting_pickup'      // Aguardando Retirada
  | 'delivered'           // Entregue
  | 'returned';           // Devolvido ao Remetente

export interface TrackingEvent {
  id: string;
  status: TrackingStatus;
  title: string;
  description: string;
  location: string;
  date: string; // ISO string or formatted
  time: string;
  icon?: string;
}

export interface Shipment {
  id: string;
  code: string;
  carrier: CarrierType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerDocument?: string;
  orderNumber: string;
  orderValue: number;
  productName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  status: TrackingStatus;
  events: TrackingEvent[];
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  whatsappNotified: boolean;
  emailNotified: boolean;
  upsellClicks: number;
  upsellConversions: number;
}

export interface UserDailyQuota {
  userId: string;
  date: string; // YYYY-MM-DD
  used: number;
  limit: number; // default 100
  isUnlimited: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  storeName: string;
  role: 'admin' | 'merchant';
  dailyLimit: number; // 100 by default, customisable by admin
  isUnlimited: boolean;
  createdAt: string;
}

export interface WhatsAppInstance {
  id: string;
  name: string;
  provider: 'evolution' | 'zapi' | 'baileys' | 'cloud_api';
  status: 'connected' | 'disconnected' | 'connecting';
  phone?: string;
  apiUrl?: string;
  apiKey?: string;
}

export interface WhatsAppTemplate {
  id: string;
  triggerStatus: TrackingStatus;
  name: string;
  message: string;
  enabled: boolean;
}

export interface WhatsAppLog {
  id: string;
  shipmentId: string;
  customerName: string;
  customerPhone: string;
  trackingCode: string;
  status: 'sent' | 'failed' | 'pending';
  triggerStatus: TrackingStatus;
  message: string;
  timestamp: string;
}

export interface UpsellProduct {
  id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  imageUrl: string;
  checkoutUrl: string;
  badge?: string;
}

export interface UpsellConfig {
  enabled: boolean;
  bannerTitle: string;
  bannerSubtitle: string;
  couponCode: string;
  couponDiscount: string;
  supportWhatsApp: string;
  customTrackingDomain?: string;
  supportEmail: string;
  supportText: string;
  products: UpsellProduct[];
}

export interface IntegrationConfig {
  id: string;
  platform: 'shopify' | 'yampi' | 'cartpanda' | 'nuvemshop' | 'woocommerce' | 'kiwify' | 'hotmart' | 'braip' | 'appmax';
  name: string;
  enabled: boolean;
  webhookSecret: string;
  webhookUrl: string;
  totalOrdersSynced: number;
  lastSyncAt?: string;
}

export interface WidgetSettings {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  customTitle: string;
  customSubtitle: string;
  placeholderText: string;
  buttonText: string;
  showSupportButton: boolean;
  supportWhatsApp: string;
  customTrackingDomain?: string;
}
