import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserDailyQuota, 
  Shipment, 
  WhatsAppTemplate, 
  WhatsAppLog, 
  UpsellConfig, 
  IntegrationConfig, 
  WidgetSettings,
  CarrierType,
  TrackingStatus
} from '../types';
import { Storage } from '../utils/storage';
import { generateTrackingCode, generateRealisticTimeline } from '../utils/generators';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface CreateShipmentInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderNumber: string;
  orderValue: number;
  productName: string;
  carrier: CarrierType;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  status?: TrackingStatus;
}

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  dailyQuota: UserDailyQuota;
  shipments: Shipment[];
  whatsappTemplates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppLog[];
  upsellConfig: UpsellConfig;
  integrations: IntegrationConfig[];
  widgetSettings: WidgetSettings;
  
  // Actions
  loginMerchant: (userData: { id?: string; name: string; email: string; storeName: string }) => void;
  logoutMerchant: () => void;
  openPublicTracking: (code: string) => void;
  createSingleShipment: (data: CreateShipmentInput) => { success: boolean; shipment?: Shipment; error?: string };
  createBatchShipments: (items: CreateShipmentInput[]) => { success: boolean; count: number; error?: string };
  updateShipmentStatus: (id: string, status: TrackingStatus) => void;
  deleteShipment: (id: string) => void;
  updateUpsellConfig: (config: UpsellConfig) => void;
  updateWhatsAppTemplates: (templates: WhatsAppTemplate[]) => void;
  sendWhatsAppNotification: (shipment: Shipment, status: TrackingStatus) => void;
  updateIntegrations: (integrations: IntegrationConfig[]) => void;
  updateWidgetSettings: (settings: WidgetSettings) => void;
  recordUpsellClick: (shipmentId: string) => void;
  recordUpsellConversion: (shipmentId: string) => void;
  
  // Admin Actions
  adminSetUserLimit: (userId: string, newLimit: number, isUnlimited: boolean) => void;
  adminResetQuota: (userId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => Storage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => Storage.getUsers());
  const [dailyQuota, setDailyQuota] = useState<UserDailyQuota>(() => Storage.getDailyQuota(currentUser.id));
  const [shipments, setShipments] = useState<Shipment[]>(() => Storage.getShipments(currentUser.id));
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>(() => Storage.getWhatsAppTemplates());
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>(() => Storage.getWhatsAppLogs());
  const [upsellConfig, setUpsellConfig] = useState<UpsellConfig>(() => Storage.getUpsellConfig());
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(() => Storage.getIntegrations());
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(() => Storage.getWidgetSettings());

  // Listen to Supabase Auth state or local session
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // 1. Initial session check
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          const u = data.session.user;
          const metaName = u.user_metadata?.full_name || u.user_metadata?.name || u.user_metadata?.user_name || u.user_metadata?.custom_claims?.global_name;
          const store = u.user_metadata?.store_name || (metaName ? `Loja de ${metaName}` : 'Minha Loja Drop');
          const userObj: User = {
            id: u.id,
            name: metaName || u.email?.split('@')[0] || 'Lojista Oficial',
            email: u.email || 'lojista@rastreio.roi',
            storeName: store,
            role: (u.user_metadata?.role as any) || 'merchant',
            dailyLimit: 100,
            isUnlimited: false,
            createdAt: u.created_at
          };
          Storage.setCurrentUser(userObj);
          setCurrentUser(userObj);
          setDailyQuota(Storage.getDailyQuota(userObj.id));
          setShipments(Storage.getShipments(userObj.id));
          localStorage.setItem('rastreio_merchant_session', JSON.stringify({
            authenticated: true,
            email: userObj.email,
            name: userObj.name,
            storeName: userObj.storeName
          }));
        }
      });

      // 2. Realtime auth change listener (for Discord / OAuth logins)
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const metaName = u.user_metadata?.full_name || u.user_metadata?.name || u.user_metadata?.user_name || u.user_metadata?.custom_claims?.global_name;
          const store = u.user_metadata?.store_name || (metaName ? `Loja de ${metaName}` : 'Minha Loja Drop');
          const userObj: User = {
            id: u.id,
            name: metaName || u.email?.split('@')[0] || 'Lojista Oficial',
            email: u.email || 'lojista@rastreio.roi',
            storeName: store,
            role: (u.user_metadata?.role as any) || 'merchant',
            dailyLimit: 100,
            isUnlimited: false,
            createdAt: u.created_at
          };
          Storage.setCurrentUser(userObj);
          setCurrentUser(userObj);
          setDailyQuota(Storage.getDailyQuota(userObj.id));
          setShipments(Storage.getShipments(userObj.id));
          localStorage.setItem('rastreio_merchant_session', JSON.stringify({
            authenticated: true,
            email: userObj.email,
            name: userObj.name,
            storeName: userObj.storeName
          }));
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    } else {
      const sess = localStorage.getItem('rastreio_merchant_session');
      if (sess) {
        try {
          const parsed = JSON.parse(sess);
          if (parsed.email && parsed.email !== currentUser.email) {
            loginMerchant(parsed);
          }
        } catch {}
      }
    }
  }, []);

  const loginMerchant = (userData: { id?: string; name: string; email: string; storeName: string }) => {
    const userObj: User = {
      id: userData.id || `usr_${Date.now()}`,
      name: userData.name || 'Lojista Oficial',
      email: userData.email,
      storeName: userData.storeName || 'Minha Loja Drop',
      role: 'merchant',
      dailyLimit: 100,
      isUnlimited: false,
      createdAt: new Date().toISOString()
    };

    Storage.setCurrentUser(userObj);
    setCurrentUser(userObj);
    setDailyQuota(Storage.getDailyQuota(userObj.id));
    setShipments(Storage.getShipments(userObj.id));
    setAllUsers(Storage.getUsers());
  };

  const logoutMerchant = () => {
    localStorage.removeItem('rastreio_merchant_session');
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
  };

  const createSingleShipment = (data: CreateShipmentInput) => {
    const quotaResult = Storage.consumeDailyQuota(currentUser.id, 1);
    if (!quotaResult.success) {
      return { success: false, error: quotaResult.reason };
    }
    
    setDailyQuota(quotaResult.quota);

    const initialStatus = data.status || 'posted';
    const code = generateTrackingCode(data.carrier);
    const events = generateRealisticTimeline(
      data.carrier, 
      data.originCity, 
      data.originState, 
      data.destinationCity, 
      data.destinationState, 
      initialStatus
    );

    const newShipment: Shipment = {
      id: `ship_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      code,
      carrier: data.carrier,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      orderNumber: data.orderNumber,
      orderValue: data.orderValue || 99.90,
      productName: data.productName,
      originCity: data.originCity,
      originState: data.originState,
      destinationCity: data.destinationCity,
      destinationState: data.destinationState,
      destinationZip: data.destinationZip,
      status: initialStatus,
      events,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      whatsappNotified: false,
      emailNotified: false,
      upsellClicks: 0,
      upsellConversions: 0
    };

    Storage.addShipment(newShipment, currentUser.id);
    setShipments(Storage.getShipments(currentUser.id));

    sendWhatsAppNotification(newShipment, initialStatus);

    return { success: true, shipment: newShipment };
  };

  const createBatchShipments = (items: CreateShipmentInput[]) => {
    const count = items.length;
    if (count === 0) return { success: false, count: 0, error: 'Nenhum pedido na lista' };

    const quotaResult = Storage.consumeDailyQuota(currentUser.id, count);
    if (!quotaResult.success) {
      return { success: false, count: 0, error: quotaResult.reason };
    }

    setDailyQuota(quotaResult.quota);

    const newBatch: Shipment[] = items.map((data, idx) => {
      const code = generateTrackingCode(data.carrier);
      const initialStatus = data.status || 'posted';
      const events = generateRealisticTimeline(
        data.carrier, 
        data.originCity, 
        data.originState, 
        data.destinationCity, 
        data.destinationState, 
        initialStatus
      );

      return {
        id: `ship_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
        code,
        carrier: data.carrier,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        orderNumber: data.orderNumber,
        orderValue: data.orderValue || 129.90,
        productName: data.productName,
        originCity: data.originCity,
        originState: data.originState,
        destinationCity: data.destinationCity,
        destinationState: data.destinationState,
        destinationZip: data.destinationZip,
        status: initialStatus,
        events,
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        whatsappNotified: false,
        emailNotified: false,
        upsellClicks: 0,
        upsellConversions: 0
      };
    });

    Storage.addBatchShipments(newBatch, currentUser.id);
    setShipments(Storage.getShipments(currentUser.id));

    return { success: true, count };
  };

  const updateShipmentStatus = (id: string, status: TrackingStatus) => {
    const target = shipments.find(s => s.id === id);
    if (!target) return;

    const newEvents = generateRealisticTimeline(
      target.carrier,
      target.originCity,
      target.originState,
      target.destinationCity,
      target.destinationState,
      status
    );

    const updated: Shipment = {
      ...target,
      status,
      events: newEvents,
      updatedAt: new Date().toISOString()
    };

    Storage.updateShipment(updated);
    setShipments(Storage.getShipments(currentUser.id));

    sendWhatsAppNotification(updated, status);
  };

  const deleteShipment = (id: string) => {
    Storage.deleteShipment(id);
    setShipments(Storage.getShipments(currentUser.id));
  };

  const sendWhatsAppNotification = (shipment: Shipment, status: TrackingStatus) => {
    const tmpl = whatsappTemplates.find(t => t.triggerStatus === status && t.enabled);
    if (!tmpl) return;

    const trackingLink = `${window.location.origin}/r/${shipment.code}`;
    let msg = tmpl.message
      .replace(/{nome}/g, shipment.customerName.split(' ')[0])
      .replace(/{pedido}/g, shipment.orderNumber)
      .replace(/{codigo}/g, shipment.code)
      .replace(/{link_rastreio}/g, trackingLink)
      .replace(/{produto}/g, shipment.productName);

    const log: WhatsAppLog = {
      id: `wlog_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      shipmentId: shipment.id,
      customerName: shipment.customerName,
      customerPhone: shipment.customerPhone,
      trackingCode: shipment.code,
      status: 'sent',
      triggerStatus: status,
      message: msg,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    Storage.addWhatsAppLog(log);
    setWhatsappLogs(Storage.getWhatsAppLogs());

    if (!shipment.whatsappNotified) {
      const updated = { ...shipment, whatsappNotified: true };
      Storage.updateShipment(updated);
      setShipments(Storage.getShipments(currentUser.id));
    }
  };

  const updateUpsellConfig = (config: UpsellConfig) => {
    Storage.saveUpsellConfig(config);
    setUpsellConfig(config);
  };

  const updateWhatsAppTemplates = (templates: WhatsAppTemplate[]) => {
    Storage.saveWhatsAppTemplates(templates);
    setWhatsappTemplates(templates);
  };

  const updateIntegrations = (newList: IntegrationConfig[]) => {
    Storage.saveIntegrations(newList);
    setIntegrations(newList);
  };

  const updateWidgetSettings = (settings: WidgetSettings) => {
    Storage.saveWidgetSettings(settings);
    setWidgetSettings(settings);
  };

  const recordUpsellClick = (shipmentId: string) => {
    const s = shipments.find(item => item.id === shipmentId);
    if (s) {
      s.upsellClicks = (s.upsellClicks || 0) + 1;
      Storage.updateShipment(s);
      setShipments(Storage.getShipments(currentUser.id));
    }
  };

  const recordUpsellConversion = (shipmentId: string) => {
    const s = shipments.find(item => item.id === shipmentId);
    if (s) {
      s.upsellConversions = (s.upsellConversions || 0) + 1;
      Storage.updateShipment(s);
      setShipments(Storage.getShipments(currentUser.id));
    }
  };

  const adminSetUserLimit = (userId: string, newLimit: number, isUnlimited: boolean) => {
    Storage.setAdminUserLimit(userId, newLimit, isUnlimited);
    const updatedUsers = Storage.getUsers();
    setAllUsers(updatedUsers);
    
    if (currentUser.id === userId) {
      const u = updatedUsers.find(x => x.id === userId);
      if (u) setCurrentUser(u);
    }
    setDailyQuota(Storage.getDailyQuota(currentUser.id));
  };

  const adminResetQuota = (userId: string) => {
    const reset = Storage.resetDailyQuota(userId);
    if (currentUser.id === userId) {
      setDailyQuota(reset);
    }
  };

  const openPublicTracking = (code: string) => {
    window.open(`/r/${code}`, '_blank');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      allUsers,
      dailyQuota,
      shipments,
      whatsappTemplates,
      whatsappLogs,
      upsellConfig,
      integrations,
      widgetSettings,
      loginMerchant,
      logoutMerchant,
      openPublicTracking,
      createSingleShipment,
      createBatchShipments,
      updateShipmentStatus,
      deleteShipment,
      updateUpsellConfig,
      updateWhatsAppTemplates,
      sendWhatsAppNotification,
      updateIntegrations,
      updateWidgetSettings,
      recordUpsellClick,
      recordUpsellConversion,
      adminSetUserLimit,
      adminResetQuota
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
