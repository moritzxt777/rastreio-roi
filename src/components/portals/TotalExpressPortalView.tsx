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
  Truck, 
  CheckCircle2, 
  Package, 
  Building2,
  ExternalLink
} from 'lucide-react';

export const TotalExpressPortalView: React.FC = () => {
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
    link.href = '/totalexpress-favicon.png';
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
      if (window.location.pathname.startsWith('/totalexpress')) {
        navigate(`/totalexpress/rastreamento/${query}`);
      } else {
        navigate(`/rastreamento/${query}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E293B] font-sans flex flex-col justify-between">
      <Helmet>
        <title>{shipment ? `Total Express Tracking - ${shipment.code}` : 'Total Express | Total Track'}</title>
        <meta name="description" content="Acompanhe sua entrega porta a porta com a Total Express em tempo real." />
      </Helmet>

      {/* TOTAL EXPRESS HEADER */}
      <header className="bg-[#002B49] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/totalexpress" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#00A3E0] flex items-center justify-center font-black text-[#002B49] text-base">
              T
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg tracking-tight text-white">TOTAL</span>
                <span className="text-[#00A3E0] font-black text-lg">EXPRESS</span>
              </div>
              <span className="text-[9px] text-gray-300 block -mt-1 font-mono tracking-widest">TOTAL TRACK</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-gray-200">
            <Link to="/totalexpress" className="text-[#00A3E0]">Rastreamento</Link>
            <a href="https://totalexpress.com.br" target="_blank" rel="noreferrer" className="hover:text-white transition">Para E-commerce</a>
            <a href="https://totalexpress.com.br/atendimento" target="_blank" rel="noreferrer" className="hover:text-white transition">Fale Conosco</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-[#002B49] to-[#004B7A] text-white py-10 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Rastreamento de Encomendas
          </h1>
          <p className="text-xs text-blue-100 max-w-lg mx-auto">
            Acompanhe cada etapa da entrega do seu pacote na malha logística da Total Express.
          </p>

          <form onSubmit={handleSearch} className="max-w-lg mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1.5 rounded-2xl shadow-xl">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Número de rastreio ou AWB (Ex: TEX102938475)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 uppercase rounded-xl focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#00A3E0] hover:bg-[#0089BD] text-[#002B49] px-6 py-2.5 text-xs font-black uppercase rounded-xl transition active:scale-95 shadow"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* TRACKING CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 space-y-3">
            <div className="w-10 h-10 border-4 border-[#00A3E0] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Buscando status nos servidores Total Express...</p>
          </div>
        )}

        {!loading && searched && !shipment && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200 space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-[#002B49] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Remessa Não Localizada</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Não localizamos envios com o código <strong className="text-[#00A3E0] font-mono">{cleanCode}</strong>.
              </p>
            </div>
          </div>
        )}

        {!loading && shipment && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Conhecimento AWB Total Express
                  </span>
                  <h2 className="text-2xl font-black text-[#002B49] font-mono mt-0.5">{shipment.code}</h2>
                  <span className="text-xs text-gray-500">Documento / Pedido: #{shipment.orderNumber}</span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block font-medium">Previsão de Entrega</span>
                  <span className="text-sm font-bold text-[#002B49] flex items-center sm:justify-end gap-1">
                    <Calendar className="w-4 h-4 text-[#00A3E0]" />
                    {shipment.estimatedDeliveryDate}
                  </span>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium block">Destinatário:</span>
                  <span className="font-bold text-gray-800 text-sm mt-0.5 block">{shipment.customerName}</span>
                  <span className="text-gray-500 text-[11px] block">{shipment.destinationCity} - {shipment.destinationState}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium block">Origem:</span>
                  <span className="font-bold text-gray-800 text-sm mt-0.5 block">{shipment.originCity} - {shipment.originState}</span>
                  <span className="text-gray-500 text-[11px] block">Centro de Distribuição Barueri / SP</span>
                </div>
              </div>
            </div>

            {/* Events Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00A3E0]" />
                Histórico de Entregas
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {shipment.events.map((evt: TrackingEvent, idx: number) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={evt.id || idx} className="relative">
                      <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isLatest ? 'bg-[#002B49] text-white shadow' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className={`font-bold ${isLatest ? 'text-[#002B49] text-sm' : 'text-gray-800'}`}>
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
                          <MapPin className="w-3 h-3 text-[#00A3E0]" />
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
      <footer className="bg-[#002B49] text-gray-300 text-xs py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-black text-white text-base">TOTAL EXPRESS</span>
            <span className="text-gray-400">• DGS Logística Integrada</span>
          </div>
          <p>© 2026 Total Express • Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
