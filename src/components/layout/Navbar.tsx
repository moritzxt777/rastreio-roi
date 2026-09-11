import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  ShieldCheck, 
  User, 
  PlusCircle, 
  Sparkles, 
  Clock, 
  ChevronDown,
  Store,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
  const { currentUser, allUsers, switchUser, dailyQuota, openPublicTracking, shipments } = useApp();

  const percentage = dailyQuota.isUnlimited 
    ? 100 
    : Math.min(100, Math.round((dailyQuota.used / dailyQuota.limit) * 100));

  const remaining = dailyQuota.isUnlimited ? '∞' : Math.max(0, dailyQuota.limit - dailyQuota.used);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3 backdrop-blur-md">
      {/* Brand & Store Name */}
      <div className="flex items-center space-x-4">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex cursor-pointer items-center space-x-2.5 transition-transform hover:scale-105"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-slate-950 shadow-lg shadow-brand-500/20">
            <Package className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-white">Rastreio<span className="text-brand-400">ROI</span></span>
              <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-300">PRO</span>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-500" /> {currentUser.storeName}
            </span>
          </div>
        </div>
      </div>

      {/* Center / Daily Quota Indicator */}
      <div className="hidden md:flex items-center space-x-4 bg-slate-950/60 border border-slate-800/80 rounded-full px-4 py-1.5 shadow-inner">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Cota Diária:</span>
          <span className="text-xs font-bold text-white">
            {dailyQuota.used} <span className="text-slate-500">/</span> {dailyQuota.isUnlimited ? 'Ilimitado' : dailyQuota.limit}
          </span>
          <span className="text-[11px] text-slate-400">
            ({dailyQuota.isUnlimited ? 'Livre' : `${remaining} restantes hoje`})
          </span>
        </div>

        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-brand-500 to-emerald-400'
            }`}
            style={{ width: `${dailyQuota.isUnlimited ? 100 : percentage}%` }}
          />
        </div>

        <span className="text-[10px] text-slate-500 border-l border-slate-800 pl-2">
          Reseta à meia-noite
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Tracking Preview Button */}
        {shipments.length > 0 && (
          <button
            onClick={() => openPublicTracking(shipments[0].code)}
            className="hidden lg:flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Ver como o cliente final visualiza o rastreio com Upsell"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Ver Rastreio c/ Upsell</span>
          </button>
        )}

        {/* Generate Tracking Action */}
        <button
          onClick={() => onNavigate('generator')}
          className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-brand-500/20 hover:from-brand-400 hover:to-emerald-500 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Gerar Rastreio</span>
        </button>

        {/* User / Admin Switcher Dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-brand-400 font-bold text-[11px]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-white leading-tight truncate max-w-[100px]">{currentUser.name}</p>
              <p className="text-[10px] text-brand-400 flex items-center gap-0.5">
                {currentUser.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5" /> Admin Master
                  </>
                ) : (
                  'Lojista'
                )}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
          </button>

          {/* Switch menu */}
          <div className="absolute right-0 mt-1 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Alternar Usuário de Teste</p>
            {allUsers.map(u => (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition ${
                  currentUser.id === u.id 
                    ? 'bg-brand-500/10 text-brand-300 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <p>{u.name}</p>
                  <p className="text-[10px] text-slate-400">{u.role === 'admin' ? 'Painel Admin' : `Cota: ${u.dailyLimit}/dia`}</p>
                </div>
                {currentUser.id === u.id && <span className="text-[10px] bg-brand-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">Ativo</span>}
              </button>
            ))}
            
            <div className="my-1 border-t border-slate-800" />
            <button
              onClick={() => onNavigate('admin')}
              className="w-full flex items-center space-x-2 rounded-lg px-2.5 py-2 text-xs text-brand-400 hover:bg-slate-800 transition font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acessar Painel Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
