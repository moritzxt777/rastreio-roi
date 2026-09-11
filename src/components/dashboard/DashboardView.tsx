import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  ExternalLink,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Plus
} from 'lucide-react';
import { getStatusDetails } from '../../utils/generators';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { shipments, dailyQuota, openPublicTracking, currentUser, upsellConfig } = useApp();

  // Metrics calculation
  const totalShipments = shipments.length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
  const inTransitCount = shipments.filter(s => s.status === 'in_transit' || s.status === 'posted').length;
  const outForDeliveryCount = shipments.filter(s => s.status === 'out_for_delivery').length;
  
  // ROI / Upsell metrics
  const totalUpsellClicks = shipments.reduce((acc, s) => acc + (s.upsellClicks || 0), 0);
  const totalUpsellConversions = shipments.reduce((acc, s) => acc + (s.upsellConversions || 0), 0);
  const estimatedRevenueFromUpsell = totalUpsellConversions * 89.90; // average upsell product price

  const remainingCodes = dailyQuota.isUnlimited ? '∞' : Math.max(0, dailyQuota.limit - dailyQuota.used);
  const quotaPercentage = dailyQuota.isUnlimited ? 100 : Math.min(100, Math.round((dailyQuota.used / dailyQuota.limit) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quota Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/30 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Painel de Rastreio com Otimizador de ROI Ativo</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Olá, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Gerencie seus códigos de rastreio, reduza reclamações de frete e transforme cada consulta de rastreamento em novas vendas com nossa vitrine de upsell.
            </p>
          </div>

          {/* Daily Quota Card in Hero */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 min-w-[280px] shadow-lg">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" /> Cota de Hoje:
              </span>
              <span className="font-bold text-white">
                {dailyQuota.used} <span className="text-slate-500">/</span> {dailyQuota.isUnlimited ? '∞' : dailyQuota.limit}
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">
                {dailyQuota.isUnlimited ? 'Acesso Ilimitado' : `${remainingCodes} restantes hoje`}
              </span>
              <span className="text-brand-400 font-semibold">100/dia grátis</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Generated */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Rastreios Criados</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalShipments}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{dailyQuota.used}</span> gerados hoje
          </p>
        </div>

        {/* In Transit / Out for delivery */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Em Rota / Trânsito</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{inTransitCount + outForDeliveryCount}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">{outForDeliveryCount}</span> saíram para entrega
          </p>
        </div>

        {/* Delivered count */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Entregas Concluídas</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{deliveredCount}</div>
          <p className="text-xs text-slate-400 mt-1">
            Taxa de entrega: <span className="text-white font-semibold">{totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0}%</span>
          </p>
        </div>

        {/* ROI / Upsell Revenue */}
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-slate-900/80 to-emerald-950/20 p-5 shadow-sm hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold mb-2">
            <span>ROI Gerado c/ Rastreio</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            R$ {estimatedRevenueFromUpsell.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{totalUpsellConversions}</span> vendas em upsell no rastreio
          </p>
        </div>
      </div>

      {/* Quick Actions & Recent Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Últimos Pedidos Rastreados</h2>
              <p className="text-xs text-slate-400">Clique para abrir a página de rastreio ou disparar notificação</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Código</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Destino</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shipments.slice(0, 5).map((s) => {
                  const statusInfo = getStatusDetails(s.status);
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3">
                        <div className="font-mono font-bold text-brand-300">{s.code}</div>
                        <div className="text-[10px] text-slate-500">#{s.orderNumber} • {s.carrier.toUpperCase()}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-slate-200">{s.customerName}</div>
                        <div className="text-[10px] text-slate-400">{s.customerPhone}</div>
                      </td>
                      <td className="py-3 text-slate-300">
                        {s.destinationCity}/{s.destinationState}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openPublicTracking(s.code)}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-brand-500 hover:text-slate-950 transition"
                        >
                          Rastrear
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upsell / ROI Performance Box (1 Col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-slate-900 to-brand-950/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Máquina de Vendas</span>
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-300">ATIVO</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Página de Rastreio com Upsell</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Cada vez que um cliente rastreia o pacote, ele recebe um cupom de <strong>{upsellConfig.couponDiscount}</strong> e produtos recomendados da sua loja.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Cliques nas Ofertas:</span>
                <span className="font-bold text-white">{totalUpsellClicks} visualizações</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Cupons Resgatados:</span>
                <span className="font-bold text-emerald-400">{totalUpsellConversions} conversões</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('upsell')}
              className="w-full flex items-center justify-center space-x-1.5 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-300 hover:bg-brand-500 hover:text-slate-950 transition"
            >
              <span>Personalizar Ofertas de Upsell</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* WhatsApp Automation Quick Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">WhatsApp Automático</span>
              </div>
              <span className="text-[10px] text-slate-400">Evolution API Conectada</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Notificações de "Objeto Postado", "Saiu para Entrega" e "Entregue" disparadas em tempo real.
            </p>
            <button
              onClick={() => onNavigate('whatsapp')}
              className="w-full rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
            >
              Configurar Mensagens & Gatilhos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
