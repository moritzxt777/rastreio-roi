import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { lookupShipment } from '../../services/shipmentLookup.service';
import { Shipment, TrackingEvent } from '../../types';
import { 
  Search, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck,
  Building,
  ArrowRight,
  Package,
  ExternalLink
} from 'lucide-react';

export const LoggiPortalView: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { shipments } = useApp();

  const [inputCode, setInputCode] = useState(code || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/loggi-favicon.ico';
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
      if (window.location.pathname.startsWith('/loggi')) {
        navigate(`/loggi/rastreamento/${query}`);
      } else {
        navigate(`/rastreamento/${query}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#1E293B] font-sans flex flex-col justify-between">
      <Helmet>
        <title>{shipment ? `Rastreamento Loggi - ${shipment.code}` : 'Loggi | Rastreamento de Encomendas'}</title>
        <meta name="description" content="Acompanhe a rota e entrega do seu pacote em tempo real com a Loggi." />
        <link rel="icon" type="image/x-icon" href="/loggi-favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/loggi-favicon.ico" />
      </Helmet>

      {/* LOGGI HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/loggi" className="flex items-center space-x-2">
            {/* Official Loggi Logo SVG */}
            <svg className="text-[#0060FE] h-7 w-auto" viewBox="0 0 131 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M53.4682 7.84668H48.7231V32.8368H63.8091V28.2512H53.4682V7.84668Z" fill="currentColor" />
              <path d="M73.8441 14.3418C68.3978 14.3418 64.2329 18.3879 64.2329 23.7153C64.2329 29.0427 68.38 33.1101 73.8441 33.1065C79.3082 33.103 83.4553 29.0782 83.4553 23.733C83.4553 18.3879 79.3688 14.3631 73.8655 14.3418H73.8441ZM73.8192 28.8936C70.9038 28.8936 68.8356 26.6966 68.8676 23.6727C68.8997 20.6488 70.9501 18.5796 73.869 18.5831C76.788 18.5867 78.8526 20.7127 78.8277 23.7579C78.8028 26.8031 76.7488 28.9149 73.8156 28.8936" fill="currentColor" />
              <path d="M98.9081 15.6163C97.3945 14.7715 95.6876 14.3314 93.953 14.3385C88.5066 14.3173 84.3418 18.3847 84.3418 23.7085C84.3418 29.0323 88.4924 33.1068 93.953 33.1033C95.6985 33.1147 97.4166 32.6706 98.9366 31.8149V33.8415C98.9366 36.8832 96.8577 38.995 93.9245 38.995C90.1583 38.995 88.4995 35.3535 88.4995 35.3535L85.0502 37.444C85.0502 37.444 87.0329 43.2186 93.9494 43.2186C99.4314 43.2186 103.561 39.1902 103.561 33.8415V14.3208H98.933V15.6163H98.9081ZM98.933 23.8008C98.8939 26.8105 96.8399 28.9046 93.9245 28.8833C91.0091 28.862 88.9409 26.6828 88.9765 23.6624C89.0121 20.642 91.0554 18.5692 93.9779 18.5692C96.9004 18.5692 98.9188 20.6633 98.933 23.6801V23.7972" fill="currentColor" />
              <path d="M119.017 15.6163C117.504 14.7712 115.796 14.3311 114.062 14.3385C108.616 14.3173 104.451 18.3847 104.451 23.7085C104.451 29.0323 108.598 33.1068 114.062 33.1033C115.807 33.1143 117.525 32.6701 119.045 31.8149V33.8415C119.045 36.8832 116.963 38.995 114.03 38.995C110.264 38.995 108.608 35.3535 108.608 35.3535L105.156 37.444C105.156 37.444 107.138 43.215 114.055 43.215C119.537 43.215 123.666 39.1902 123.666 33.8415V14.3208H119.038V15.6163H119.017ZM119.038 23.8008C118.999 26.8105 116.945 28.9046 114.03 28.8833C111.114 28.862 109.046 26.6828 109.082 23.6624C109.117 20.642 111.161 18.5657 114.065 18.5692C116.97 18.5728 119.006 20.6633 119.024 23.6801V23.8008" fill="currentColor" />
              <path d="M130.266 14.3276H125.521V32.8368H130.266V14.3276Z" fill="currentColor" />
              <path d="M127.895 12.5423C128.364 12.5423 128.823 12.4034 129.214 12.1433C129.604 11.8832 129.909 11.5135 130.088 11.0809C130.268 10.6483 130.315 10.1723 130.224 9.71311C130.132 9.25389 129.906 8.83207 129.574 8.50099C129.242 8.16992 128.819 7.94445 128.358 7.85311C127.897 7.76176 127.42 7.80864 126.986 7.98782C126.552 8.167 126.182 8.47043 125.921 8.85973C125.66 9.24904 125.521 9.70674 125.521 10.175C125.521 10.8028 125.771 11.4049 126.216 11.8489C126.661 12.2929 127.265 12.5423 127.895 12.5423Z" fill="currentColor" />
              <path d="M39.0873 11.3783C38.1861 10.9218 37.2604 10.5154 36.3143 10.1609L36.0508 9.96923C36.0508 9.96923 29.768 5.49011 26.9985 4.32596C24.2291 3.16182 19.4128 0.634769 14.5396 0.776738C12.1467 0.830577 9.76922 1.17381 7.45931 1.79891C6.47328 2.03671 5.81117 2.31355 6.89332 2.82109C7.24929 2.99145 8.80132 3.90715 10.6737 4.97547C13.4147 6.53358 16.8569 8.41467 18.3556 8.7554C20.5839 9.28728 22.8707 9.53652 25.1617 9.49719C28.6039 9.4262 30.277 10.8885 30.6152 11.4244C29.9993 10.5513 27.6571 9.85211 24.5281 10.0438C21.5166 10.2283 19.096 10.0438 17.6899 9.61076C14.8806 8.74299 12.1374 7.67548 9.48122 6.41646C8.7883 6.62243 8.10735 6.86652 7.44151 7.1476C6.57651 7.50252 5.76134 8.17332 6.97875 8.5176C7.85088 8.7625 15.9919 11.6658 18.3698 11.8042C20.4683 11.9525 22.5773 11.8333 24.6456 11.4493C27.7247 10.8707 29.3301 12.1307 29.7039 12.6205C28.6595 14.0833 28.1562 15.862 28.28 17.6533C17.0242 15.6728 13.4325 14.6507 10.8909 14.2141C6.4448 13.451 0.802671 17.2061 0.108529 21.852C-0.283038 24.4962 0.393305 26.9629 2.00229 29.2451C3.78214 31.7721 6.12799 33.9514 6.46972 34.4128C6.68686 34.8103 6.61566 35.8537 6.6299 36.5423C6.6299 37.3338 7.64086 38.0401 8.22109 38.0933C8.57706 38.1252 15.2301 40.2015 15.2301 40.2015L25.1012 43.229C25.1012 43.229 25.2543 42.5511 25.2827 42.2636C25.3575 41.536 24.8022 39.7366 22.4884 39.0693C19.0853 38.0472 18.4125 37.8555 17.6899 37.6496C17.2983 37.5325 17.5724 37.5254 18.1776 37.0498C19.1585 36.2139 19.9632 35.1921 20.5448 34.0436C22.5596 29.7846 20.0251 25.9656 20.0251 25.9656C21.1292 27.2741 21.8781 28.8432 22.2 30.5228C22.944 34.143 20.4843 37.0143 20.4843 37.0143L21.9509 37.4402C21.9509 37.4402 31.4375 27.9141 32.363 26.8848C33.1461 26.0153 34.4988 25.4652 35.2108 25.2451C37.7381 24.514 40.9063 23.1156 41.7072 22.5903C42.5081 22.065 43.4871 20.2904 43.7469 19.8467C44.0719 19.3341 44.2876 18.7602 44.3805 18.1608C44.4019 17.9301 43.0492 16.1307 43.0492 16.1307C43.0492 16.1307 40.8885 12.4821 39.1051 11.4031" fill="currentColor" />
              <path d="M11.4782 40.7305C11.2588 40.8562 11.0981 41.0634 11.0314 41.3068C10.9647 41.5502 10.9974 41.81 11.1223 42.0295C11.2198 42.2009 11.3676 42.3384 11.5459 42.4235C12.2578 42.8033 14.7069 41.4723 14.7069 41.4723L12.2649 40.7057C12.0117 40.6124 11.732 40.6213 11.4853 40.7305" fill="currentColor" />
            </svg>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-gray-600">
            <Link to="/loggi" className="text-[#0060FE] font-bold">Rastrear Pacote</Link>
            <a href="https://www.loggi.com/para-voce" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition">Para Você</a>
            <a href="https://www.loggi.com/para-empresas" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition">Para Empresas</a>
            <a href="https://ajuda.loggi.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition">Central de Ajuda</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-[#0060FE] text-white py-12 px-4 shadow-inner">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Acompanhe sua entrega
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Consulte onde está seu pacote e receba atualizações em tempo real com a malha logística da Loggi.
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
            <p className="text-xs text-gray-500 font-medium">Buscando status do pacote na rede Loggi...</p>
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
                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium block">Destinatário:</span>
                  <span className="font-bold text-gray-800 text-sm mt-0.5 block">{shipment.customerName}</span>
                  <span className="text-gray-500 block text-[11px]">{shipment.destinationCity} - {shipment.destinationState}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium block">Origem:</span>
                  <span className="font-bold text-gray-800 text-sm mt-0.5 block">{shipment.originCity} - {shipment.originState}</span>
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
