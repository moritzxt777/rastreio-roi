import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { lookupShipment } from '../../services/shipmentLookup.service';
import { Shipment, TrackingEvent } from '../../types';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Plane, 
  ShieldCheck, 
  CheckCircle2, 
  Globe2, 
  ArrowRight,
  PackageCheck,
  Building
} from 'lucide-react';

export const CainiaoPortalView: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { shipments } = useApp();

  const [inputCode, setInputCode] = useState(code || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = '/cainiao-favicon.png';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  const cleanCode = (code || '').trim().toUpperCase().replace(/\s+/g, '');

  useEffect(() => {
    let isMounted = true;
    if (!cleanCode) {
      setShipment(null);
      setSearched(false);
      return;
    }

    setSearched(true);
    setLoading(true);

    lookupShipment(cleanCode, shipments)
      .then((data) => {
        if (isMounted) {
          setShipment(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setShipment(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cleanCode, shipments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputCode.trim().toUpperCase().replace(/\s+/g, '');
    if (query) {
      if (window.location.pathname.startsWith('/cainiao')) {
        navigate(`/cainiao/rastreamento/${query}`);
      } else {
        navigate(`/rastreamento/${query}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-[#1E293B] font-sans flex flex-col justify-between">
      <Helmet>
        <title>{shipment ? `Cainiao Global Tracking - ${shipment.code}` : 'CAINIAO Global Order Tracking'}</title>
        <meta name="description" content="Track your international package from China to Brazil in real time with Cainiao Global Logistics Network." />
      </Helmet>

      {/* CAINIAO HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/cainiao" className="flex items-center space-x-2">
            {/* Cainiao Bird Vector Mark */}
            <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white font-black text-sm shadow">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#0066FF]">CAINIAO</span>
                <span className="text-[10px] bg-[#FF6B00] text-white px-1.5 py-0.2 rounded font-bold uppercase">GLOBAL</span>
              </div>
              <span className="text-[9px] text-gray-400 block -mt-1 font-medium">Alibaba Group Logistics</span>
            </div>
          </Link>

          <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
            <span className="hidden sm:inline text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Despacho Aduaneiro Seguro</span>
            </span>
            <div className="text-gray-400">🇧🇷 Português / EN</div>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#0A2540] text-white py-10 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-blue-200 border border-white/20">
            <Plane className="w-3.5 h-3.5" />
            <span>Rastreamento Internacional Expresso • China ➔ Brasil</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Acompanhe seu Pacote Internacional
          </h1>
          <p className="text-xs text-blue-100 max-w-lg mx-auto">
            Consulte o trajeto aéreo do seu pedido, liberação na alfândega e entrega na sua residência.
          </p>

          <form onSubmit={handleSearch} className="max-w-lg mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1.5 rounded-2xl shadow-2xl">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Código internacional (Ex: LP001928374BR ou CN...)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 uppercase rounded-xl focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#FF6B00] hover:bg-[#E05E00] text-white px-6 py-2.5 text-xs font-bold rounded-xl transition active:scale-95 shadow"
              >
                Rastrear
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* TRACKING DETAILS CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 space-y-3">
            <div className="w-10 h-10 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Buscando na malha aérea internacional Cainiao Network...</p>
          </div>
        )}

        {!loading && searched && !shipment && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200 space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0066FF] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Remessa Não Localizada</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Não encontramos registro internacional para o código <strong className="text-[#0066FF] font-mono">{cleanCode}</strong>.
              </p>
            </div>
          </div>
        )}

        {!loading && shipment && (
          <div className="space-y-6">
            {/* International Route Banner */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#0066FF] px-2 py-0.5 rounded">
                      Cainiao Super Economy
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Order #{shipment.orderNumber}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0066FF] font-mono mt-1">{shipment.code}</h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block font-medium">Estimated Delivery Date</span>
                  <span className="text-sm font-bold text-gray-800 flex items-center sm:justify-end gap-1">
                    <Calendar className="w-4 h-4 text-[#0066FF]" />
                    {shipment.estimatedDeliveryDate}
                  </span>
                </div>
              </div>

              {/* Cross-border Flight Steps Visualizer */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-1 text-[#0066FF]">
                    <span>🇨🇳 China</span>
                  </span>
                  <Plane className="w-4 h-4 text-[#0066FF] animate-pulse" />
                  <span className="text-gray-700">🇧🇷 Alfândega Brasil</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-emerald-600 font-extrabold">{shipment.destinationCity}</span>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0066FF] via-[#FF6B00] to-emerald-500 w-3/4 rounded-full" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pt-1">
                  <span>Origem: Centro Logístico Shenzhen</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                    ✓ Fiscalização Concluída / Sem Taxas
                  </span>
                  <span>Destino: {shipment.destinationCity} - {shipment.destinationState}</span>
                </div>
              </div>

              {/* Recipient Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium block">Destinatário (Consignee):</span>
                  <span className="font-bold text-gray-800 text-sm mt-0.5 block">{shipment.customerName}</span>
                  <span className="text-gray-500 text-[11px] block">{shipment.destinationCity} - {shipment.destinationState}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium block">Linha de Transporte (Carrier):</span>
                  <span className="font-bold text-gray-800 text-sm mt-0.5 block">Cainiao Global Express Line</span>
                  <span className="text-gray-500 text-[11px] block">Parceria Logística com Correios Brasil</span>
                </div>
              </div>
            </div>

            {/* International Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#0066FF]" />
                Histórico de Rastreio Internacional
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {shipment.events.map((evt: TrackingEvent, idx: number) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={evt.id || idx} className="relative">
                      <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isLatest ? 'bg-[#0066FF] text-white shadow' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className={`font-bold ${isLatest ? 'text-[#0066FF] text-sm' : 'text-gray-800'}`}>
                            {evt.title}
                          </span>
                          <span className="text-gray-400 text-[11px] font-mono">
                            {evt.date} às {evt.time}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {evt.description}
                        </p>

                        <div className="flex items-center space-x-1 text-[11px] text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>{evt.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 text-gray-500 text-xs py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-black text-[#0066FF] text-base">CAINIAO</span>
            <span className="text-gray-400">• Alibaba Group Global Logistics</span>
          </div>
          <p>© 2026 Cainiao Network Technology Co., Ltd. • All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
