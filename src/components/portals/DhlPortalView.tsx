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
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Truck,
  ExternalLink
} from 'lucide-react';

export const DhlPortalView: React.FC = () => {
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
    link.href = '/dhl-favicon.png';
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
      if (window.location.pathname.startsWith('/dhl')) {
        navigate(`/dhl/rastreamento/${query}`);
      } else {
        navigate(`/rastreamento/${query}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans flex flex-col justify-between">
      <Helmet>
        <title>{shipment ? `DHL Express Tracking - ${shipment.code}` : 'DHL Express | Rastreamento Global'}</title>
        <meta name="description" content="Acompanhe sua remessa expressa prioritária em tempo real com a rede global DHL Express." />
      </Helmet>

      {/* DHL YELLOW & RED HEADER */}
      <header className="bg-[#FFCC00] border-b-2 border-[#D40511] shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dhl" className="flex items-center space-x-3">
            {/* DHL Vector Logo Typography */}
            <div className="flex items-center space-x-1">
              <span className="text-[#D40511] font-black italic text-3xl tracking-tighter">DHL</span>
              <span className="text-black font-extrabold text-sm uppercase tracking-wider pl-1.5 border-l-2 border-black/20">
                EXPRESS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider text-black">
            <Link to="/dhl" className="text-[#D40511] border-b-2 border-[#D40511] pb-0.5">Rastrear Envio</Link>
            <a href="https://www.dhl.com" target="_blank" rel="noreferrer" className="hover:text-[#D40511] transition">Serviços</a>
            <a href="https://mydhl.express.dhl" target="_blank" rel="noreferrer" className="hover:text-[#D40511] transition">Portal MyDHL+</a>
            <a href="https://www.dhl.com/br-pt/home/contato.html" target="_blank" rel="noreferrer" className="hover:text-[#D40511] transition">Atendimento</a>
          </nav>
        </div>
      </header>

      {/* SEARCH SECTION */}
      <section className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 rounded bg-[#D40511]/10 px-2.5 py-0.5 text-[11px] font-black text-[#D40511] uppercase tracking-wider">
            <span>DHL Express Worldwide</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Rastreamento de Carga Expressa
          </h1>
          <p className="text-xs text-gray-600 max-w-xl">
            Insira o número do conhecimento aéreo (AWB) de 10 dígitos para visualizar o status detalhado da rota.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Número de rastreamento (10 dígitos)"
                  className="w-full pl-9 pr-4 py-3 text-xs text-black uppercase font-mono font-bold rounded-lg border-2 border-gray-300 focus:border-[#D40511] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#D40511] hover:bg-[#B3040E] text-white px-7 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition active:scale-95 shadow"
              >
                Rastrear
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* TRACKING BODY */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200 space-y-3">
            <div className="w-10 h-10 border-4 border-[#D40511] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-600 font-bold">Consultando servidores globais DHL Express...</p>
          </div>
        )}

        {!loading && searched && !shipment && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-200 space-y-4">
            <div className="w-12 h-12 bg-red-50 text-[#D40511] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Remessa Não Encontrada</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Nenhum envio registrado com o código <strong className="font-mono text-[#D40511]">{cleanCode}</strong>.
              </p>
            </div>
          </div>
        )}

        {!loading && shipment && (
          <div className="space-y-6">
            {/* Shipment Summary Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D40511] block">
                    Conhecimento de Transporte Aéreo (AWB)
                  </span>
                  <h2 className="text-2xl font-black text-black font-mono mt-0.5">{shipment.code}</h2>
                  <span className="text-xs text-gray-500">Referência do Cliente: #{shipment.orderNumber}</span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block font-medium">Data Prevista de Entrega</span>
                  <span className="text-sm font-black text-[#D40511] flex items-center sm:justify-end gap-1">
                    <Calendar className="w-4 h-4 text-[#D40511]" />
                    {shipment.estimatedDeliveryDate}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="bg-[#FFF9E6] p-4 rounded-xl border border-[#FFCC00] space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-black">
                  <span>Coleta Efetuada</span>
                  <span>Hub Aéreo</span>
                  <span>Desembaraço</span>
                  <span className="text-[#D40511]">Em Rota de Entrega</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D40511] w-4/5 rounded-full" />
                </div>
              </div>

              {/* Address grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 font-bold block uppercase text-[10px]">Destinatário Final:</span>
                  <span className="font-black text-black text-sm mt-0.5 block">{shipment.customerName}</span>
                  <span className="text-gray-600 block text-xs">{shipment.destinationCity} - {shipment.destinationState}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 font-bold block uppercase text-[10px]">Origem da Carga:</span>
                  <span className="font-black text-black text-sm mt-0.5 block">{shipment.originCity} - {shipment.originState}</span>
                  <span className="text-gray-600 block text-xs">Gateway DHL Express Brasil</span>
                </div>
              </div>
            </div>

            {/* Events Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <h3 className="font-black text-sm text-black uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D40511]" />
                Histórico de Movimentação Expressa
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-yellow-200">
                {shipment.events.map((evt: TrackingEvent, idx: number) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={evt.id || idx} className="relative">
                      <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isLatest ? 'bg-[#D40511] text-white shadow' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className={`font-black ${isLatest ? 'text-[#D40511] text-sm' : 'text-gray-800'}`}>
                            {evt.title}
                          </span>
                          <span className="text-gray-400 text-[11px] font-mono">
                            {evt.date} às {evt.time}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {evt.description}
                        </p>

                        <div className="flex items-center space-x-1 text-[11px] text-gray-500 font-medium">
                          <MapPin className="w-3 h-3 text-[#D40511]" />
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

      {/* DHL FOOTER */}
      <footer className="bg-black text-white/70 text-xs py-8 px-4 border-t-4 border-[#FFCC00]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="text-[#FFCC00] font-black italic text-xl">DHL</span>
            <span className="text-white/40">• Deutsche Post DHL Group</span>
          </div>
          <p>© 2026 DHL International GmbH • Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
