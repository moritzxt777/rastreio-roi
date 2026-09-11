import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WidgetSettings } from '../../types';
import { 
  Code2, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Save, 
  CheckCircle2,
  Truck
} from 'lucide-react';

export const WidgetView: React.FC = () => {
  const { widgetSettings, updateWidgetSettings, openPublicTracking, shipments } = useApp();

  const [settings, setSettings] = useState<WidgetSettings>(widgetSettings);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testInput, setTestInput] = useState(shipments[0]?.code || 'NL192837465BR');

  const handleSave = () => {
    updateWidgetSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const iframeSnippet = `<div id="rastreio-widget"></div>
<script src="${window.location.origin}/widget.js" 
  data-color="${settings.primaryColor}" 
  data-theme="dark" 
  data-title="${settings.customTitle}"
  async>
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand-400" />
            Widget de Rastreio para Lojas Virtuais
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Incorpore um campo de rastreamento moderno dentro da sua loja Shopify, Yampi, CartPanda, Nuvemshop ou Landing Page.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-brand-400 transition flex items-center gap-1.5 shadow"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Estilo</span>
        </button>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurações do widget salvas!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Personalização Visual</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Título Principal</label>
            <input
              type="text"
              value={settings.customTitle}
              onChange={(e) => setSettings({ ...settings, customTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subtítulo / Instrução</label>
            <input
              type="text"
              value={settings.customSubtitle}
              onChange={(e) => setSettings({ ...settings, customSubtitle: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Texto do Botão</label>
              <input
                type="text"
                value={settings.buttonText}
                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cor Primária (Hex)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-800 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Embed code snippet */}
          <div className="space-y-1.5 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Código de Incorporação (HTML/JS):</label>
              <button
                onClick={handleCopyCode}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-brand-300 overflow-x-auto">
              {iframeSnippet}
            </pre>
          </div>
        </div>

        {/* Live Interactive Sandbox Preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-400" /> Pré-visualização na Loja
          </h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 font-bold" style={{ backgroundColor: settings.primaryColor }}>
              <Truck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{settings.customTitle}</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">{settings.customSubtitle}</p>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder={settings.placeholderText}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => openPublicTracking(testInput)}
                className="w-full rounded-xl py-2.5 text-xs font-bold text-slate-950 shadow-md transition"
                style={{ backgroundColor: settings.primaryColor }}
              >
                {settings.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
