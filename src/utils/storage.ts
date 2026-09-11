import { 
  Shipment, 
  User, 
  UserDailyQuota, 
  WhatsAppTemplate, 
  WhatsAppLog, 
  UpsellConfig, 
  IntegrationConfig, 
  WidgetSettings,
  CarrierOperationalConfig, 
  TrackingStatus 
} from '../types';
import { generateTrackingCode, generateRealisticTimeline } from './generators';

const STORAGE_KEYS = {
  USERS: 'rastreio_users_v3',
  CURRENT_USER: 'rastreio_current_user_v3',
  QUOTAS: 'rastreio_daily_quotas_v3',
  SHIPMENTS: 'rastreio_shipments_v3',
  WHATSAPP_TEMPLATES: 'rastreio_whatsapp_templates_v3',
  WHATSAPP_LOGS: 'rastreio_whatsapp_logs_v3',
  UPSELL_CONFIG: 'rastreio_upsell_config_v3',
  INTEGRATIONS: 'rastreio_integrations_v3',
  WIDGET_SETTINGS: 'rastreio_widget_settings_v3',
};

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Administrador Master',
    email: 'admin@rastreioja.com',
    storeName: 'Central Master',
    role: 'admin',
    dailyLimit: 1000,
    isUnlimited: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_UPSELL_CONFIG: UpsellConfig = {
  enabled: true,
  bannerTitle: '🎉 Seu pedido está a caminho!',
  bannerSubtitle: 'Enquanto você aguarda a entrega, preparamos um presente exclusivo para você:',
  couponCode: 'RASTREIO15',
  couponDiscount: '15% DE DESCONTO',
  supportWhatsApp: '5511999998888',
  supportEmail: 'suporte@lojaexemplo.com.br',
  supportText: 'Precisa de ajuda com a sua entrega? Fale com nossa equipe pelo WhatsApp oficial.',
  products: [
    {
      id: 'prod-1',
      name: 'Smartwatch Ultra Series 9 Pro Max',
      originalPrice: 299.90,
      discountPrice: 149.90,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80',
      checkoutUrl: 'https://checkout.lojaexemplo.com.br/smartwatch',
      badge: '50% OFF - MAIS VENDIDO'
    },
    {
      id: 'prod-2',
      name: 'Fone Bluetooth Pro Cancelamento de Ruído',
      originalPrice: 189.00,
      discountPrice: 89.90,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
      checkoutUrl: 'https://checkout.lojaexemplo.com.br/fone',
      badge: 'COMPRE JUNTO'
    },
    {
      id: 'prod-3',
      name: 'Carregador Magnético Ultra Rápido 3 em 1',
      originalPrice: 149.90,
      discountPrice: 69.90,
      imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400&q=80',
      checkoutUrl: 'https://checkout.lojaexemplo.com.br/carregador',
      badge: 'FRETE GRÁTIS'
    }
  ]
};

const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tmpl-1',
    triggerStatus: 'posted',
    name: '📦 Objeto Postado',
    message: 'Olá {nome}! 👋 Seu pedido #{pedido} acabou de ser postado com sucesso. Acompanhe a entrega em tempo real por aqui: {link_rastreio}',
    enabled: true
  },
  {
    id: 'tmpl-2',
    triggerStatus: 'in_transit',
    name: '🚚 Em Trânsito',
    message: 'Boas notícias, {nome}! 🚚 O seu pacote ({codigo}) está a caminho do centro de distribuição da sua cidade. Link de rastreio: {link_rastreio}',
    enabled: true
  },
  {
    id: 'tmpl-3',
    triggerStatus: 'out_for_delivery',
    name: '🚨 Saiu para Entrega',
    message: 'Atenção {nome}! 🛵 O seu pedido #{pedido} SAIU PARA ENTREGA hoje! Por favor, certifique-se de que haverá alguém no local para receber.',
    enabled: true
  },
  {
    id: 'tmpl-4',
    triggerStatus: 'delivered',
    name: '✅ Entregue com Sucesso',
    message: 'Tudo certo, {nome}! 🎉 O seu pedido #{pedido} foi entregue com sucesso. Esperamos que ame o seu produto! Avalie sua experiência conosco no link: {link_rastreio}',
    enabled: true
  }
];

const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'int-shopify',
    platform: 'shopify',
    name: 'Shopify Store',
    enabled: true,
    webhookSecret: 'shpat_98a7sd8f7a6sd5f46a5s',
    webhookUrl: 'https://api.seudominio.com.br/v1/webhooks/shopify',
    totalOrdersSynced: 0
  },
  {
    id: 'int-yampi',
    platform: 'yampi',
    name: 'Yampi Checkout',
    enabled: true,
    webhookSecret: 'ymp_sec_876123456789',
    webhookUrl: 'https://api.seudominio.com.br/v1/webhooks/yampi',
    totalOrdersSynced: 0
  },
  {
    id: 'int-cartpanda',
    platform: 'cartpanda',
    name: 'CartPanda Store',
    enabled: false,
    webhookSecret: 'cp_live_0192837465',
    webhookUrl: 'https://api.seudominio.com.br/v1/webhooks/cartpanda',
    totalOrdersSynced: 0
  },
  {
    id: 'int-nuvemshop',
    platform: 'nuvemshop',
    name: 'Nuvemshop',
    enabled: true,
    webhookSecret: 'nvm_tok_654987321',
    webhookUrl: 'https://api.seudominio.com.br/v1/webhooks/nuvemshop',
    totalOrdersSynced: 0
  },
  {
    id: 'int-kiwify',
    platform: 'kiwify',
    name: 'Kiwify Produtos Físicos',
    enabled: true,
    webhookSecret: 'kwf_wh_7819234871',
    webhookUrl: 'https://api.seudominio.com.br/v1/webhooks/kiwify',
    totalOrdersSynced: 0
  }
];

const DEFAULT_CARRIER_CONFIG: CarrierOperationalConfig = {
  activeCarrier: 'loggi',
  originCity: 'Cajamar',
  originState: 'SP',
  deliveryDays: 15,
  isExtendedDelivery: true,
  showEstimatedDate: true,
  processingTime: '4h',
  deliveryAttempts: '1',
  finalOutcome: 'delivered'
};

const DEFAULT_WIDGET: WidgetSettings = {
  primaryColor: '#3b82f6',
  textColor: '#ffffff',
  backgroundColor: '#040711',
  borderRadius: 16,
  customTitle: 'Rastreie seu Pedido',
  customSubtitle: 'Digite o código de rastreio ou número do pedido para acompanhar a entrega.',
  placeholderText: 'Ex: NL123456789BR ou #1042',
  buttonText: 'Rastrear Encomenda',
  showSupportButton: true,
  supportWhatsApp: '5511999998888'
};

export const Storage = {
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  },

  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      // Check merchant session if available
      const sess = localStorage.getItem('rastreio_merchant_session');
      if (sess) {
        try {
          const parsed = JSON.parse(sess);
          const u: User = {
            id: parsed.id || `usr_${Date.now()}`,
            name: parsed.name || 'Lojista Oficial',
            email: parsed.email || 'lojista@exemplo.com',
            storeName: parsed.storeName || 'Minha Loja',
            role: 'merchant',
            dailyLimit: 100,
            isUnlimited: false,
            createdAt: new Date().toISOString()
          };
          this.setCurrentUser(u);
          return u;
        } catch {}
      }
      return DEFAULT_USERS[0];
    }
    return JSON.parse(raw);
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // Also add to users list if not exists
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex !== -1) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const current = this.getCurrentUser();
      if (current.id === updatedUser.id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      }
    }
  },

  // Daily Quota (100 codes per day default, reset at midnight, admin editable)
  getDailyQuota(userId: string): UserDailyQuota {
    const today = getTodayDateString();
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTAS);
    const quotas: Record<string, UserDailyQuota> = raw ? JSON.parse(raw) : {};
    
    const key = `${userId}_${today}`;
    const user = this.getUsers().find(u => u.id === userId) || this.getCurrentUser();
    
    if (!quotas[key]) {
      const newQuota: UserDailyQuota = {
        userId,
        date: today,
        used: 0, // Clean 0 usage for new users
        limit: user.dailyLimit || 100,
        isUnlimited: Boolean(user.isUnlimited)
      };
      quotas[key] = newQuota;
      localStorage.setItem(STORAGE_KEYS.QUOTAS, JSON.stringify(quotas));
      return newQuota;
    }
    
    quotas[key].limit = user.dailyLimit || 100;
    quotas[key].isUnlimited = Boolean(user.isUnlimited);
    return quotas[key];
  },

  consumeDailyQuota(userId: string, count: number = 1): { success: boolean; quota: UserDailyQuota; reason?: string } {
    const today = getTodayDateString();
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTAS);
    const quotas: Record<string, UserDailyQuota> = raw ? JSON.parse(raw) : {};
    
    const key = `${userId}_${today}`;
    const currentQuota = this.getDailyQuota(userId);

    if (!currentQuota.isUnlimited && currentQuota.used + count > currentQuota.limit) {
      return {
        success: false,
        quota: currentQuota,
        reason: `Limite diário atingido (${currentQuota.used}/${currentQuota.limit}). A cota zera à meia-noite.`
      };
    }

    currentQuota.used += count;
    quotas[key] = currentQuota;
    localStorage.setItem(STORAGE_KEYS.QUOTAS, JSON.stringify(quotas));

    return { success: true, quota: currentQuota };
  },

  resetDailyQuota(userId: string): UserDailyQuota {
    const today = getTodayDateString();
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTAS);
    const quotas: Record<string, UserDailyQuota> = raw ? JSON.parse(raw) : {};
    
    const key = `${userId}_${today}`;
    const user = this.getUsers().find(u => u.id === userId) || this.getCurrentUser();
    
    const resetQuota: UserDailyQuota = {
      userId,
      date: today,
      used: 0,
      limit: user.dailyLimit || 100,
      isUnlimited: Boolean(user.isUnlimited)
    };
    
    quotas[key] = resetQuota;
    localStorage.setItem(STORAGE_KEYS.QUOTAS, JSON.stringify(quotas));
    return resetQuota;
  },

  setAdminUserLimit(userId: string, newLimit: number, isUnlimited: boolean): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.dailyLimit = newLimit;
      user.isUnlimited = isUnlimited;
      this.updateUser(user);

      const today = getTodayDateString();
      const raw = localStorage.getItem(STORAGE_KEYS.QUOTAS);
      const quotas: Record<string, UserDailyQuota> = raw ? JSON.parse(raw) : {};
      const key = `${userId}_${today}`;
      if (quotas[key]) {
        quotas[key].limit = newLimit;
        quotas[key].isUnlimited = isUnlimited;
        localStorage.setItem(STORAGE_KEYS.QUOTAS, JSON.stringify(quotas));
      }
    }
  },

  // Shipments (Isolated per user)
  getShipments(userId?: string): Shipment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    if (!raw) return [];
    const list: (Shipment & { userId?: string })[] = JSON.parse(raw);
    if (userId) {
      return list.filter(s => s.userId === userId || !s.userId);
    }
    return list;
  },

  addShipment(shipment: Shipment, userId?: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    const list: any[] = raw ? JSON.parse(raw) : [];
    list.unshift({ ...shipment, userId: userId || 'default' });
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));
  },

  addBatchShipments(newShipments: Shipment[], userId?: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const tagged = newShipments.map(s => ({ ...s, userId: userId || 'default' }));
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify([...tagged, ...list]));
  },

  updateShipment(updated: Shipment): void {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((s: any) => s.id === updated.id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updated };
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));
    }
  },

  deleteShipment(id: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((s: any) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(filtered));
  },

  getShipmentByCode(code: string): Shipment | undefined {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    if (!raw) return undefined;
    const list: Shipment[] = JSON.parse(raw);
    const clean = code.trim().toUpperCase();
    return list.find(s => s.code.toUpperCase() === clean || s.orderNumber.toUpperCase() === clean);
  },

  // Upsell Config
  getUpsellConfig(): UpsellConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.UPSELL_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.UPSELL_CONFIG, JSON.stringify(DEFAULT_UPSELL_CONFIG));
      return DEFAULT_UPSELL_CONFIG;
    }
    return JSON.parse(raw);
  },

  saveUpsellConfig(config: UpsellConfig): void {
    localStorage.setItem(STORAGE_KEYS.UPSELL_CONFIG, JSON.stringify(config));
  },

  // WhatsApp
  getWhatsAppTemplates(): WhatsAppTemplate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WHATSAPP_TEMPLATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WHATSAPP_TEMPLATES, JSON.stringify(DEFAULT_WHATSAPP_TEMPLATES));
      return DEFAULT_WHATSAPP_TEMPLATES;
    }
    return JSON.parse(raw);
  },

  saveWhatsAppTemplates(templates: WhatsAppTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_TEMPLATES, JSON.stringify(templates));
  },

  getWhatsAppLogs(): WhatsAppLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WHATSAPP_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  },

  addWhatsAppLog(log: WhatsAppLog): void {
    const logs = this.getWhatsAppLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_LOGS, JSON.stringify(logs.slice(0, 100)));
  },

  // Integrations
  getIntegrations(): IntegrationConfig[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(DEFAULT_INTEGRATIONS));
      return DEFAULT_INTEGRATIONS;
    }
    return JSON.parse(raw);
  },

  saveIntegrations(integrations: IntegrationConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
  },

  // Widget Settings
  getWidgetSettings(): WidgetSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.WIDGET_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WIDGET_SETTINGS, JSON.stringify(DEFAULT_WIDGET));
      return DEFAULT_WIDGET;
    }
    return JSON.parse(raw);
  },

  saveWidgetSettings(settings: WidgetSettings): void {
    localStorage.setItem(STORAGE_KEYS.WIDGET_SETTINGS, JSON.stringify(settings));
  },

  // Carrier Operational Config
  getCarrierConfig(): CarrierOperationalConfig {
    const data = localStorage.getItem('rastreio_carrier_config');
    if (!data) return DEFAULT_CARRIER_CONFIG;
    try {
      return { ...DEFAULT_CARRIER_CONFIG, ...JSON.parse(data) };
    } catch {
      return DEFAULT_CARRIER_CONFIG;
    }
  },

  saveCarrierConfig(config: CarrierOperationalConfig): void {
    localStorage.setItem('rastreio_carrier_config', JSON.stringify(config));
  }
};
