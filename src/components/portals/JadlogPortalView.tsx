import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Shipment, TrackingEvent } from '../../types';
import { 
  Search, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

export const JadlogPortalView: React.FC = () => {
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
    link.href = '/jadlog-favicon.png';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  const cleanCode = (code || '').trim().toUpperCase();

  useEffect(() => {
    if (!cleanCode) {
      setShipment(null);
      setSearched(false);
      return;
    }

    setSearched(true);
    setLoading(true);

    // 1. Check local shipments
    const local = shipments.find(
      (s) => s.code.toUpperCase() === cleanCode || s.orderNumber.toUpperCase() === cleanCode
    );

    if (local) {
      setShipment(local);
      setLoading(false);
      return;
    }

    // 2. Query Supabase RPC
    if (isSupabaseConfigured()) {
      const fetchRemote = async () => {
        try {
          const { data, error } = await supabase.rpc('get_shipment_by_code', { p_code: cleanCode });
          if (data && !error) {
            setShipment(data as Shipment);
          } else {
            setShipment(null);
          }
        } catch {
          setShipment(null);
        } finally {
          setLoading(false);
        }
      };
      fetchRemote();
    } else {
      setShipment(null);
      setLoading(false);
    }
  }, [cleanCode, shipments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      navigate(`/rastreamento/${inputCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#333333] font-sans flex flex-col justify-between">
      <Helmet>
        <title>{shipment ? `Rastreamento Jadlog - ${shipment.code}` : 'Jadlog - Sua encomenda no melhor caminho'}</title>
        <meta name="description" content="Acompanhe o rastreamento da sua encomenda em tempo real na Jadlog." />
        <link rel="icon" type="image/png" href="/jadlog-favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/jadlog-favicon.png" />
      </Helmet>

      {/* TOP BAR / JADLOG HEADER */}
      <header className="bg-[#E30613] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            {/* Official Jadlog Logo Badge */}
            <div className="bg-white px-3 py-1 rounded font-black tracking-tighter text-xl italic shadow-sm flex items-center space-x-0.5">
              <span className="text-[#E30613]">JAD</span>
              <span className="text-[#0A192F]">LOG</span>
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-white/90 border-l border-white/30 pl-3">
              Sua encomenda no melhor caminho
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider">
            <Link to="/" className="hover:text-white/80 transition">Rastreamento</Link>
            <a href="https://www.jadlog.com.br/jadlog/unidades" target="_blank" rel="noreferrer" className="hover:text-white/80 transition">Unidades</a>
            <a href="https://www.jadlog.com.br/jadlog/servicos" target="_blank" rel="noreferrer" className="hover:text-white/80 transition">Serviços</a>
            <a href="https://www.jadlog.com.br/jadlog/contato" target="_blank" rel="noreferrer" className="hover:text-white/80 transition">Fale Conosco</a>
          </nav>
        </div>
      </header>

      {/* HERO / SEARCH SECTION */}
      <section className="bg-gradient-to-b from-[#E30613] to-[#B8000B] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Rastreie sua encomenda
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto">
            Digite o código de rastreamento ou número da remessa para consultar o status atualizado do seu pacote.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1.5 rounded-xl shadow-2xl">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Ex: 10082349012398 ou NL192837465BR"
                  className="w-full pl-11 pr-4 py-2.5 text-sm text-[#333] placeholder-gray-400 uppercase rounded-lg focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#0A192F] hover:bg-[#122646] text-white px-7 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition active:scale-95 shadow"
              >
                Rastrear
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* MAIN TRACKING CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 space-y-3">
            <div className="w-10 h-10 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Buscando informações da remessa nos servidores Jadlog...</p>
          </div>
        )}

        {!loading && searched && !shipment && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200 space-y-4">
            <div className="w-14 h-14 bg-red-50 text-[#E30613] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Remessa Não Localizada</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Não localizamos nenhuma remessa cadastrada com o código <strong className="text-[#E30613] font-mono">{cleanCode}</strong>.
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
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Código de Rastreamento</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Em Andamento</span>
                  </div>
                  <h2 className="text-xl font-black text-[#0A192F] font-mono mt-0.5">{shipment.code}</h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block font-medium">Previsão de Entrega</span>
                  <span className="text-sm font-bold text-[#E30613] flex items-center sm:justify-end gap-1">
                    <Calendar className="w-4 h-4" />
                    {shipment.estimatedDeliveryDate}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-gray-50 p-3.5 rounded-xl">
                  <span className="text-gray-400 font-medium block">Destinatário:</span>
                  <span className="font-bold text-gray-800 mt-0.5 block text-sm">{shipment.customerName}</span>
                  <span className="text-gray-500 text-[11px]">{shipment.destinationCity} - {shipment.destinationState}</span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl">
                  <span className="text-gray-400 font-medium block">Origem da Carga:</span>
                  <span className="font-bold text-gray-800 mt-0.5 block text-sm">{shipment.originCity} - {shipment.originState}</span>
                  <span className="text-gray-500 text-[11px]">Unidade Operacional Jadlog</span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl">
                  <span className="text-gray-400 font-medium block">Documento / Pedido:</span>
                  <span className="font-bold text-gray-800 mt-0.5 block text-sm">#{shipment.orderNumber}</span>
                  <span className="text-gray-500 text-[11px]">{shipment.productName}</span>
                </div>
              </div>
            </div>

            {/* Timeline Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                <Truck className="w-5 h-5 text-[#E30613]" />
                <h3 className="font-bold text-sm text-[#0A192F] uppercase tracking-wide">
                  Histórico de Movimentação da Carga
                </h3>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {shipment.events.map((evt: TrackingEvent, index: number) => {
                  const isLatest = index === 0;
                  return (
                    <div key={evt.id || index} className="relative group">
                      <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isLatest 
                          ? 'border-[#E30613] bg-[#E30613] text-white shadow-md' 
                          : 'border-gray-300 bg-white text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-white' : 'bg-gray-400'}`} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className={`font-bold ${isLatest ? 'text-[#E30613] text-sm' : 'text-gray-800'}`}>
                            {evt.title}
                          </span>
                          <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {evt.date} às {evt.time}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {evt.description}
                        </p>

                        <div className="flex items-center space-x-1 text-[11px] text-gray-400 font-medium">
                          <MapPin className="w-3 h-3 text-gray-400" />
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
      <footer className="bg-[#0A192F] text-gray-400 text-xs py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="bg-[#E30613] text-white px-2.5 py-0.5 rounded font-black italic text-sm">
              JADLOG
            </div>
            <span>• DPDgroup International</span>
          </div>
          <p>© 2026 Jadlog Logística S/A • Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
