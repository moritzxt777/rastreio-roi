import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UpsellConfig } from '../../types';
import { 
  TrendingUp, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  DollarSign
} from 'lucide-react';

export const UpsellSettingsView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { upsellConfig, updateUpsellConfig, openPublicTracking, shipments } = useApp();

  const [config, setConfig] = useState<UpsellConfig>(upsellConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUpsellConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddProduct = () => {
    const newProd = {
      id: `prod_${Date.now()}`,
      name: 'Novo Produto em Oferta',
      originalPrice: 199.90,
      discountPrice: 99.90,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
      checkoutUrl: 'https://checkout.sualoja.com/oferta',
      badge: 'OFERTA LIMITADA'
    };
    setConfig({
      ...config,
      products: [...config.products, newProd]
    });
  };

  const handleRemoveProduct = (id: string) => {
    setConfig({
      ...config,
      products: config.products.filter(p => p.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Configurador de ROI & Upsell no Rastreio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transforme sua página de rastreamento em um canal de recompra oferecendo cupons e produtos adicionais.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {shipments.length > 0 && (
            <button
              onClick={() => openPublicTracking(shipments[0].code)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver Página ao Vivo</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurações de Upsell e ROI salvas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Banner & Coupon settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Ativar Módulo de ROI na Página de Rastreio</h2>
              <p className="text-xs text-slate-400 mt-0.5">Exibir cupom de desconto e produtos recomendados aos clientes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Banner & Coupon */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Banner de Cupom de Desconto</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Banner</label>
                <input
                  type="text"
                  value={config.bannerTitle}
                  onChange={(e) => setConfig({ ...config, bannerTitle: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Código do Cupom</label>
                <input
                  type="text"
                  value={config.couponCode}
                  onChange={(e) => setConfig({ ...config, couponCode: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subtítulo / Mensagem de Incentivo</label>
              <input
                type="text"
                value={config.bannerSubtitle}
                onChange={(e) => setConfig({ ...config, bannerSubtitle: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Products List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Produtos de Upsell na Página</h3>
              <button
                type="button"
                onClick={handleAddProduct}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Produto
              </button>
            </div>

            <div className="space-y-3">
              {config.products.map((p, idx) => (
                <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Produto #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(p.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Nome do Produto</label>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...config.products];
                          updated[idx].name = e.target.value;
                          setConfig({ ...config, products: updated });
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Selo / Badge</label>
                      <input
                        type="text"
                        value={p.badge || ''}
                        onChange={(e) => {
                          const updated = [...config.products];
                          updated[idx].badge = e.target.value;
                          setConfig({ ...config, products: updated });
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Preço Normal (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={p.originalPrice}
                        onChange={(e) => {
                          const updated = [...config.products];
                          updated[idx].originalPrice = parseFloat(e.target.value) || 0;
                          setConfig({ ...config, products: updated });
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Preço c/ Desconto (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={p.discountPrice}
                        onChange={(e) => {
                          const updated = [...config.products];
                          updated[idx].discountPrice = parseFloat(e.target.value) || 0;
                          setConfig({ ...config, products: updated });
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Link de Checkout / Loja</label>
                      <input
                        type="text"
                        value={p.checkoutUrl}
                        onChange={(e) => {
                          const updated = [...config.products];
                          updated[idx].checkoutUrl = e.target.value;
                          setConfig({ ...config, products: updated });
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Support WhatsApp Settings */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">WhatsApp de Suporte no Rastreio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Botão flutuante que reduz em até 80% as reclamações no Reclame Aqui e Procon ao oferecer suporte rápido.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número do WhatsApp (com DDI + DDD)</label>
              <input
                type="text"
                placeholder="5511999998888"
                value={config.supportWhatsApp}
                onChange={(e) => setConfig({ ...config, supportWhatsApp: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Texto de Apoio</label>
              <textarea
                rows={3}
                value={config.supportText}
                onChange={(e) => setConfig({ ...config, supportText: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
