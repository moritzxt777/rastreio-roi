import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WhatsAppTemplate } from '../../types';
import { 
  MessageSquare, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RefreshCw,
  QrCode,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sendWhatsAppTrackingNotification } from '../../services/whatsapp.service';

export const WhatsAppView: React.FC = () => {
  const { whatsappTemplates, updateWhatsAppTemplates, whatsappLogs, shipments, getTrackingUrl } = useApp();

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(whatsappTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(whatsappTemplates[0]);
  const [testPhone, setTestPhone] = useState('11999998888');
  const [testSent, setTestSent] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [qrConnected, setQrConnected] = useState(true);

  const handleToggleTemplate = (id: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
    setTemplates(updated);
    updateWhatsAppTemplates(updated);
  };

  const handleUpdateMessage = (val: string) => {
    const updated = templates.map(t => t.id === selectedTemplate.id ? { ...t, message: val } : t);
    setTemplates(updated);
    setSelectedTemplate({ ...selectedTemplate, message: val });
    updateWhatsAppTemplates(updated);
  };

  // Preview formatting
  const sampleShipment = shipments[0] || {
    customerName: 'Lucas Silveira',
    orderNumber: '10842',
    code: 'NL192837465BR',
    productName: 'Smartwatch Ultra 9'
  };

  const trackingLinkPreview = getTrackingUrl(sampleShipment.code);

  const previewText = selectedTemplate.message
    .replace(/{nome}/g, sampleShipment.customerName.split(' ')[0])
    .replace(/{pedido}/g, sampleShipment.orderNumber)
    .replace(/{codigo}/g, sampleShipment.code)
    .replace(/{link_rastreio}/g, trackingLinkPreview)
    .replace(/{produto}/g, sampleShipment.productName);

  const handleSendTest = async () => {
    if (!testPhone.trim() || isSendingTest) return;
    setIsSendingTest(true);
    setTestError(null);
    setTestSent(false);

    try {
      await sendWhatsAppTrackingNotification({
        phone: testPhone,
        customerName: sampleShipment.customerName,
        orderNumber: sampleShipment.orderNumber,
        trackingCode: sampleShipment.code,
        productName: sampleShipment.productName,
        templateMessage: selectedTemplate.message,
        customTrackingUrl: trackingLinkPreview,
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } catch (err: any) {
      setTestError(err?.message || 'Erro ao enviar notificação pelo WhatsApp');
      setTimeout(() => setTestError(null), 6000);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Central de WhatsApp & Notificações Automáticas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dispare mensagens automáticas no WhatsApp do cliente quando o status da encomenda for atualizado.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-1.5 text-xs text-emerald-400 font-semibold">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Instância Evolution API Conectada</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Templates & Triggers */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white">Gatilhos de Notificação Automática</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`rounded-xl border p-4 cursor-pointer transition ${
                  selectedTemplate.id === t.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">{t.name}</span>
                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={t.enabled}
                      onChange={() => handleToggleTemplate(t.id)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {t.message}
                </p>
              </div>
            ))}
          </div>

          {/* Template Editor */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Editar Mensagem: {selectedTemplate.name}
              </h3>
              <span className="text-[10px] text-slate-500">Tags dinâmicas disponíveis abaixo</span>
            </div>

            <textarea
              rows={4}
              value={selectedTemplate.message}
              onChange={(e) => handleUpdateMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />

            {/* Dynamic tags chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['{nome}', '{pedido}', '{codigo}', '{link_rastreio}', '{produto}'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleUpdateMessage(selectedTemplate.message + ' ' + tag)}
                  className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-emerald-300 font-mono"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sent Logs Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Últimos Disparos Realizados
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Cliente</th>
                    <th className="pb-2">Telefone</th>
                    <th className="pb-2">Código</th>
                    <th className="pb-2">Hora</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {whatsappLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20">
                      <td className="py-2 font-medium text-slate-200">{log.customerName}</td>
                      <td className="py-2 text-slate-400 font-mono">{log.customerPhone}</td>
                      <td className="py-2 text-emerald-300 font-mono">{log.trackingCode}</td>
                      <td className="py-2 text-slate-400">{log.timestamp}</td>
                      <td className="py-2 text-right">
                        <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                          Entregue
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Smartphone Mockup Live Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border-4 border-slate-800 bg-slate-950 p-4 shadow-2xl relative max-w-[320px] mx-auto">
            {/* Phone header */}
            <div className="border-b border-slate-800 pb-3 flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                RJ
              </div>
              <div>
                <p className="text-xs font-bold text-white">Rastreio Oficial • Notificações</p>
                <p className="text-[10px] text-emerald-400">online</p>
              </div>
            </div>

            {/* Chat Bubble */}
            <div className="py-6 space-y-3 min-h-[260px] flex flex-col justify-end">
              <div className="rounded-xl rounded-tl-none bg-emerald-900/60 border border-emerald-500/30 p-3 text-xs text-emerald-100 space-y-1.5 shadow-md">
                <p className="leading-relaxed whitespace-pre-line">{previewText}</p>
                <div className="text-[10px] text-emerald-300/70 text-right flex items-center justify-end gap-1">
                  <span>14:32</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Test sender simulator */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-[10px] text-slate-400 block font-semibold">Simular envio em tempo real:</span>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="DDD + Telefone"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isSendingTest}
                  onClick={handleSendTest}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition shrink-0 flex items-center justify-center min-w-[36px]"
                >
                  {isSendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
              {testSent && (
                <p className="text-[10px] text-emerald-400 text-center font-semibold animate-pulse">
                  ✓ Mensagem enviada com sucesso!
                </p>
              )}
              {testError && (
                <p className="text-[10px] text-rose-400 text-center font-medium bg-rose-500/10 border border-rose-500/20 rounded p-1.5 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{testError}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
