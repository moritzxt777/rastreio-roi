import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Shipment, TrackingEvent } from '../../types';
import { 
  Search, 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  HelpCircle,
  ShieldCheck,
  Building,
  ArrowRight
} from 'lucide-react';

export const LoggiPortalView: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { shipments } = useApp();

  const [inputCode, setInputCode] = useState(code || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
      navigate(`/loggi/${inputCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#1E293B] font-sans flex flex-col justify-between">
      <Helmet>
        <title>{shipment ? `Rastreamento Loggi - ${shipment.code}` : 'Loggi - Acompanhe seu pacote'}</title>
        <meta name="description" content="Acompanhe a rota e entrega do seu pacote em tempo real com a Loggi." />
      </Helmet>

      {/* LOGGI HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/loggi" className="flex items-center space-x-2">
            <span className="text-2xl font-black text-[#0060FE] tracking-tight">loggi</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-gray-600">
            <Link to="/loggi" className="text-[#0060FE] font-bold">Rastrear Pacote</Link>
            <a href="#para-voce" className="hover:text-gray-900 transition">Para Você</a>
            <a href="#para-empresas" className="hover:text-gray-900 transition">Para Empresas</a>
            <a href="#ajuda" className="hover:text-gray-900 transition">Ajuda</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-[#0060FE] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Acompanhe sua entrega
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Consulte onde está seu pacote e receba atualizações em tempo real com a malha da Loggi.
          </p>

          <form onSubmit={handleSearch} className="max-w-lg mx-auto pt-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl shadow-xl">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Código de rastreio (Ex: LG1928374650BR)"
                  className="w-full pl-11 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 uppercase rounded-xl focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#0048C4] hover:bg-[#003BA0] text-white px-6 py-2.5 text-xs font-bold rounded-xl transition active:scale-95 shadow"
              >
                Rastrear
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* TRACKING CONTENT */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 space-y-3">
            <div className="w-10 h-10 border-4 border-[#0060FE] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Buscando status do pacote...</p>
          </div>
        )}

        {!loading && searched && !shipment && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200 space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-[#0060FE] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Pacote Não Encontrado</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Não localizamos envios com o código <strong className="text-[#0060FE] font-mono">{cleanCode}</strong>.
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
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Código de Rastreio</span>
                  <h2 className="text-xl font-extrabold text-[#0060FE] font-mono mt-0.5">{shipment.code}</h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block font-medium">Previsão Estimada</span>
                  <span className="text-sm font-bold text-gray-800 flex items-center sm:justify-end gap-1">
                    <Calendar className="w-4 h-4 text-[#0060FE]" />
                    {shipment.estimatedDeliveryDate}
                  </span>
                </div>
              </div>

              {/* Progress Visualizer */}
              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                  <span className="text-[#0060FE]">Postado</span>
                  <span className={shipment.status !== 'posted' ? 'text-[#0060FE]' : 'text-gray-400'}>Em Trânsito</span>
                  <span className={shipment.status === 'out_for_delivery' || shipment.status === 'delivered' ? 'text-[#0060FE]' : 'text-gray-400'}>Saiu p/ Entrega</span>
                  <span className={shipment.status === 'delivered' ? 'text-emerald-600 font-extrabold' : 'text-gray-400'}>Entregue</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0060FE] to-blue-400 transition-all duration-700"
                    style={{
                      width: shipment.status === 'delivered' ? '100%' :
                             shipment.status === 'out_for_delivery' ? '75%' :
                             shipment.status === 'in_transit' ? '50%' : '25%'
                    }}
                  />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 font-medium block">Destinatário:</span>
                  <span className="font-bold text-gray-800">{shipment.customerName}</span>
                  <span className="text-gray-500 block text-[11px]">{shipment.destinationCity} - {shipment.destinationState}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 font-medium block">Origem:</span>
                  <span className="font-bold text-gray-800">{shipment.originCity} - {shipment.originState}</span>
                  <span className="text-gray-500 block text-[11px]">Centro de Distribuição Loggi</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0060FE]" />
                Histórico do Pacote
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {shipment.events.map((evt: TrackingEvent, idx: number) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={evt.id || idx} className="relative">
                      <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isLatest ? 'bg-[#0060FE] text-white shadow' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className={`font-bold ${isLatest ? 'text-[#0060FE] text-sm' : 'text-gray-800'}`}>
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
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-extrabold text-[#0060FE] text-lg">loggi</span>
          <p>© 2026 Loggi Tecnologia LTDA • Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
