import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { TrackingGeneratorView } from './components/generator/TrackingGeneratorView';
import { OrdersView } from './components/orders/OrdersView';
import { UpsellSettingsView } from './components/tracking/UpsellSettingsView';
import { PublicTrackingView } from './components/tracking/PublicTrackingView';
import { JadlogPortalView } from './components/portals/JadlogPortalView';
import { LoggiPortalView } from './components/portals/LoggiPortalView';
import { CorreiosPortalView } from './components/portals/CorreiosPortalView';
import { CainiaoPortalView } from './components/portals/CainiaoPortalView';
import { DhlPortalView } from './components/portals/DhlPortalView';
import { TotalExpressPortalView } from './components/portals/TotalExpressPortalView';
import { WhatsAppView } from './components/whatsapp/WhatsAppView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { ShippingToolsView } from './components/shipping/ShippingToolsView';
import { WidgetView } from './components/widget/WidgetView';
import { CarriersView } from './components/carriers/CarriersView';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminMasterView } from './components/admin/AdminMasterView';
import { RequireMerchant, RequireAdmin } from './components/auth/AuthGuard';

// Merchant Layout
const MerchantLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <Navbar onNavigate={(path) => navigate(`/${path}`)} activeView={currentPath} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={currentPath} onNavigate={(path) => navigate(`/${path}`)} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

const getHostType = (): 'loggi' | 'jadlog' | 'correios' | 'cainiao' | 'dhl' | 'total_express' | 'default' => {
  if (typeof window === 'undefined') return 'default';
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('loggi')) return 'loggi';
  if (hostname.includes('jadlog') || hostname.includes('jadxlog')) return 'jadlog';
  if (hostname.includes('correio') || hostname.includes('sro')) return 'correios';
  if (hostname.includes('cainiao') || hostname.includes('ali') || hostname.includes('global')) return 'cainiao';
  if (hostname.includes('dhl')) return 'dhl';
  if (hostname.includes('total') || hostname.includes('tex')) return 'total_express';
  return 'default';
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  const hostType = getHostType();

  // Multi-Domain: Loggi Portal Domain (e.g. rastreio-loggi.vercel.app / loggi-transportadora.site)
  if (hostType === 'loggi') {
    return (
      <Routes>
        <Route path="/" element={<LoggiPortalView />} />
        <Route path="/home" element={<LoggiPortalView />} />
        <Route path="/rastreamento" element={<LoggiPortalView />} />
        <Route path="/rastreamento/:code" element={<LoggiPortalView />} />
        <Route path="/r/:code" element={<LoggiPortalView />} />
        <Route path="/:code" element={<LoggiPortalView />} />
      </Routes>
    );
  }

  // Multi-Domain: Jadlog Portal Domain (e.g. jadlog-rastreamento.vercel.app / jadxlog.site)
  if (hostType === 'jadlog') {
    return (
      <Routes>
        <Route path="/" element={<JadlogPortalView />} />
        <Route path="/home" element={<JadlogPortalView />} />
        <Route path="/jadlog/home" element={<JadlogPortalView />} />
        <Route path="/rastreamento" element={<JadlogPortalView />} />
        <Route path="/rastreamento/:code" element={<JadlogPortalView />} />
        <Route path="/r/:code" element={<JadlogPortalView />} />
        <Route path="/:code" element={<JadlogPortalView />} />
      </Routes>
    );
  }

  // Multi-Domain: Correios SRO Portal Domain (e.g. rastreio-correios.vercel.app / correios-sro.site)
  if (hostType === 'correios') {
    return (
      <Routes>
        <Route path="/" element={<CorreiosPortalView />} />
        <Route path="/home" element={<CorreiosPortalView />} />
        <Route path="/correios/home" element={<CorreiosPortalView />} />
        <Route path="/rastreamento" element={<CorreiosPortalView />} />
        <Route path="/rastreamento/:code" element={<CorreiosPortalView />} />
        <Route path="/r/:code" element={<CorreiosPortalView />} />
        <Route path="/:code" element={<CorreiosPortalView />} />
      </Routes>
    );
  }

  // Multi-Domain: Cainiao Global Portal Domain (e.g. cainiao-rastreamento.vercel.app / global-cainiao.site)
  if (hostType === 'cainiao') {
    return (
      <Routes>
        <Route path="/" element={<CainiaoPortalView />} />
        <Route path="/home" element={<CainiaoPortalView />} />
        <Route path="/cainiao/home" element={<CainiaoPortalView />} />
        <Route path="/rastreamento" element={<CainiaoPortalView />} />
        <Route path="/rastreamento/:code" element={<CainiaoPortalView />} />
        <Route path="/r/:code" element={<CainiaoPortalView />} />
        <Route path="/:code" element={<CainiaoPortalView />} />
      </Routes>
    );
  }

  // Multi-Domain: DHL Express Worldwide Portal Domain (e.g. dhl-rastreio.vercel.app / dhl-express.site)
  if (hostType === 'dhl') {
    return (
      <Routes>
        <Route path="/" element={<DhlPortalView />} />
        <Route path="/home" element={<DhlPortalView />} />
        <Route path="/dhl/home" element={<DhlPortalView />} />
        <Route path="/rastreamento" element={<DhlPortalView />} />
        <Route path="/rastreamento/:code" element={<DhlPortalView />} />
        <Route path="/r/:code" element={<DhlPortalView />} />
        <Route path="/:code" element={<DhlPortalView />} />
      </Routes>
    );
  }

  // Multi-Domain: Total Express Portal Domain (e.g. totalexpress-rastreio.vercel.app)
  if (hostType === 'total_express') {
    return (
      <Routes>
        <Route path="/" element={<TotalExpressPortalView />} />
        <Route path="/home" element={<TotalExpressPortalView />} />
        <Route path="/totalexpress/home" element={<TotalExpressPortalView />} />
        <Route path="/rastreamento" element={<TotalExpressPortalView />} />
        <Route path="/rastreamento/:code" element={<TotalExpressPortalView />} />
        <Route path="/r/:code" element={<TotalExpressPortalView />} />
        <Route path="/:code" element={<TotalExpressPortalView />} />
      </Routes>
    );
  }

  // Main Domain: SaaS Landing Page + Merchant Dashboard + Full Routing
  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/register" element={<LandingPage />} />

      {/* 2.1 Cloned Carrier Tracking Portals (Nacionais & Gringas) */}
      <Route path="/jadlog" element={<JadlogPortalView />} />
      <Route path="/jadlog/home" element={<JadlogPortalView />} />
      <Route path="/jadlog/rastreamento" element={<JadlogPortalView />} />
      <Route path="/jadlog/rastreamento/:code" element={<JadlogPortalView />} />
      <Route path="/jadlog/:code" element={<JadlogPortalView />} />

      <Route path="/loggi" element={<LoggiPortalView />} />
      <Route path="/loggi/home" element={<LoggiPortalView />} />
      <Route path="/loggi/rastreamento" element={<LoggiPortalView />} />
      <Route path="/loggi/rastreamento/:code" element={<LoggiPortalView />} />
      <Route path="/loggi/:code" element={<LoggiPortalView />} />

      <Route path="/correios" element={<CorreiosPortalView />} />
      <Route path="/correios/home" element={<CorreiosPortalView />} />
      <Route path="/correios/rastreamento" element={<CorreiosPortalView />} />
      <Route path="/correios/rastreamento/:code" element={<CorreiosPortalView />} />
      <Route path="/correios/:code" element={<CorreiosPortalView />} />

      <Route path="/cainiao" element={<CainiaoPortalView />} />
      <Route path="/cainiao/home" element={<CainiaoPortalView />} />
      <Route path="/cainiao/rastreamento" element={<CainiaoPortalView />} />
      <Route path="/cainiao/rastreamento/:code" element={<CainiaoPortalView />} />
      <Route path="/cainiao/:code" element={<CainiaoPortalView />} />

      <Route path="/dhl" element={<DhlPortalView />} />
      <Route path="/dhl/home" element={<DhlPortalView />} />
      <Route path="/dhl/rastreamento" element={<DhlPortalView />} />
      <Route path="/dhl/rastreamento/:code" element={<DhlPortalView />} />
      <Route path="/dhl/:code" element={<DhlPortalView />} />

      <Route path="/totalexpress" element={<TotalExpressPortalView />} />
      <Route path="/totalexpress/home" element={<TotalExpressPortalView />} />
      <Route path="/totalexpress/rastreamento" element={<TotalExpressPortalView />} />
      <Route path="/totalexpress/rastreamento/:code" element={<TotalExpressPortalView />} />
      <Route path="/totalexpress/:code" element={<TotalExpressPortalView />} />

      {/* 2. Public Tracking Routes (Auto-Detected by Carrier) */}
      <Route path="/r/:code" element={<PublicTrackingView />} />
      <Route path="/r" element={<PublicTrackingView />} />
      <Route path="/rastreio/:code" element={<PublicTrackingView />} />
      <Route path="/rastreio" element={<PublicTrackingView />} />
      <Route path="/rastreamento/:code" element={<PublicTrackingView />} />
      <Route path="/rastreamento" element={<PublicTrackingView />} />
      <Route path="/tracking/:code" element={<PublicTrackingView />} />
      <Route path="/tracking" element={<PublicTrackingView />} />

      {/* 3. Dedicated Admin Routes (Protected by RequireAdmin) */}
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin-master" element={
        <RequireAdmin>
          <AdminMasterView />
        </RequireAdmin>
      } />
      <Route path="/admin" element={<Navigate to="/admin-login" replace />} />

      {/* 4. Protected Merchant Dashboard Routes (RequireMerchant) */}
      <Route path="/dashboard" element={
        <RequireMerchant>
          <MerchantLayout><DashboardView onNavigate={(p) => navigate(`/${p}`)} /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/generator" element={
        <RequireMerchant>
          <MerchantLayout><TrackingGeneratorView onNavigate={(p) => navigate(`/${p}`)} /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/orders" element={
        <RequireMerchant>
          <MerchantLayout><OrdersView onNavigate={(p) => navigate(`/${p}`)} /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/upsell" element={
        <RequireMerchant>
          <MerchantLayout><UpsellSettingsView onNavigate={(p) => navigate(`/${p}`)} /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/whatsapp" element={
        <RequireMerchant>
          <MerchantLayout><WhatsAppView /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/integrations" element={
        <RequireMerchant>
          <MerchantLayout><IntegrationsView /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/shipping_tools" element={
        <RequireMerchant>
          <MerchantLayout><ShippingToolsView /></MerchantLayout>
        </RequireMerchant>
      } />
            <Route path="/carriers" element={
        <RequireMerchant>
          <MerchantLayout><CarriersView /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/transportadoras" element={
        <RequireMerchant>
          <MerchantLayout><CarriersView /></MerchantLayout>
        </RequireMerchant>
      } />
      <Route path="/widget" element={
        <RequireMerchant>
          <MerchantLayout><WidgetView /></MerchantLayout>
        </RequireMerchant>
      } />

      {/* 5. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
