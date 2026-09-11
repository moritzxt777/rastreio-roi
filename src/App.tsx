import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
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
import { AdminMasterView } from './components/admin/AdminMasterView';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Protected Admin Guard
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  if (currentUser.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Acesso Restrito ao Administrador</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sua conta atual ({currentUser.email}) possui perfil de <strong>Lojista</strong> e não tem permissão para acessar o Painel Master.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Dashboard</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

// Dashboard Layout wrapper
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      {/* 1. Public Tracking Routes (/r/:code, /rastreio/:code, /tracking/:code) */}
      <Route path="/r/:code" element={<PublicTrackingView />} />
      <Route path="/rastreio/:code" element={<PublicTrackingView />} />
      <Route path="/tracking/:code" element={<PublicTrackingView />} />

      {/* 2. Authenticated Dashboard Routes */}
      <Route path="/" element={<DashboardLayout><DashboardView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></DashboardLayout>} />
      <Route path="/generator" element={<DashboardLayout><TrackingGeneratorView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></DashboardLayout>} />
      <Route path="/orders" element={<DashboardLayout><OrdersView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></DashboardLayout>} />
      <Route path="/upsell" element={<DashboardLayout><UpsellSettingsView onNavigate={(p) => navigate(p === 'dashboard' ? '/' : `/${p}`)} /></DashboardLayout>} />
      <Route path="/whatsapp" element={<DashboardLayout><WhatsAppView /></DashboardLayout>} />
      <Route path="/integrations" element={<DashboardLayout><IntegrationsView /></DashboardLayout>} />
      <Route path="/shipping_tools" element={<DashboardLayout><ShippingToolsView /></DashboardLayout>} />
      <Route path="/widget" element={<DashboardLayout><WidgetView /></DashboardLayout>} />

      {/* 3. Protected Master Admin Route */}
      <Route path="/admin" element={
        <DashboardLayout>
          <AdminGuard>
            <AdminMasterView />
          </AdminGuard>
        </DashboardLayout>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
