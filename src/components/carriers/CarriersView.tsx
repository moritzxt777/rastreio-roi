import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  Globe2, 
  MapPin, 
  Calendar, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  PackageX, 
  ExternalLink, 
  Save, 
  Check, 
  Info,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { CarrierOperationalConfig } from '../../types';

export const CarriersView: React.FC = () => {
  const { carrierConfig, updateCarrierConfig } = useApp();
  const [config, setConfig] = useState<CarrierOperationalConfig>(carrierConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCarrierConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold text-brand-300 mb-1.5">
            <Truck className="w-3.5 h-3.5 text-brand-400" />
            <span>Transportadoras & Rota Operacional</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Transportadoras Nacionais
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure os parâmetros operacionais da sua transportadora e o comportamento da linha do tempo.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-600/25 hover:from-brand-500 hover:to-blue-400 transition active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Parâmetros</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">Parâmetros das transportadoras atualizados com sucesso!</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">SALVO</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ========================================================================= */}
        {/* SEÇÃO 1: TRANSPORTADORAS NACIONAIS ATIVAS */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-400" />
                Transportadoras
              </h2>
              <p className="text-xs text-slate-400">
                Escolha em qual transportadora deseja operar. Os códigos de rastreio criados são consultáveis automaticamente em ambas.
              </p>
            </div>
            <span className="rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold px-2.5 py-1">
              Ativas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Loggi Logística */}
            <div
              onClick={() => setConfig({ ...config, activeCarrier: 'loggi' })}
              className={`cursor-pointer rounded-2xl border p-4.5 transition-all relative flex flex-col justify-between space-y-3 ${
                config.activeCarrier === 'loggi'
                  ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
                  : 'border-slate-800 bg-navy-950/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-white">Loggi Logística</span>
                    {config.activeCarrier === 'loggi' && (
                      <span className="rounded bg-brand-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 uppercase">
                        Principal
                      </span>
                    )}
                  </div>
                  <a
                    href="https://rastreio-loggi.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center space-x-1 text-xs text-brand-400 hover:underline font-mono"
                  >
                    <span>rastreio-loggi.vercel.app</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  config.activeCarrier === 'loggi' ? 'border-brand-400 bg-brand-500 text-navy-950' : 'border-slate-700'
                }`}>
                  {config.activeCarrier === 'loggi' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5">
                Rastreamento expresso, integração com centros de triagem e visualização em tempo real.
              </div>
            </div>

            {/* JAD Logística */}
            <div
              onClick={() => setConfig({ ...config, activeCarrier: 'jadlog' })}
              className={`cursor-pointer rounded-2xl border p-4.5 transition-all relative flex flex-col justify-between space-y-3 ${
                config.activeCarrier === 'jadlog'
                  ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
                  : 'border-slate-800 bg-navy-950/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-white">JAD Logística</span>
                    {config.activeCarrier === 'jadlog' && (
                      <span className="rounded bg-brand-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 uppercase">
                        Principal
                      </span>
                    )}
                  </div>
                  <a
                    href="https://jadlog-rastreamento.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center space-x-1 text-xs text-brand-400 hover:underline font-mono"
                  >
                    <span>jadlog-rastreamento.vercel.app</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  config.activeCarrier === 'jadlog' ? 'border-brand-400 bg-brand-500 text-navy-950' : 'border-slate-700'
                }`}>
                  {config.activeCarrier === 'jadlog' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5">
                Malha rodoviária e aérea expressa com código padrão numérico e consulta instantânea.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3 text-xs text-brand-300 flex items-center space-x-2">
            <Info className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Os códigos de rastreio criados são consultáveis automaticamente em ambas as transportadoras.</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEÇÃO 2: TRANSPORTADORAS INTERNACIONAIS */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-800/80 bg-navy-900/40 p-6 space-y-2 opacity-85">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-slate-400" />
              Transportadoras Internacionais
            </h2>
            <span className="rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold px-2.5 py-0.5">
              Em Breve
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Em breve você também poderá operar com transportadoras internacionais (Cainiao, Yanwen, YunExpress, 4PX).
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SEÇÃO 3: ORIGEM DO ENVIO */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-6 space-y-4 shadow-xl">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              Origem do Envio
            </h2>
            <p className="text-xs text-slate-400">
              Defina o centro de distribuição inicial de onde as mercadorias saem no rastreio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cidade</label>
              <input
                type="text"
                value={config.originCity}
                onChange={(e) => setConfig({ ...config, originCity: e.target.value })}
                placeholder="Ex: Cajamar"
                className="w-full rounded-xl border border-slate-800 bg-navy-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">UF</label>
              <select
                value={config.originState}
                onChange={(e) => setConfig({ ...config, originState: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-navy-950 px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES', 'AM', 'PA', 'MT', 'MS'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEÇÃO 4: PRAZO DE ENTREGA */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-6 space-y-5 shadow-xl">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              Prazo de Entrega
            </h2>
            <p className="text-xs text-slate-400">
              Ajuste a estimativa e o espaçamento dos eventos na linha do tempo.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Dias úteis para entrega:</label>
              <span className="font-mono font-black text-brand-400 bg-brand-500/10 px-3 py-1 rounded-lg border border-brand-500/30 text-xs">
                {config.deliveryDays} dias úteis
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              value={config.deliveryDays}
              onChange={(e) => setConfig({ ...config, deliveryDays: parseInt(e.target.value) || 15 })}
              className="w-full h-2 bg-navy-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Prazo estendido callout */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>⏳ Prazo de entrega estendido</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              A rota de rastreio é distribuída ao longo de todo esse prazo — o objeto só chega ao destino perto do fim dos {config.deliveryDays} dias.
            </p>
          </div>

          {/* Toggle Exibir data prevista */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <div className="font-bold text-xs text-white">Exibir data prevista de entrega</div>
              <div className="text-[11px] text-slate-400">O cliente vê a estimativa de entrega na página de rastreio.</div>
            </div>

            <button
              type="button"
              onClick={() => setConfig({ ...config, showEstimatedDate: !config.showEstimatedDate })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                config.showEstimatedDate ? 'bg-brand-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.showEstimatedDate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEÇÃO 5: TEMPO DE PROCESSAMENTO */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-6 space-y-4 shadow-xl">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Tempo de Processamento
            </h2>
            <p className="text-xs text-slate-400">
              Tempo simulado entre a confirmação do pagamento e a postagem do objeto.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: '2h', label: '2h', sub: 'Expresso', desc: 'Despacho rápido' },
              { id: '4h', label: '4h', sub: 'Padrão', desc: 'Recomendado' },
              { id: '8h', label: '8h', sub: 'Normal', desc: 'Fila comum' },
              { id: '12h', label: '12h', sub: 'Frete Grátis', desc: 'Econômico' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setConfig({ ...config, processingTime: item.id as any })}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  config.processingTime === item.id
                    ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg'
                    : 'border-slate-800 bg-navy-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-lg font-black text-white">{item.label}</div>
                <div className="text-xs font-bold text-brand-300 mt-0.5">{item.sub}</div>
                <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEÇÃO 6: TENTATIVAS DE ENTREGA */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-6 space-y-4 shadow-xl">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-400" />
              Tentativas de Entrega
            </h2>
            <p className="text-xs text-slate-400">
              Configura se o rastreio deve simular tentativas de entrega antes da conclusão.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: '0', label: 'Desativado', desc: 'Nenhuma tentativa (entrega direta)' },
              { id: '1', label: '1 Tentativa', desc: 'Uma nova tentativa de entrega' },
              { id: '2', label: '2 Tentativas', desc: 'Duas tentativas automáticas' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setConfig({ ...config, deliveryAttempts: item.id as any })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  config.deliveryAttempts === item.id
                    ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg'
                    : 'border-slate-800 bg-navy-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white">{item.label}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEÇÃO 7: RESULTADO FINAL DO PEDIDO */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-6 space-y-4 shadow-xl">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Resultado Final do Pedido
            </h2>
            <p className="text-xs text-slate-400">
              Status final atribuído aos pacotes que completam a linha do tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'delivered', label: 'Entregue', desc: 'Pedido entregue com sucesso', icon: CheckCircle2, color: 'text-emerald-400' },
              { id: 'returned', label: 'Devolvido', desc: 'Retornado à origem', icon: RotateCcw, color: 'text-amber-400' },
              { id: 'lost', label: 'Extraviado', desc: 'Objeto extraviado', icon: PackageX, color: 'text-rose-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setConfig({ ...config, finalOutcome: item.id as any })}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3 ${
                    config.finalOutcome === item.id
                      ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg'
                      : 'border-slate-800 bg-navy-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color} shrink-0 mt-0.5`} />
                  <div>
                    <div className="font-bold text-xs text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end pt-3">
          <button
            type="submit"
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-600 via-blue-600 to-sky-500 px-8 py-3.5 text-xs font-bold text-white shadow-xl shadow-brand-600/30 hover:scale-[1.02] transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Parâmetros Operacionais</span>
          </button>
        </div>
      </form>
    </div>
  );
};
