import { Shipment, User, UserDailyQuota, WhatsAppTemplate, WhatsAppLog, UpsellConfig, IntegrationConfig, WidgetSettings, TrackingStatus } from '../types';
import { generateTrackingCode, generateRealisticTimeline } from './generators';

const STORAGE_KEYS = {
  USERS: 'rastreio_users_v2',
  CURRENT_USER: 'rastreio_current_user_v2',
  QUOTAS: 'rastreio_daily_quotas_v2',
  SHIPMENTS: 'rastreio_shipments_v2',
  WHATSAPP_INSTANCES: 'rastreio_whatsapp_instances_v2',
  WHATSAPP_TEMPLATES: 'rastreio_whatsapp_templates_v2',
  WHATSAPP_LOGS: 'rastreio_whatsapp_logs_v2',
  UPSELL_CONFIG: 'rastreio_upsell_config_v2',
  INTEGRATIONS: 'rastreio_integrations_v2',
  WIDGET_SETTINGS: 'rastreio_widget_settings_v2',
};

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Initial Mock Seed Data
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
  },
  {
    id: 'usr_merchant_1',
    name: 'Yude Store Oficial',
    email: 'contato@yudestore.com.br',
    storeName: 'Yude Drop Store',
    role: 'merchant',
    dailyLimit: 100, // standard default 100 per day!
    isUnlimited: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_merchant_2',
    name: 'Top Imports Brasil',
    email: 'comercial@topimports.com',
    storeName: 'Top Imports',
    role: 'merchant',
    dailyLimit: 250, // modified by admin
    isUnlimited: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
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
    totalOrdersSynced: 1284,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'int-yampi',
    platform: 'yampi',
    name: 'Yampi Checkout',
    enabled: true,
    webhookSecret: 'ymp_sec_876123456789',
    webhookUrl: 'https://api.seudominio.com.br/v1/webhooks/yampi',
    totalOrdersSynced: 593,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
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
    totalOrdersSynced: 340,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 'int-kiwify',
    platform: 'kiwify',
    name: 'Kiwify Produtos Físicos',
    enabled: true,
    webhookSecret: 'kwf_wh_7819234871',
    webhookUrl: 'https://api.seudominio.com.br/v1/webhooks/kiwify',
    totalOrdersSynced: 87,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  }
];

const DEFAULT_WIDGET: WidgetSettings = {
  primaryColor: '#10b981',
  textColor: '#ffffff',
  backgroundColor: '#0f172a',
  borderRadius: 12,
  customTitle: 'Rastreie seu Pedido',
  customSubtitle: 'Digite o código de rastreio ou número do pedido para acompanhar a entrega.',
  placeholderText: 'Ex: NL123456789BR ou #1042',
  buttonText: 'Rastrear Encomenda',
  showSupportButton: true,
  supportWhatsApp: '5511999998888'
};

// Seed Mock Shipments
function generateSeedShipments(): Shipment[] {
  const seedNames = [
    { name: 'Lucas Gabriel Silveira', city: 'São Paulo', state: 'SP', prod: 'Smartwatch Ultra Series 9', val: 199.90 },
    { name: 'Fernanda Caroline Costa', city: 'Belo Horizonte', state: 'MG', prod: 'Kit 3 Camisetas Premium Dry', val: 147.00 },
    { name: 'Rodrigo Medeiros Souza', city: 'Curitiba', state: 'PR', prod: 'Fone Bluetooth Pro TWS', val: 129.50 },
    { name: 'Mariana Lima Rocha', city: 'Rio de Janeiro', state: 'RJ', prod: 'Suporte Articulado Ergonômico', val: 89.90 },
    { name: 'Thiago Henrique Oliveira', city: 'Campinas', state: 'SP', prod: 'Carregador por Indução 15W', val: 79.90 },
    { name: 'Camila Beatriz Ferreira', city: 'Porto Alegre', state: 'RS', prod: 'Mini Projetor Portátil Full HD', val: 389.00 },
    { name: 'Gabriel Santana Castro', city: 'Salvador', state: 'BA', prod: 'Mochila Antifurto Impermeável', val: 159.00 },
  ];

  return seedNames.map((item, idx) => {
    const carrier = idx % 2 === 0 ? 'correios' : idx % 3 === 0 ? 'loggi' : 'jadlog';
    const code = generateTrackingCode(carrier);
    const statuses: TrackingStatus[] = ['in_transit', 'out_for_delivery', 'posted', 'delivered', 'in_transit', 'posted', 'delivered'];
    const status = statuses[idx % statuses.length];
    
    return {
      id: `ship-${idx + 1}`,
      code,
      carrier,
      customerName: item.name,
      customerPhone: `1198765432${idx}`,
      customerEmail: `${item.name.toLowerCase().split(' ')[0]}@gmail.com`,
      orderNumber: `${10800 + idx}`,
      orderValue: item.val,
      productName: item.prod,
      originCity: 'Cajamar',
      originState: 'SP',
      destinationCity: item.city,
      destinationState: item.state,
      destinationZip: '01001-000',
      status,
      events: generateRealisticTimeline(carrier, 'Cajamar', 'SP', item.city, item.state, status),
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * (4 - (idx % 3))).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000 * (idx + 1)).toISOString(),
      updatedAt: new Date().toISOString(),
      whatsappNotified: idx % 2 === 0,
      emailNotified: true,
      upsellClicks: Math.floor(Math.random() * 8) + 1,
      upsellConversions: idx % 3 === 0 ? 1 : 0
    };
  });
}

// STORAGE GETTERS / SETTERS
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
      const users = this.getUsers();
      const defaultUser = users[1]; // merchant user by default
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const current = this.getCurrentUser();
      if (current.id === updatedUser.id) {
        this.setCurrentUser(updatedUser);
      }
    }
  },

  // Daily Quota logic (100 codes per day default, reset at midnight, admin editable)
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
        used: 14, // seed initial usage for realistic demo
        limit: user.dailyLimit || 100,
        isUnlimited: !!user.isUnlimited
      };
      quotas[key] = newQuota;
      localStorage.setItem(STORAGE_KEYS.QUOTAS, JSON.stringify(quotas));
      return newQuota;
    }
    
    // Sync limit with user setting if changed by admin
    quotas[key].limit = user.dailyLimit || 100;
    quotas[key].isUnlimited = !!user.isUnlimited;
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
        reason: `Limite diário atingido (${currentQuota.used}/${currentQuota.limit}). A cota zera automaticamente à meia-noite ou solicite aumento ao administrador.`
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
      isUnlimited: !!user.isUnlimited
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

      // Also update today's quota object
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

  // Shipments
  getShipments(): Shipment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    if (!raw) {
      const initial = generateSeedShipments();
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  },

  addShipment(shipment: Shipment): void {
    const list = this.getShipments();
    list.unshift(shipment);
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));
  },

  addBatchShipments(newShipments: Shipment[]): void {
    const list = this.getShipments();
    const updated = [...newShipments, ...list];
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updated));
  },

  updateShipment(updated: Shipment): void {
    const list = this.getShipments();
    const index = list.findIndex(s => s.id === updated.id);
    if (index !== -1) {
      list[index] = updated;
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));
    }
  },

  deleteShipment(id: string): void {
    const list = this.getShipments().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));
  },

  getShipmentByCode(code: string): Shipment | undefined {
    const list = this.getShipments();
    const cleanCode = code.trim().toUpperCase();
    return list.find(s => s.code.toUpperCase() === cleanCode || s.orderNumber === cleanCode);
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
    if (!raw) {
      const seedLogs: WhatsAppLog[] = [
        {
          id: 'log-1',
          shipmentId: 'ship-1',
          customerName: 'Lucas Gabriel Silveira',
          customerPhone: '11987654320',
          trackingCode: 'NL192837465BR',
          status: 'sent',
          triggerStatus: 'posted',
          message: 'Olá Lucas! 👋 Seu pedido #10800 acabou de ser postado com sucesso.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString('pt-BR')
        },
        {
          id: 'log-2',
          shipmentId: 'ship-2',
          customerName: 'Fernanda Caroline Costa',
          customerPhone: '11987654321',
          trackingCode: 'LG9928172635BR',
          status: 'sent',
          triggerStatus: 'out_for_delivery',
          message: 'Atenção Fernanda! 🛵 O seu pedido #10801 SAIU PARA ENTREGA hoje!',
          timestamp: new Date(Date.now() - 1000 * 60 * 95).toLocaleTimeString('pt-BR')
        }
      ];
      localStorage.setItem(STORAGE_KEYS.WHATSAPP_LOGS, JSON.stringify(seedLogs));
      return seedLogs;
    }
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
  }
};
