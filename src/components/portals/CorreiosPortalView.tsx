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
  Package, 
  Truck, 
  CheckCircle2, 
  PhoneCall, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const CorreiosPortalView: React.FC = () => {
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
    link.href = '/correios-favicon.png';
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
      if (window.location.pathname.startsWith('/correios')) {
        navigate(`/correios/rastreamento/${query}`);
      } else {
        navigate(`/rastreamento/${query}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1E293B] font-sans flex flex-col justify-between">
      <Helmet>
        <title>{shipment ? `Rastreamento Correios - ${shipment.code}` : 'Correios - Rastreamento de Objetos'}</title>
        <meta name="description" content="Acompanhe a entrega do seu pacote em tempo real pelo sistema de rastreamento oficial dos Correios." />
      </Helmet>

      {/* TOP STRIP & CORREIOS HEADER */}
      <div>
        <div className="bg-[#002D56] text-white text-[11px] py-1 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="font-semibold text-white/90">Portal Oficial dos Correios • Brasil</span>
            <div className="flex items-center space-x-4">
              <a href="https://faleconosco.correios.com.br" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#FFE600]" />
                <span>Fale Conosco</span>
              </a>
              <span className="text-white/40">|</span>
              <span className="font-mono text-[#FFE600]">0800 725 0100</span>
            </div>
          </div>
        </div>

        <header className="bg-[#00416B] border-b-4 border-[#FFE600] text-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/correios" className="flex items-center space-x-3">
              {/* Official Correios Vector Mark */}
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-lg bg-[#FFE600] flex items-center justify-center font-black text-[#00416B] text-lg shadow-inner">
                  <span className="tracking-tighter">C</span>
                </div>
                <div>
                  <span className="font-black text-xl tracking-tight text-white block leading-none">CORREIOS</span>
                  <span className="text-[10px] text-[#FFE600] font-bold tracking-widest uppercase">SRO • Rastreamento</span>
                </div>
              </div>
            </Link>

            <nav className="hidden sm:flex items-center space-x-6 text-xs font-semibold">
              <Link to="/correios" className="text-[#FFE600] font-bold border-b-2 border-[#FFE600] pb-0.5">Rastrear Objeto</Link>
              <a href="https://www.correios.com.br/enviar" target="_blank" rel="noreferrer" className="text-white/90 hover:text-white transition">Preços e Prazos</a>
              <a href="https://buscacepinter.correios.com.br" target="_blank" rel="noreferrer" className="text-white/90 hover:text-white transition">Busca CEP</a>
              <a href="https://www.correios.com.br/atendimento" target="_blank" rel="noreferrer" className="text-white/90 hover:text-white transition">Agências</a>
            </nav>
          </div>
        </header>

        {/* BREADCRUMB */}
        <div className="bg-white border-b border-gray-200 py-2.5 px-4 text-xs text-gray-500">
          <div className="max-w-5xl mx-auto flex items-center space-x-1.5">
            <Link to="/correios" className="hover:text-[#00416B]">Início</Link>
            <span>&gt;</span>
            <span className="text-gray-400">Rastreamento de Objetos</span>
            {cleanCode && (
              <>
                <span>&gt;</span>
                <span className="font-mono font-bold text-[#00416B]">{cleanCode}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BANNER */}
      <section className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <h1 className="text-xl sm:text-2xl font-black text-[#00416B]">
            Rastreamento de Objetos
          </h1>
          <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
            Acompanhe em tempo real a rota do seu objeto postal (SEDEX, PAC ou Encomenda Internacional).
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Código do objeto (ex: NL123456789BR ou nº do pedido)"
                  className="w-full pl-9 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 uppercase rounded-lg border border-gray-300 focus:border-[#00416B] focus:outline-none shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#FFE600] hover:bg-[#F2DA00] text-[#00416B] px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition active:scale-95 shadow flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* MAIN TRACKING RESULTS */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {loading && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200 space-y-3">
            <div className="w-10 h-10 border-4 border-[#00416B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-600 font-semibold">Consultando base de dados do Sistema de Rastreamento de Objetos (SRO)...</p>
          </div>
        )}

        {!loading && searched && !shipment && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-red-200 space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Objeto não encontrado</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                O código <strong className="font-mono text-[#00416B]">{cleanCode}</strong> não foi localizado na base dos Correios. Verifique os dados digitados e tente novamente.
              </p>
            </div>
          </div>
        )}

        {!loading && shipment && (
          <div className="space-y-5">
            {/* Object Header Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#00416B] text-[#FFE600] font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                      SEDEX NACIONAL
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Pedido #{shipment.orderNumber}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#00416B] font-mono mt-1 tracking-wider">
                    {shipment.code}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block font-medium">Previsão Estimada de Entrega</span>
                  <span className="text-sm font-black text-[#00416B] flex items-center sm:justify-end gap-1">
                    <Calendar className="w-4 h-4 text-[#00416B]" />
                    {shipment.estimatedDeliveryDate}
                  </span>
                </div>
              </div>

              {/* Sender & Receiver Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200/80">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Destinatário:</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">{shipment.customerName}</span>
                  <span className="text-gray-600 block text-xs">{shipment.destinationCity} - {shipment.destinationState}</span>
                  <span className="text-gray-400 text-[11px] block">CEP: {shipment.destinationZip || '01000-000'}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200/80">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Origem do Envio:</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">Centro de Distribuição dos Correios</span>
                  <span className="text-gray-600 block text-xs">{shipment.originCity} - {shipment.originState}</span>
                  <span className="text-gray-400 text-[11px] block">Unidade de Tratamento Operacional</span>
                </div>
              </div>
            </div>

            {/* Timeline Events */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-black text-sm text-[#00416B] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#00416B]" />
                  <span>Histórico de Movimentação do Objeto</span>
                </h3>
                <span className="text-[11px] font-semibold text-gray-500">
                  {shipment.events.length} atualizações registradas
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {shipment.events.map((evt: TrackingEvent, idx: number) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={evt.id || idx} className="relative">
                      <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isLatest ? 'bg-[#00416B] text-[#FFE600] shadow' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-[#FFE600]' : 'bg-white'}`} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className={`font-bold ${isLatest ? 'text-[#00416B] text-sm' : 'text-gray-800'}`}>
                            {evt.title}
                          </span>
                          <span className="text-gray-400 text-[11px] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {evt.date} às {evt.time}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {evt.description}
                        </p>

                        <div className="flex items-center space-x-1 text-[11px] text-gray-500 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#00416B]" />
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

      {/* CORREIOS FOOTER */}
      <footer className="bg-[#00416B] text-white/80 text-xs py-8 px-4 border-t-4 border-[#FFE600]">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded bg-[#FFE600] text-[#00416B] flex items-center justify-center font-black text-sm">
                C
              </div>
              <span className="font-black text-white text-base">Correios</span>
            </div>

            <div className="flex items-center space-x-6 text-[11px] text-white/70">
              <a href="https://www.correios.com.br" target="_blank" rel="noreferrer" className="hover:text-white">Portal Correios</a>
              <a href="https://rastreamento.correios.com.br" target="_blank" rel="noreferrer" className="hover:text-white">Rastreamento SRO</a>
              <a href="https://www.correios.com.br/politica-de-privacidade" target="_blank" rel="noreferrer" className="hover:text-white">Privacidade</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/60 gap-2 text-center sm:text-left">
            <p>© 2026 Empresa Brasileira de Correios e Telégrafos • Todos os direitos reservados.</p>
            <p className="font-mono">Central de Atendimento: 0800 725 0100</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
