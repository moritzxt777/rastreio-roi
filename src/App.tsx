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
import { WhatsAppView } from './components/whatsapp/WhatsAppView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { ShippingToolsView } from './components/shipping/ShippingToolsView';
import { WidgetView } from './components/widget/WidgetView';
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

export const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/register" element={<LandingPage />} />

      {/* 2. Public Tracking Routes (Secure RPC lookup with 404) */}
      <Route path="/r/:code" element={<PublicTrackingView />} />
      <Route path="/rastreio/:code" element={<PublicTrackingView />} />
      <Route path="/tracking/:code" element={<PublicTrackingView />} />

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
