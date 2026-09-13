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

      <div className="space-y-3">
        {/* Discord Community Box */}
        <a
          href="https://discord.gg/KvKhAV42d"
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-2xl border border-[#5865F2]/30 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 p-3.5 transition shadow-lg shadow-[#5865F2]/10"
        >
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#5865F2] flex items-center justify-center text-white shrink-0">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.91,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-white group-hover:text-sky-300 transition">Comunidade Discord</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Networking, atualizações e suporte direto no servidor.
          </p>
        </a>

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
      </div>
    </aside>
  );
};
