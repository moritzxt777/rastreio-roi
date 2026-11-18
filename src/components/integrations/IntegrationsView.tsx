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
  Server,
  Bot,
  Code2,
  Terminal,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { integrations, createSingleShipment, openPublicTracking, updateIntegrations, widgetSettings, updateWidgetSettings } = useApp();

  const [mainTab, setMainTab] = useState<'api_ai' | 'webhooks'>('api_ai');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [simulatedPlatform, setSimulatedPlatform] = useState('shopify');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [codeSnippetLang, setCodeSnippetLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [aiToolCopied, setAiToolCopied] = useState(false);
  const [aiPromptCopied, setAiPromptCopied] = useState(false);

  // User's own domain / API server host
  const defaultHost = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : 'https://roi-rastreio.site';

  const [apiHost, setApiHost] = useState(defaultHost);
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
      webhookUrl: `${cleanHost}/api/webhooks/${int.platform}`
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

  const aiToolSchema = JSON.stringify({
    name: "consultar_rastreio",
    description: "Consulta o status em tempo real de uma encomenda pelo código de rastreio ou número do pedido.",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Código de rastreio (ex: NL123456789BR) ou número do pedido (ex: 1042 ou #1042)"
        }
      },
      required: ["code"]
    }
  }, null, 2);

  const aiSystemPrompt = `Você é o assistente virtual de suporte da loja. Quando o cliente perguntar sobre a entrega ou onde está o pedido dele:
1. Peça o número do pedido ou código de rastreio se ele ainda não tiver informado.
2. Use a ferramenta "consultar_rastreio" chamando o endpoint: ${apiHost}/api/tracking?code={codigo_ou_pedido}
3. Ao receber o JSON, informe de forma amigável:
   - A etapa atual (ex: Objeto em trânsito, Postado ou Saiu para entrega).
   - A última localização registrada e data/hora.
   - A data prevista de entrega.
   - Forneça o link de rastreamento completo oficial: trackingUrl para ele acompanhar em tempo real.
4. Mantenha um tom profissional, cordial e tranquilizador.`;

  const curlGetExample = `curl -X GET "${apiHost}/api/tracking?code=NL123456789BR" \\
  -H "Accept: application/json"`;

  const curlPostExample = `curl -X POST "${apiHost}/api/tracking" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerName": "Lucas Silva",
    "customerPhone": "11988887777",
    "orderNumber": "#1042",
    "productName": "Tênis Esportivo Ultra",
    "orderValue": 249.90,
    "carrier": "correios",
    "originCity": "Cajamar",
    "originState": "SP",
    "destinationCity": "Belo Horizonte",
    "destinationState": "MG"
  }'`;

  const jsExample = `// 1. Consultar rastreamento (GET)
const response = await fetch('${apiHost}/api/tracking?code=NL123456789BR');
const data = await response.json();
console.log(data.shipment.status, data.shipment.trackingUrl);

// 2. Criar novo rastreamento automaticamente (POST)
const createRes = await fetch('${apiHost}/api/tracking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Lucas Silva',
    orderNumber: '#1042',
    carrier: 'correios',
    destinationCity: 'Belo Horizonte',
    destinationState: 'MG'
  })
});
const newShipment = await createRes.json();
console.log('Código gerado:', newShipment.code, newShipment.trackingUrl);`;

  const pythonExample = `import requests

# 1. Consultar rastreamento (GET)
resp = requests.get("${apiHost}/api/tracking", params={"code": "NL123456789BR"})
dados = resp.json()
print("Status:", dados["shipment"]["status"])
print("Link:", dados["shipment"]["trackingUrl"])

# 2. Criar rastreamento (POST)
payload = {
    "customerName": "Lucas Silva",
    "orderNumber": "#1042",
    "carrier": "correios",
    "destinationCity": "Belo Horizonte",
    "destinationState": "MG"
}
cria_resp = requests.post("${apiHost}/api/tracking", json=payload)
print("Gerado:", cria_resp.json()["code"])`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Integrações, API REST & Inteligência Artificial
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Conecte o rastreamento ao seu site, chatbots de IA (Typebot, WhatsApp, ChatGPT, n8n) ou checkouts automáticos.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMainTab('api_ai')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              mainTab === 'api_ai'
                ? 'bg-brand-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>API REST & IA / Chatbots</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('webhooks')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              mainTab === 'webhooks'
                ? 'bg-brand-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            <span>Webhooks de Checkout</span>
          </button>
        </div>
      </div>

      {mainTab === 'api_ai' ? (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-navy-900 via-slate-900 to-brand-950/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-brand-400">
              <Code2 className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white">API REST Pública & Integração para Robôs de Atendimento</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use estes endpoints para integrar o rastreamento em qualquer página web, aplicativo móvel, script backend ou <strong>agente de inteligência artificial</strong> (ChatGPT Custom GPT, Typebot, n8n, WhatsApp bot). Quando o comprador consulta o rastreio, a API retorna exatamente as informações reais salvas pelo lojista, sem perda de dados.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  GET /api/tracking?code=XYZ
                </span>
                <p className="text-[11px] text-slate-400">
                  Consulta status, etapas, prazos e link do pedido via código ou número da ordem.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                  POST /api/tracking
                </span>
                <p className="text-[11px] text-slate-400">
                  Gera código automaticamente com timeline realista e salva no banco de dados.
                </p>
              </div>
            </div>
          </div>

          {/* AI / Chatbot Integration Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Configuração para IA (Typebot, WhatsApp, n8n, ChatGPT)</h3>
                  <p className="text-[11px] text-slate-400">Ensine sua IA a responder automaticamente sobre o status dos pedidos dos seus clientes.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tool / Function Call Schema */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    Schema de Tool / Função (OpenAI / n8n / Typebot HTTP):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiToolSchema);
                      setAiToolCopied(true);
                      setTimeout(() => setAiToolCopied(false), 2000);
                    }}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                  >
                    {aiToolCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{aiToolCopied ? 'Copiado!' : 'Copiar Schema JSON'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56">
                  <pre>{aiToolSchema}</pre>
                </div>
              </div>

              {/* System Prompt for Chatbot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                    Prompt de Sistema do Agente de IA:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiSystemPrompt);
                      setAiPromptCopied(true);
                      setTimeout(() => setAiPromptCopied(false), 2000);
                    }}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                  >
                    {aiPromptCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{aiPromptCopied ? 'Copiado!' : 'Copiar Prompt'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 whitespace-pre-wrap">
                  {aiSystemPrompt}
                </div>
              </div>
            </div>
          </div>

          {/* Code Snippets Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Exemplos de Código Prontos para Uso</h3>
              </div>

              <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCodeSnippetLang('curl')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition ${
                    codeSnippetLang === 'curl' ? 'bg-brand-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => setCodeSnippetLang('js')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition ${
                    codeSnippetLang === 'js' ? 'bg-brand-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  type="button"
                  onClick={() => setCodeSnippetLang('python')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition ${
                    codeSnippetLang === 'python' ? 'bg-brand-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            {codeSnippetLang === 'curl' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">1. Consultar Encomenda (GET):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(curlGetExample, 'curl_get')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'curl_get' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'curl_get' ? 'Copiado!' : 'Copiar cURL'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                    {curlGetExample}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">2. Criar Nova Encomenda / Rastreamento (POST):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(curlPostExample, 'curl_post')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'curl_post' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'curl_post' ? 'Copiado!' : 'Copiar cURL'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                    {curlPostExample}
                  </pre>
                </div>
              </div>
            )}

            {codeSnippetLang === 'js' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">JavaScript / Fetch (Navegador, Node.js, Next.js, Cloudflare Workers):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(jsExample, 'js_code')}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'js_code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'js_code' ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                  {jsExample}
                </pre>
              </div>
            )}

            {codeSnippetLang === 'python' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Python (Requests):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(pythonExample, 'py_code')}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'py_code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'py_code' ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-amber-300 overflow-x-auto">
                  {pythonExample}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Custom Tracking Portal Configuration */}
          <div className="rounded-2xl border border-brand-500/30 bg-navy-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  URL
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Portal de Rastreamento Oficial dos Clientes</h2>
                  <p className="text-[11px] text-slate-400">Defina o link para onde seus clientes serão direcionados ao clicar no rastreio ou receber no WhatsApp.</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 self-start sm:self-auto">
                Ativo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Loggi */}
              <button
                type="button"
                onClick={() => {
                  updateWidgetSettings({
                    ...widgetSettings,
                    customTrackingDomain: 'https://rastreio-loggi.vercel.app/loggi/rastreamento/{code}'
                  });
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  widgetSettings.customTrackingDomain?.includes('loggi')
                    ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg'
                    : 'border-slate-800 bg-navy-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>Loggi Logística</span>
                    <span className="text-[9px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-mono">Principal</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono break-all">
                    rastreio-loggi.vercel.app/loggi/rastreamento/{'{code}'}
                  </div>
                </div>
                {widgetSettings.customTrackingDomain?.includes('loggi') && (
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                )}
              </button>

              {/* Option 2: JAD Logística */}
              <button
                type="button"
                onClick={() => {
                  updateWidgetSettings({
                    ...widgetSettings,
                    customTrackingDomain: 'https://jadlog-rastreamento.vercel.app/jadlog/rastreamento/{code}'
                  });
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  widgetSettings.customTrackingDomain?.includes('jadlog')
                    ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg'
                    : 'border-slate-800 bg-navy-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>JAD Logística</span>
                    <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono">Expressa</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono break-all">
                    jadlog-rastreamento.vercel.app/jadlog/rastreamento/{'{code}'}
                  </div>
                </div>
                {widgetSettings.customTrackingDomain?.includes('jadlog') && (
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                )}
              </button>

              {/* Option 3: Custom external domain */}
              <button
                type="button"
                onClick={() => {
                  if (!widgetSettings.customTrackingDomain?.startsWith('http') || widgetSettings.customTrackingDomain.includes(defaultHost)) {
                    updateWidgetSettings({
                      ...widgetSettings,
                      customTrackingDomain: 'https://rastreio.sualoja.com.br/rastreamento/{code}'
                    });
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  widgetSettings.customTrackingDomain && !widgetSettings.customTrackingDomain.includes(defaultHost)
                    ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg'
                    : 'border-slate-800 bg-navy-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>Subdomínio Próprio</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">White-label</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono break-all">
                    https://rastreio.sualoja.com.br/...
                  </div>
                </div>
                {widgetSettings.customTrackingDomain && !widgetSettings.customTrackingDomain.includes(defaultHost) && (
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                )}
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Padrão Atual Configurado para Envio aos Clientes:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={widgetSettings.customTrackingDomain || `${defaultHost}/loggi/rastreamento/{code}`}
                  onChange={(e) => {
                    updateWidgetSettings({
                      ...widgetSettings,
                      customTrackingDomain: e.target.value
                    });
                  }}
                  placeholder="https://rastreio-loggi.vercel.app"
                  className="flex-1 rounded-xl border border-slate-800 bg-navy-950 px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
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
                      <button
                        type="button"
                        onClick={() => {
                          const updated = integrations.map(i => i.id === int.id ? { ...i, enabled: !i.enabled } : i);
                          updateIntegrations(updated);
                        }}
                        className={`text-[10px] font-semibold flex items-center gap-1 hover:underline cursor-pointer ${int.enabled ? 'text-emerald-400' : 'text-slate-500'}`}
                      >
                        <span>{int.enabled ? '● Conectado & Ativo' : '○ Desconectado (Clique para ativar)'}</span>
                      </button>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {int.totalOrdersSynced} pedidos sincronizados
                  </span>
                </div>

                {/* Webhook URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400">URL do Webhook (Cole na sua plataforma):</label>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="text"
                      readOnly
                      value={int.webhookUrl || `${defaultHost}/api/webhooks/${int.platform}`}
                      className="w-full bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(int.webhookUrl || `${defaultHost}/api/webhooks/${int.platform}`, `${int.id}_url`)}
                      className="text-slate-500 hover:text-white p-1"
                    >
                      {copiedKey === `${int.id}_url` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Secret Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400">Chave Secreta / Token de Validação:</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomTok = `${int.platform}_sec_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
                        const updated = integrations.map(i => i.id === int.id ? { ...i, webhookSecret: randomTok, enabled: true } : i);
                        updateIntegrations(updated);
                      }}
                      className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold"
                    >
                      Gerar Token Seguro
                    </button>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="text"
                      placeholder="Cole aqui ou clique em Gerar Token"
                      value={int.webhookSecret}
                      onChange={(e) => {
                        const updated = integrations.map(i => i.id === int.id ? { ...i, webhookSecret: e.target.value } : i);
                        updateIntegrations(updated);
                      }}
                      className="w-full bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none"
                    />
                    {int.webhookSecret && (
                      <button
                        type="button"
                        onClick={() => handleCopy(int.webhookSecret, `${int.id}_sec`)}
                        className="text-slate-500 hover:text-white p-1"
                      >
                        {copiedKey === `${int.id}_sec` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
