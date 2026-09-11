import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrackingStatus, Shipment } from '../../types';
import { getStatusDetails } from '../../utils/generators';
import { 
  Truck, 
  Search, 
  Filter, 
  ExternalLink, 
  MessageSquare, 
  Printer, 
  FileText, 
  Trash2, 
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

export const OrdersView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { shipments, updateShipmentStatus, deleteShipment, openPublicTracking, sendWhatsAppNotification, getTrackingUrl } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch = 
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destinationCity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleSendWhatsApp = (s: Shipment) => {
    sendWhatsAppNotification(s, s.status);
    setNotificationSuccess(s.code);
    setTimeout(() => setNotificationSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-400" />
            Gestão de Pedidos & Rastreios
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize, altere status em tempo real, dispare notificações de WhatsApp e confira o ROI de cada encomenda.
          </p>
        </div>

        <button
          onClick={() => onNavigate('generator')}
          className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-brand-400 transition"
        >
          + Novo Rastreio
        </button>
      </div>

      {/* Notifications banner */}
      {notificationSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Notificação de WhatsApp enviada com sucesso para o código <strong>{notificationSuccess}</strong>!</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, cliente ou pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">Todos os Status ({shipments.length})</option>
            <option value="posted">Postado</option>
            <option value="in_transit">Em Trânsito</option>
            <option value="out_for_delivery">Saiu para Entrega</option>
            <option value="delivered">Entregue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Código / Transportadora</th>
                <th className="py-3.5 px-4">Cliente & Contato</th>
                <th className="py-3.5 px-4">Destino</th>
                <th className="py-3.5 px-4">Alterar Status</th>
                <th className="py-3.5 px-4">Upsell / ROI</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    Nenhum envio encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => {
                  const statusInfo = getStatusDetails(s.status);
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-brand-300 text-sm">{s.code}</span>
                          <button
                            onClick={() => handleCopy(s.code)}
                            className="text-slate-500 hover:text-slate-300 p-1"
                            title="Copiar código"
                          >
                            {copiedCode === s.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          #{s.orderNumber} • {s.carrier.toUpperCase()} • R$ {s.orderValue?.toFixed(2)}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{s.customerName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          {s.customerPhone}
                          {s.whatsappNotified && (
                            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">WhatsApp Enviado</span>
                          )}
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{s.destinationCity}/{s.destinationState}</div>
                        <div className="text-[10px] text-slate-500">Prev: {s.estimatedDeliveryDate}</div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={s.status}
                          onChange={(e) => updateShipmentStatus(s.id, e.target.value as TrackingStatus)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold focus:outline-none ${statusInfo.color}`}
                        >
                          <option value="posted" className="bg-slate-900 text-white">Objeto Postado</option>
                          <option value="in_transit" className="bg-slate-900 text-white">Em Trânsito</option>
                          <option value="out_for_delivery" className="bg-slate-900 text-white">Saiu para Entrega</option>
                          <option value="delivered" className="bg-slate-900 text-white">Entregue</option>
                          <option value="waiting_pickup" className="bg-slate-900 text-white">Aguardando Retirada</option>
                        </select>
                      </td>

                      {/* Upsell / ROI Performance */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">
                          {s.upsellClicks || 0} views
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          {s.upsellConversions > 0 ? `+ R$ ${(s.upsellConversions * 89.90).toFixed(2)} ROI` : 'Sem conversão'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Open Tracking */}
                          <button
                            onClick={() => openPublicTracking(s.code)}
                            className="rounded-lg bg-brand-500/10 border border-brand-500/30 p-1.5 text-brand-300 hover:bg-brand-500 hover:text-slate-950 transition"
                            title="Abrir Página de Rastreio com Upsell"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Trigger WhatsApp */}
                          <button
                            onClick={() => handleSendWhatsApp(s)}
                            className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-1.5 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition"
                            title="Disparar Alerta no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteShipment(s.id)}
                            className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
                            title="Remover envio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
