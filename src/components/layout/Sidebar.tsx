import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  PackagePlus, 
  Truck, 
  Sparkles, 
  MessageSquare, 
  Webhook, 
  Printer, 
  Code2, 
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const { shipments, dailyQuota } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & ROI', icon: LayoutDashboard },
    { id: 'generator', label: 'Gerador de Rastreios', icon: PackagePlus, badge: `${dailyQuota.used}/${dailyQuota.limit}` },
    { id: 'orders', label: 'Pedidos & Envios', icon: Truck, count: shipments.length },
    { id: 'carriers', label: 'Transportadoras', icon: Truck },
    { id: 'upsell', label: 'Página de Rastreio (ROI)', icon: TrendingUp, highlight: true },
    { id: 'whatsapp', label: 'WhatsApp & Alertas', icon: MessageSquare },
    { id: 'integrations', label: 'Integrações & Webhooks', icon: Webhook },
    { id: 'shipping_tools', label: 'Etiquetas & Espelho NFe', icon: Printer },
    { id: 'widget', label: 'Widget para Loja', icon: Code2 },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-navy-950 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Menu Principal</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-brand-500/15 text-brand-300 font-bold border border-brand-500/30 shadow-sm shadow-brand-500/10' 
                      : 'text-slate-400 hover:bg-navy-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="rounded-full bg-navy-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="rounded-full bg-navy-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                      {item.count}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="rounded-full bg-brand-500/20 text-brand-300 px-1.5 py-0.5 text-[9px] font-bold animate-pulse">
                      +ROI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Quota Widget Bottom */}
      <div className="rounded-2xl border border-slate-800 bg-navy-900/80 p-4 text-xs shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-200">Sua Cota Diária</span>
          <span className="text-[11px] font-black text-brand-400">
            {dailyQuota.isUnlimited ? 'ILIMITADA' : `${dailyQuota.used}/${dailyQuota.limit}`}
          </span>
        </div>
        <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden mb-2 border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-sky-400"
            style={{ width: `${dailyQuota.isUnlimited ? 100 : Math.min(100, (dailyQuota.used / dailyQuota.limit) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          100 códigos liberados por dia. Zera diariamente às 00h00.
        </p>
      </div>
    </aside>
  );
};
