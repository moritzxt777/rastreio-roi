import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CarrierType, TrackingStatus } from '../../types';
import { 
  PackagePlus, 
  Layers, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  UploadCloud,
  FileText,
  Clock
} from 'lucide-react';

export const TrackingGeneratorView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { createSingleShipment, createBatchShipments, dailyQuota, openPublicTracking, getTrackingUrl, carrierConfig } = useApp();

  const [tab, setTab] = useState<'single' | 'batch'>('single');
  
  // Single form state
  const [carrier, setCarrier] = useState<CarrierType>(carrierConfig?.activeCarrier || 'loggi');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [productName, setProductName] = useState('');
  const [orderValue, setOrderValue] = useState('149.90');
  const [originCity, setOriginCity] = useState(carrierConfig?.originCity || 'Cajamar');
  const [originState, setOriginState] = useState(carrierConfig?.originState || 'SP');
  const [destCity, setDestCity] = useState('');
  const [destState, setDestState] = useState('SP');
  const [destZip, setDestZip] = useState('');
  const [initialStatus, setInitialStatus] = useState<TrackingStatus>('posted');

  // Result state
  const [lastCreated, setLastCreated] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch form state
  const [batchText, setBatchText] = useState('');
  const [batchResult, setBatchResult] = useState<{ count: number } | null>(null);

  const remainingCodes = dailyQuota.isUnlimited ? 999999 : Math.max(0, dailyQuota.limit - dailyQuota.used);

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName || !destCity) {
      setErrorMessage('Por favor preencha ao menos o nome do cliente e a cidade de destino.');
      return;
    }

    const result = createSingleShipment({
      customerName,
      customerPhone: customerPhone || '11999998888',
      customerEmail,
      orderNumber,
      orderValue: parseFloat(orderValue) || 99.90,
      productName: productName || 'Produto Exemplo E-commerce',
      carrier,
      originCity,
      originState,
      destinationCity: destCity,
      destinationState: destState,
      destinationZip: destZip || '01000-000',
      status: initialStatus
    });

    if (result.success && result.shipment) {
      setLastCreated(result.shipment);
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setProductName('');
      setDestCity('');
      setOrderNumber(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setErrorMessage(result.error || 'Erro ao gerar rastreio.');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFillDemoBatch = () => {
    const demo = `Ana Clara Silva;11987654321;Bolsa Couro Legítimo;189.90;São Paulo;SP
Carlos Eduardo Santos;21998877665;Tênis Esportivo Air;249.90;Rio de Janeiro;RJ
Juliana Paes Moreira;31987651234;Kit Skincare Facial;129.00;Belo Horizonte;MG
Marcos Vinicius Lima;41991234567;Relógio Minimalista;159.90;Curitiba;PR
Beatriz Rocha Martins;51998765432;Fone Sem Fio Pro;99.90;Porto Alegre;RS`;
    setBatchText(demo);
  };

  const handleCreateBatch = () => {
    setErrorMessage(null);
    setBatchResult(null);

    const lines = batchText.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      setErrorMessage('Insira ao menos uma linha de pedido no formato indicado.');
      return;
    }

    if (lines.length > remainingCodes) {
      setErrorMessage(`A lista possui ${lines.length} pedidos, mas você só possui ${remainingCodes} códigos disponíveis na sua cota de hoje.`);
      return;
    }

    const items = lines.map((line, idx) => {
      const parts = line.split(';').map(p => p.trim());
      return {
        customerName: parts[0] || `Cliente #${idx + 1}`,
        customerPhone: parts[1] || '11999998888',
        productName: parts[2] || 'Produto Variado',
        orderValue: parseFloat(parts[3]) || 120.00,
        orderNumber: `BATCH-${Date.now().toString().slice(-4)}-${idx + 1}`,
        carrier: (parts[6] as CarrierType) || carrierConfig?.activeCarrier || 'correios',
        originCity: carrierConfig?.originCity || 'Cajamar',
        originState: carrierConfig?.originState || 'SP',
        destinationCity: parts[4] || 'São Paulo',
        destinationState: parts[5] || 'SP',
        destinationZip: '01000-000',
        status: 'posted' as TrackingStatus
      };
    });

    const res = createBatchShipments(items);
    if (res.success) {
      setBatchResult({ count: res.count });
      setBatchText('');
    } else {
      setErrorMessage(res.error || 'Erro ao processar lote.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quota status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-brand-400" />
            Gerador de Códigos & Rastreios
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Crie novos códigos individuais ou importe em massa com linha do tempo de eventos realista.
          </p>
        </div>

        {/* Quota badge */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
          <Clock className="w-4 h-4 text-brand-400" />
          <div className="text-xs">
            <span className="text-slate-400">Cota de Hoje: </span>
            <span className="font-bold text-white">
              {dailyQuota.used} / {dailyQuota.isUnlimited ? '∞' : dailyQuota.limit}
            </span>
            <span className="text-brand-400 ml-1.5 font-semibold">
              ({dailyQuota.isUnlimited ? 'Ilimitada' : `${remainingCodes} restantes`})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800">
        <button
          onClick={() => { setTab('single'); setErrorMessage(null); }}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            tab === 'single'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>Geração Individual</span>
        </button>

        <button
          onClick={() => { setTab('batch'); setErrorMessage(null); }}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            tab === 'batch'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Importação em Lote (CSV / Texto)</span>
        </button>
      </div>

      {/* Error / Warning Alert */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SINGLE GENERATOR TAB */}
      {tab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form (2 Cols) */}
          <form onSubmit={handleCreateSingle} className="lg:col-span-2 space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-bold text-white mb-2">Dados da Encomenda & Destinatário</h2>

            {/* Carrier selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Transportadora / Formato do Código</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'loggi', name: 'Loggi Logística (Principal)', desc: 'LG...BR • rastreio-loggi.vercel.app' },
                  { id: 'jadlog', name: 'JAD Logística', desc: '1008... • jadlog-rastreamento.vercel.app' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCarrier(c.id as CarrierType)}
                    className={`rounded-xl border p-3 text-left text-xs transition ${
                      carrier === c.id
                        ? 'border-brand-500 bg-brand-500/15 text-white font-semibold shadow-md shadow-brand-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-100 flex items-center justify-between">
                      <span>{c.name}</span>
                      {carrier === c.id && <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Gabriel Silveira"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="Ex: 11999998888"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Order & Product Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nº do Pedido</label>
                <input
                  type="text"
                  placeholder="Ex: #1042"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Smartwatch Ultra Series 9"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor do Pedido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="149.90"
                  value={orderValue}
                  onChange={(e) => setOrderValue(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Route & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade de Origem (CD)</label>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade de Destino *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Belo Horizonte"
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">UF Destino</label>
                <select
                  value={destState}
                  onChange={(e) => setDestState(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES', 'AM', 'PA', 'MT', 'MS'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Initial Status selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status Inicial do Rastreio</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as TrackingStatus)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="posted">Objeto Postado (Apenas recebido)</option>
                <option value="in_transit">Em Trânsito (Histórico completo de transferência)</option>
                <option value="out_for_delivery">Saiu para Entrega ao Destinatário</option>
                <option value="delivered">Objeto Entregue</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={remainingCodes === 0 && !dailyQuota.isUnlimited}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-brand-500/20 hover:from-brand-400 hover:to-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gerar Código de Rastreio Agora (-1 cota diária)</span>
              </button>
            </div>
          </form>

          {/* Success / Result Showcase (1 Col) */}
          <div className="space-y-4">
            {lastCreated ? (
              <div className="rounded-xl border border-brand-500/30 bg-gradient-to-b from-slate-900 to-brand-950/20 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-brand-400">
                    <CheckCircle2 className="w-4 h-4" /> Rastreio Gerado!
                  </span>
                  <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-semibold">
                    {lastCreated.carrier.toUpperCase()}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-center">
                  <p className="text-[11px] text-slate-400">Código de Rastreamento:</p>
                  <p className="font-mono text-xl font-black text-brand-300 tracking-wider my-1">
                    {lastCreated.code}
                  </p>
                  <p className="text-[11px] text-slate-400">{lastCreated.customerName} • #{lastCreated.orderNumber}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Destino:</span>
                    <span className="text-white font-medium">{lastCreated.destinationCity} - {lastCreated.destinationState}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Previsão:</span>
                    <span className="text-white font-medium">{lastCreated.estimatedDeliveryDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Eventos na Linha do Tempo:</span>
                    <span className="text-brand-400 font-semibold">{lastCreated.events.length} etapas registradas</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyCode(lastCreated.code)}
                      className="flex items-center justify-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Código Copiado!' : 'Copiar Código'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const link = getTrackingUrl(lastCreated.code);
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center justify-center space-x-1.5 rounded-lg border border-brand-500/40 bg-brand-500/10 py-2 text-xs font-semibold text-brand-300 hover:bg-brand-500/20 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </button>
                  </div>

                  <button
                    onClick={() => openPublicTracking(lastCreated.code)}
                    className="w-full flex items-center justify-center space-x-1.5 rounded-lg bg-brand-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-brand-400 transition shadow-lg shadow-brand-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Página de Rastreio</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center space-y-3">
                <Truck className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-xs font-bold text-slate-300">Nenhum rastreio gerado nesta sessão</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Preencha o formulário ao lado para emitir o código. Cada código consome 1 unidade da sua cota diária gratuita de 100/dia.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BATCH GENERATOR TAB */}
      {tab === 'batch' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white">Importar Pedidos em Lote</h2>
              <p className="text-xs text-slate-400">
                Cole sua lista no formato: <code className="text-brand-300">Nome;Telefone;Produto;Valor;Cidade;UF</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillDemoBatch}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg"
            >
              <FileText className="w-3.5 h-3.5" /> Carregar Exemplo de Teste
            </button>
          </div>

          <textarea
            rows={8}
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder={`Lucas Silveira;11987654321;Smartwatch Ultra;189.90;São Paulo;SP\nFernanda Costa;21998877665;Kit Camisetas;147.00;Rio de Janeiro;RJ`}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {batchText.trim() ? `${batchText.trim().split('\n').length} pedidos detectados` : '0 pedidos'}
            </span>

            <button
              type="button"
              onClick={handleCreateBatch}
              disabled={!batchText.trim() || (remainingCodes < (batchText.trim().split('\n').length) && !dailyQuota.isUnlimited)}
              className="flex items-center space-x-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-brand-400 transition disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Processar Lote e Gerar Rastreios</span>
            </button>
          </div>

          {batchResult && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sucesso! <strong>{batchResult.count} pedidos</strong> foram gerados e adicionados à sua lista.
              </span>
              <button
                onClick={() => onNavigate('orders')}
                className="underline font-bold text-white hover:text-emerald-200"
              >
                Ver Pedidos Gerados
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
