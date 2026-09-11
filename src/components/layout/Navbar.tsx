import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PlusCircle, 
  Clock, 
  Store,
  ExternalLink,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { currentUser, dailyQuota, shipments } = useApp();

  const percentage = dailyQuota.isUnlimited 
    ? 100 
    : Math.min(100, Math.round((dailyQuota.used / dailyQuota.limit) * 100));

  const remaining = dailyQuota.isUnlimited ? '∞' : Math.max(0, dailyQuota.limit - dailyQuota.used);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-navy-950/90 px-6 py-3.5 backdrop-blur-md">
      {/* Brand Logo */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/dashboard"
          className="flex items-center space-x-3 transition-transform hover:scale-105"
        >
          <img 
            src="/logo.png" 
            alt="ROI Logo" 
            className="h-8 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-black tracking-tight text-white">PAINEL DO LOJISTA</span>
              <span className="rounded bg-brand-500/20 px-1.5 py-0.2 text-[9px] font-bold text-brand-300">PRO</span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-500" /> {currentUser.storeName}
            </span>
          </div>
        </Link>
      </div>

      {/* Center / Daily Quota Indicator */}
      <div className="hidden md:flex items-center space-x-4 bg-navy-900 border border-slate-800/80 rounded-full px-4 py-1.5 shadow-inner">
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

        <div className="w-24 h-2 bg-navy-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all duration-500"
            style={{ width: `${dailyQuota.isUnlimited ? 100 : percentage}%` }}
          />
        </div>

        <span className="text-[10px] text-slate-500 border-l border-slate-800 pl-2">
          Zera às 00h00
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {shipments.length > 0 && (
          <Link
            to={`/r/${shipments[0].code}`}
            className="hidden lg:flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-navy-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Ver Rastreio c/ Upsell</span>
          </Link>
        )}

        <button
          onClick={() => onNavigate('generator')}
          className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-blue-400 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Gerar Rastreio</span>
        </button>

        {/* Merchant User Info */}
        <div className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-navy-900 px-3 py-1.5 text-xs text-slate-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-[11px]">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-bold text-white leading-tight truncate max-w-[100px]">{currentUser.name}</p>
            <p className="text-[10px] text-brand-400">Lojista</p>
          </div>
        </div>

        <Link
          to="/"
          className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
          title="Sair / Ir para o Início"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};
