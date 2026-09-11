import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Webhook, 
  Copy, 
  Check, 
  Play, 
  CheckCircle2, 
  ExternalLink,
  Globe,
  Save,
  RefreshCw,
  Server
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { integrations, createSingleShipment, openPublicTracking, updateIntegrations } = useApp();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [simulatedPlatform, setSimulatedPlatform] = useState('shopify');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // User's own domain / API server host
  const [apiHost, setApiHost] = useState(
    typeof window !== 'undefined' ? `${window.location.protocol}//api.${window.location.hostname}` : 'https://api.seudominio.com.br'
  );
  const [savedHost, setSavedHost] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateApiHost = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHost = apiHost.replace(/\/$/, '');
    const updated = integrations.map(int => ({
      ...int,
      webhookUrl: `${cleanHost}/v1/webhooks/${int.platform}`
    }));
    updateIntegrations(updated);
    setSavedHost(true);
    setTimeout(() => setSavedHost(false), 2500);
  };

  const handleSimulateWebhook = () => {
    setSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      const sampleCustomer = {
        customerName: 'Mariana Duarte Souza',
        customerPhone: '11987654329',
        customerEmail: 'mariana.duarte@gmail.com',
        orderNumber: `WH-${Math.floor(1000 + Math.random() * 9000)}`,
        orderValue: 199.90,
        productName: 'Kit Completo E-commerce Pro',
        carrier: 'correios' as const,
        originCity: 'Cajamar',
        originState: 'SP',
        destinationCity: 'Florianópolis',
        destinationState: 'SC',
        destinationZip: '88000-000',
        status: 'posted' as const
      };

      const res = createSingleShipment(sampleCustomer);
      setSimulating(false);
      if (res.success && res.shipment) {
        setSimResult(res.shipment);
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-brand-400" />
            Integrações & Webhooks de E-commerce
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure seu domínio de servidor próprio e receba pedidos em tempo real da Shopify, Yampi, CartPanda, Nuvemshop e Kiwify.
          </p>
        </div>
      </div>

      {/* Domain / Server Config Box */}
      <form onSubmit={handleUpdateApiHost} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-bold text-white">Domínio da sua API / Servidor Próprio</h2>
          </div>
          {savedHost && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Webhooks atualizados com seu domínio!
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Informe o domínio onde sua API ou backend está hospedado (ex: seu domínio próprio, Railway, Vercel, VPS ou localhost):
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={apiHost}
              onChange={(e) => setApiHost(e.target.value)}
              placeholder="https://api.seudominio.com.br"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-brand-400 transition flex items-center justify-center gap-1.5 shadow shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Atualizar URLs de Webhook</span>
          </button>
        </div>
      </form>

      {/* Webhook Test Simulator Box */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/30 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              SIMULADOR DE EVENTO EM TEMPO REAL
            </span>
            <h2 className="text-sm font-bold text-white mt-1">Testar Recebimento de Pedido Pago via Webhook</h2>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={simulatedPlatform}
              onChange={(e) => setSimulatedPlatform(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="shopify">Shopify</option>
              <option value="yampi">Yampi Checkout</option>
              <option value="cartpanda">CartPanda</option>
              <option value="nuvemshop">Nuvemshop</option>
              <option value="kiwify">Kiwify</option>
            </select>

            <button
              onClick={handleSimulateWebhook}
              disabled={simulating}
              className="flex items-center space-x-1.5 rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-brand-400 transition disabled:opacity-50 shadow"
            >
              {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{simulating ? 'Processando...' : 'Disparar Pedido de Teste'}</span>
            </button>
          </div>
        </div>

        {simResult && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-xs text-emerald-300">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Webhook Recebido & Processado com Sucesso!
              </span>
              <button
                onClick={() => openPublicTracking(simResult.code)}
                className="underline text-white hover:text-emerald-200 font-semibold flex items-center gap-1"
              >
                Abrir Rastreio <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-emerald-200">
              Código criado: <strong className="font-mono">{simResult.code}</strong> • Cliente: <strong>{simResult.customerName}</strong> • Cota consumida: <strong>-1 cota diária</strong> • WhatsApp notificado.
            </p>
          </div>
        )}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((int) => (
          <div key={int.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-brand-400 text-sm">
                  {int.platform.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{int.name}</h3>
                  <span className={`text-[10px] font-semibold ${int.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {int.enabled ? '● Conectado & Ativo' : '○ Desconectado'}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {int.totalOrdersSynced} pedidos sincronizados
              </span>
            </div>

            {/* Webhook URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">URL do Webhook (Cole na sua plataforma):</label>
              <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <input
                  type="text"
                  readOnly
                  value={int.webhookUrl}
                  className="w-full bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(int.webhookUrl, `${int.id}_url`)}
                  className="text-slate-500 hover:text-white p-1"
                >
                  {copiedKey === `${int.id}_url` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Secret Token */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Chave Secreta / Token de Validação:</label>
              <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <input
                  type="password"
                  readOnly
                  value={int.webhookSecret}
                  className="w-full bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(int.webhookSecret, `${int.id}_sec`)}
                  className="text-slate-500 hover:text-white p-1"
                >
                  {copiedKey === `${int.id}_sec` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
