import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { getStatusDetails } from '../../utils/generators';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  ShoppingBag, 
  MessageCircle, 
  ArrowLeft,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Home
} from 'lucide-react';

export const PublicTrackingView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { shipments, upsellConfig, recordUpsellClick, recordUpsellConversions } = useApp() as any;

  const [searchCode, setSearchCode] = useState(code || '');
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<string | null>(null);

  // Exact lookup: NO FALLBACK || shipments[0]
  const cleanCode = (code || '').trim().toUpperCase();
  const shipment = shipments.find(
    (s: any) => s.code.toUpperCase() === cleanCode || s.orderNumber.toUpperCase() === cleanCode
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/r/${searchCode.trim().toUpperCase()}`);
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(upsellConfig.couponCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleProductClick = (prodId: string) => {
    if (shipment) {
      if (recordUpsellClick) recordUpsellClick(shipment.id);
      if (recordUpsellConversions) recordUpsellConversions(shipment.id);
    }
    setPurchasedProduct(prodId);
    setTimeout(() => setPurchasedProduct(null), 3000);
  };

  // =========================================================================
  // 404 NOT FOUND STATE (Quando o código não existe)
  // =========================================================================
  if (!shipment) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
        <Helmet>
          <title>Objeto Não Encontrado | Rastreamento Oficial</title>
          <meta name="description" content="O código de rastreamento digitado não foi localizado em nossa base de dados." />
        </Helmet>

        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
                <Truck className="h-5 w-5" />
              </div>
              <span className="font-black text-sm text-white">RASTREAMENTO OFICIAL</span>
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">Objeto Não Encontrado</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Não encontramos nenhum envio registrado com o código <code className="text-amber-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded">{code || 'NULO'}</code>.
              Verifique se digitou todos os caracteres corretamente ou tente consultar pelo número do pedido.
            </p>
          </div>

          <form onSubmit={handleSearch} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Digitar outro código..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white uppercase focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shrink-0"
              >
                Buscar
              </button>
            </div>
          </form>

          <div className="pt-4 flex justify-center space-x-3">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </Link>
          </div>
        </main>

        <footer className="border-t border-slate-900 p-4 text-center text-[11px] text-slate-600">
          Central de Rastreamento de Encomendas • Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  const statusInfo = getStatusDetails(shipment.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <Helmet>
        <title>{`Rastreio ${shipment.code} | Status: ${statusInfo.label}`}</title>
        <meta name="description" content={`Acompanhe o status do pedido #${shipment.orderNumber} (${shipment.code}) destinado a ${shipment.destinationCity}-${shipment.destinationState}.`} />
        <meta property="og:title" content={`Rastreio ${shipment.code} - ${statusInfo.label}`} />
        <meta property="og:description" content={`Entrega prevista para ${shipment.estimatedDeliveryDate}. Acompanhe em tempo real.`} />
      </Helmet>

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-tight text-white">RASTREAMENTO OFICIAL</span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">VERIFICADO</span>
              </div>
              <p className="text-[10px] text-slate-400">Sistema Integrado de Logística e Entregas</p>
            </div>
          </Link>

          <Link
            to="/orders"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Painel</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Search Bar on Tracking Page */}
        <form onSubmit={handleSearch} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-md">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Rastrear outro código (Ex: NL123456789BR ou #Pedido)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white uppercase placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shrink-0 shadow flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Consultar</span>
            </button>
          </div>
        </form>

        {/* Main Status & Order Header Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                  {shipment.carrier === 'correios' ? 'CORREIOS BRASIL' : shipment.carrier.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-medium">Pedido #{shipment.orderNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider">
                {shipment.code}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Destinatário: <strong className="text-slate-200">{shipment.customerName}</strong>
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border shadow-sm ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <p className="text-xs text-slate-400">
                Previsão de Entrega: <strong className="text-amber-300 font-semibold">{shipment.estimatedDeliveryDate}</strong>
              </p>
            </div>
          </div>

          {/* Stepper / Timeline Bar */}
          <div className="py-3">
            <div className="grid grid-cols-4 gap-2 relative">
              {[
                { label: 'Postado', step: 1, desc: 'Objeto Recebido' },
                { label: 'Em Trânsito', step: 2, desc: 'Em Transferência' },
                { label: 'Saiu p/ Entrega', step: 3, desc: 'Com o Carteiro' },
                { label: 'Entregue', step: 4, desc: 'Finalizado' }
              ].map((s, idx) => {
                const isPassed = statusInfo.step >= s.step;
                const isCurrent = statusInfo.step === s.step;
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed 
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}>
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                    </div>
                    <span className={`text-xs mt-2 font-bold ${isPassed ? 'text-white' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:block">
                      {s.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Origin & Destination Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Origem do Pacote</span>
                <p className="font-semibold text-slate-200">{shipment.originCity} - {shipment.originState}</p>
                <p className="text-[10px] text-slate-500">Centro de Distribuição Integrado</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Endereço de Entrega</span>
                <p className="font-semibold text-white">{shipment.destinationCity} - {shipment.destinationState}</p>
                <p className="text-[10px] text-slate-400">CEP: {shipment.destinationZip || '01001-000'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ROI / UPSELL SECTION */}
        {upsellConfig.enabled && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-5 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 text-[10px] font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PRESENTE EXCLUSIVO DO LOJISTA</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {upsellConfig.bannerTitle}
                  </h2>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    {upsellConfig.bannerSubtitle}
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 border border-amber-500/50 rounded-2xl p-2.5 shrink-0 shadow-inner">
                  <div className="px-3 text-center">
                    <span className="text-[9px] uppercase font-black text-amber-400 block tracking-wider">CUPOM VIP</span>
                    <span className="font-mono font-black text-white text-base tracking-widest">{upsellConfig.couponCode}</span>
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow"
                  >
                    {copiedCoupon ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCoupon ? 'Copiado!' : 'Copiar Cupom'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Products Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  Aproveite o mesmo frete e adicione ao seu pedido:
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Desconto VIP Aplicado
                </span>
              </div>

              {purchasedProduct && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 text-center font-bold animate-bounce shadow">
                  🎉 Redirecionando para o checkout com cupom {upsellConfig.couponCode} aplicado!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {upsellConfig.products.map((prod: any) => (
                  <div key={prod.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 hover:bg-slate-900 transition duration-200 group shadow-md">
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden h-36 bg-slate-950">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {prod.badge && (
                          <span className="absolute top-2 left-2 rounded-md bg-rose-600 px-2 py-0.5 text-[9px] font-black text-white uppercase shadow-md">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-slate-200 line-clamp-2 leading-snug group-hover:text-emerald-300 transition">
                        {prod.name}
                      </h4>

                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs text-slate-500 line-through">
                          R$ {prod.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          R$ {prod.discountPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleProductClick(prod.id)}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Comprar com Desconto</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Timeline Events */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Histórico Completo de Rastreamento
            </h3>
            <span className="text-[11px] text-slate-400">
              {shipment.events.length} atualizações registradas
            </span>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 space-y-7 pl-6 py-2">
            {shipment.events.map((evt: any, idx: number) => {
              const isFirst = idx === 0;
              return (
                <div key={evt.id || idx} className="relative group">
                  <div className={`absolute -left-[33px] top-0 h-4 w-4 rounded-full border-2 border-slate-950 transition-all ${
                    isFirst ? 'bg-amber-400 ring-4 ring-amber-500/20' : 'bg-slate-700'
                  }`} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className={`text-xs font-bold ${isFirst ? 'text-amber-300 text-sm' : 'text-slate-300'}`}>
                      {evt.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {evt.date} às {evt.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/60 w-fit px-2.5 py-1 rounded-lg border border-slate-800/80">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>Unidade: <strong className="text-slate-300">{evt.location}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Box */}
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-lg">
          <div className="flex items-center space-x-3.5 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Precisa de ajuda com a sua entrega?</p>
              <p className="text-slate-400 mt-0.5 leading-relaxed">{upsellConfig.supportText}</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${upsellConfig.supportWhatsApp}?text=Ol%C3%A1%2C%20gostaria%20de%20ajuda%20com%20meu%20rastreio%20${shipment.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shrink-0 flex items-center space-x-2 shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chamar no WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  );
};
