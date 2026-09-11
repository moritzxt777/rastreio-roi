import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TrackingGeneratorView } from './components/generator/TrackingGeneratorView';
import { OrdersView } from './components/orders/OrdersView';
import { UpsellSettingsView } from './components/tracking/UpsellSettingsView';
import { PublicTrackingView } from './components/tracking/PublicTrackingView';
import { WhatsAppView } from './components/whatsapp/WhatsAppView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { ShippingToolsView } from './components/shipping/ShippingToolsView';
import { WidgetView } from './components/widget/WidgetView';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminMasterView } from './components/admin/AdminMasterView';

// Standard Merchant Layout
const MerchantLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onNavigate={(path) => navigate(path === 'dashboard' ? '/' : `/${path}`)} activeView={currentPath} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={currentPath} onNavigate={(path) => navigate(path === 'dashboard' ? '/' : `/${path}`)} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 1. Public Tracking Routes */}
      <Route path="/r/:code" element={<PublicTrackingView />} />
      <Route path="/rastreio/:code" element={<PublicTrackingView />} />
      <Route path="/tracking/:code" element={<PublicTrackingView />} />

      {/* 2. DEDICATED SEPARATE ADMIN ROUTES (LOGIN + MASTER PANEL) */}
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin-master" element={<AdminMasterView />} />
      <Route path="/admin" element={<Navigate to="/admin-login" replace />} />

      {/* 3. Regular Merchant Dashboard Routes */}
      <Route path="/" element={<MerchantLayout><DashboardView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></MerchantLayout>} />
      <Route path="/generator" element={<MerchantLayout><TrackingGeneratorView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></MerchantLayout>} />
      <Route path="/orders" element={<MerchantLayout><OrdersView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></MerchantLayout>} />
      <Route path="/upsell" element={<MerchantLayout><UpsellSettingsView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></MerchantLayout>} />
      <Route path="/whatsapp" element={<MerchantLayout><WhatsAppView /></MerchantLayout>} />
      <Route path="/integrations" element={<MerchantLayout><IntegrationsView /></MerchantLayout>} />
      <Route path="/shipping_tools" element={<MerchantLayout><ShippingToolsView /></MerchantLayout>} />
      <Route path="/widget" element={<MerchantLayout><WidgetView /></MerchantLayout>} />

      {/* 4. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
