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
  Share2, 
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Menu,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';

export const CorreiosPortalView: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { shipments } = useApp();

  const [inputCode, setInputCode] = useState(code || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [turnstileChecked, setTurnstileChecked] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(true);

  useEffect(() => {
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = 'https://rastreamento.correios.com.br/core/templates/bunker/img/favi-ect.png';
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
    <div className="min-h-screen bg-[#F2F2F2] text-[#222222] font-sans flex flex-col justify-between selection:bg-[#FFC40C] selection:text-[#00416B]">
      <Helmet>
        <title>{shipment ? `Rastreamento - ${shipment.code} - Correios` : 'Rastreamento - Correios'}</title>
        <meta name="description" content="Acompanhe seus objetos postados no Brasil e no exterior através do sistema de rastreamento oficial dos Correios." />
        <link rel="icon" type="image/png" href="https://rastreamento.correios.com.br/core/templates/bunker/img/favi-ect.png" />
      </Helmet>

      {/* 1. BARRA SUPERIOR DE ACESSIBILIDADE OFICIAL */}
      <section className="bg-[#EFEDEA] border-b border-[#E0DCD5] text-[11px] text-[#555555] py-1 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-[#00416B] cursor-pointer hover:underline">Acessibilidade</span>
            <span className="text-gray-300">|</span>
            <span className="cursor-pointer hover:underline hidden sm:inline">Alto contraste</span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="cursor-pointer hover:underline hidden sm:inline">Libras</span>
          </div>
          <div className="text-[11px] text-[#777]">
            <span>Português</span>
          </div>
        </div>
      </section>

      {/* 2. HEADER MENU INSTITUCIONAL CORREIOS (#menu) */}
      <header className="bg-[#F5F3F0] border-b border-[#E5E2DC] sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-[#00416B] hover:bg-[#EAE6DF] transition"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/correios" className="flex items-center">
              <img 
                src="https://rastreamento.correios.com.br/core/templates/bunker/img/logo-ect.svg" 
                alt="Correios" 
                className="h-7 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <a 
              href="https://rastreamento.correios.com.br/core/seguranca/entrar.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-xs font-semibold text-[#00416B] hover:text-[#002D4A] px-3 py-1.5 rounded border border-[#00416B] bg-white hover:bg-gray-50 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </a>
          </div>
        </div>

        {/* Menu Retrátil */}
        {mobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-lg px-6 py-4 animate-fadeIn">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#00416B] font-medium">
              <a href="https://www.correios.com.br/acesso-a-informacao/perguntas-frequentes" target="_blank" rel="noopener noreferrer" className="hover:underline py-1">Perguntas Frequentes</a>
              <a href="https://buscaagencia.correios.com.br/app/index.php" target="_blank" rel="noopener noreferrer" className="hover:underline py-1">Busca Agências</a>
              <a href="https://www.correios.com.br/falecomoscorreios/central-de-atendimento" target="_blank" rel="noopener noreferrer" className="hover:underline py-1">Central de Atendimento</a>
              <a href="https://www.correios.com.br/receber/prazo-de-guarda" target="_blank" rel="noopener noreferrer" className="hover:underline py-1">Prazo de Guarda Objetos Nacionais</a>
              <a href="https://www.correios.com.br/receber/prazo-de-guarda-objetos-internacionais" target="_blank" rel="noopener noreferrer" className="hover:underline py-1">Prazo de Guarda Objetos Internacionais</a>
              <a href="https://www2.correios.com.br/sistemas/precosPrazos/restricaoentrega/" target="_blank" rel="noopener noreferrer" className="hover:underline py-1">Restrição de Entrega por CEP</a>
            </div>
          </div>
        )}
      </header>

      {/* 3. CONTEÚDO PRINCIPAL (LAYOUT EXATO CORREIOS BUNKER) */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {/* TRILHA / BREADCRUMB */}
        <nav className="text-xs text-[#707070] mb-4 flex items-center space-x-2">
          <Link to="/correios" className="hover:text-[#00416B] hover:underline">Portal Correios</Link>
          <span>&gt;</span>
          <span className="text-[#00416B] font-semibold">Rastreamento</span>
        </nav>

        {/* CAIXA DE BUSCA OFICIAL (JUMBOTRON CORREIOS) */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 mb-6">
          <div className="border-b border-[#EFEFEF] pb-3 mb-4">
            <h1 className="text-2xl font-bold text-[#00416B] tracking-tight">Rastreamento</h1>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="objeto" className="block text-sm text-[#444444] mb-2 leading-relaxed">
                <strong>Deseja acompanhar seu objeto?</strong><br />
                Digite um CPF ou um CNPJ ou até 20 códigos de rastreamento.
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  id="objeto"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="AA123456785BR"
                  className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#CCCCCC] rounded focus:outline-none focus:border-[#00416B] focus:ring-1 focus:ring-[#00416B] text-gray-800 placeholder-gray-400 font-mono uppercase"
                  maxLength={1024}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00416B] hover:bg-[#002D4A] text-white px-8 py-2.5 rounded font-semibold text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Consultando...</span>
                  ) : (
                    <span>Consultar</span>
                  )}
                </button>
              </div>
            </div>

            {/* WIDGET TURNSTILE HUMAN CHECK SIMULADO */}
            <div className="pt-2">
              <div className="inline-flex items-center space-x-3 px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-xs text-[#555]">
                <button 
                  type="button" 
                  onClick={() => setTurnstileChecked(!turnstileChecked)}
                  className="w-5 h-5 rounded border border-gray-400 bg-white flex items-center justify-center text-green-600 focus:outline-none"
                >
                  {turnstileChecked && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
                <span className="font-medium text-gray-700">Confirme que é humano</span>
                <span className="text-[10px] text-gray-400 pl-4 border-l border-gray-200">Cloudflare Turnstile</span>
              </div>
            </div>
          </form>
        </div>

        {/* 4. RESULTADO DO RASTREAMENTO (LINHA DO TEMPO SRO CORREIOS) */}
        {cleanCode && (
          <div className="mb-8">
            {loading ? (
              <div className="bg-white rounded-lg p-12 text-center border border-[#E0E0E0] shadow-sm">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#FFC40C] border-t-[#00416B] mb-3"></div>
                <p className="text-sm font-semibold text-[#00416B]">Consultando base oficial do Sistema de Rastreamento de Objetos (SRO)...</p>
              </div>
            ) : shipment ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                {/* CABEÇALHO DO OBJETO */}
                <div className="bg-[#FAF9F6] border-b border-[#E8E6E0] p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 text-xs text-[#777] mb-1">
                        <span>Código do Objeto:</span>
                        <span className="font-mono font-bold text-base text-[#00416B] tracking-wide">{shipment.code}</span>
                      </div>
                      <h2 className="text-xl font-bold text-[#00416B] flex items-center space-x-2">
                        {shipment.status === 'delivered' ? (
                          <span className="text-green-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            Objeto entregue ao destinatário
                          </span>
                        ) : shipment.status === 'out_for_delivery' ? (
                          <span className="text-[#00416B] flex items-center gap-1.5">
                            <Truck className="w-6 h-6 text-[#FFC40C]" />
                            Objeto saiu para entrega ao destinatário
                          </span>
                        ) : (
                          <span className="text-[#00416B] flex items-center gap-1.5">
                            <Truck className="w-6 h-6 text-[#00416B]" />
                            Objeto em trânsito - por favor aguarde
                          </span>
                        )}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: `Rastreio ${shipment.code}`, url: window.location.href });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copiado para a área de transferência!');
                          }
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs text-[#00416B] border border-[#00416B] bg-white px-3 py-1.5 rounded hover:bg-blue-50 transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartilhar</span>
                      </button>
                      <button 
                        onClick={() => alert('Notificações ativadas com sucesso!')}
                        className="inline-flex items-center space-x-1.5 text-xs text-white bg-[#00416B] hover:bg-[#002D4A] px-3 py-1.5 rounded font-medium transition"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Receber Notificações</span>
                      </button>
                    </div>
                  </div>

                  {/* CARDS DE RESUMO OPERACIONAL */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#ECEAE4] text-xs">
                    <div className="bg-white p-3 rounded border border-[#E5E5E5]">
                      <span className="text-gray-500 block mb-0.5">Previsão de Entrega:</span>
                      <strong className="text-sm text-[#00416B]">{shipment.estimatedDeliveryDate || 'Em breve'}</strong>
                    </div>
                    <div className="bg-white p-3 rounded border border-[#E5E5E5]">
                      <span className="text-gray-500 block mb-0.5">Origem da Postagem:</span>
                      <strong className="text-sm text-gray-800">
                        {shipment.originCity ? `${shipment.originCity} / ${shipment.originState}` : 'Cajamar / SP'}
                      </strong>
                    </div>
                    <div className="bg-white p-3 rounded border border-[#E5E5E5]">
                      <span className="text-gray-500 block mb-0.5">Destino / Local de Entrega:</span>
                      <strong className="text-sm text-gray-800">
                        {shipment.destinationCity ? `${shipment.destinationCity} / ${shipment.destinationState}` : 'São Paulo / SP'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* TIMELINE OFICIAL SRO (CSS ESTILO RASTRO UNICO CORREIOS) */}
                <div className="p-6">
                  <h3 className="text-sm font-bold text-[#00416B] uppercase tracking-wider mb-6 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span>Histórico de Movimentação do Objeto</span>
                    <span className="text-xs text-gray-500 font-normal">{shipment.events?.length || 0} eventos registrados</span>
                  </h3>

                  <div className="space-y-0 pl-2">
                    {shipment.events?.map((event: TrackingEvent, index: number) => {
                      const isLatest = index === 0;
                      return (
                        <div key={event.id || index} className="flex group">
                          {/* Coluna Esquerda: Ícone e Linha Conectora Amarela */}
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition ${
                              isLatest 
                                ? 'bg-[#FFC40C] text-[#00416B] ring-4 ring-[#FFF7D6]' 
                                : 'bg-[#E5E5E5] text-[#555]'
                            }`}>
                              {event.status === 'delivered' ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : event.status === 'out_for_delivery' ? (
                                <Truck className="w-5 h-5" />
                              ) : (
                                <Package className="w-5 h-5" />
                              )}
                            </div>
                            {index < shipment.events.length - 1 && (
                              <div className="w-[3px] bg-[#FFC40C] flex-1 my-1"></div>
                            )}
                          </div>

                          {/* Coluna Direita: Dados e Detalhes do Evento */}
                          <div className="pb-8 flex-1">
                            <div className="bg-[#FAF9F6] p-4 rounded-lg border border-[#ECE8DE]">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <h4 className="font-bold text-sm text-[#00416B]">
                                  {event.title}
                                </h4>
                                <div className="text-xs font-mono font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block w-fit">
                                  {event.date} às {event.time}
                                </div>
                              </div>

                              <p className="text-xs text-[#444444] leading-relaxed mb-2">
                                {event.description}
                              </p>

                              <div className="text-[11px] text-[#777777] flex items-center gap-1 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-[#00416B]" />
                                <span>Unidade de Tratamento: <strong>{event.location}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BENEFÍCIO EXCLUSIVO SE ATIVO */}
                {(() => {
                  try {
                    const raw = localStorage.getItem('roi_upsell_settings');
                    if (!raw) return null;
                    const upsell = JSON.parse(raw);
                    if (!upsell?.enabled) return null;
                    return (
                      <div className="p-6 bg-[#FFF9E6] border-t border-[#FFE699]">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-[#8A6D3B] uppercase tracking-wider block mb-0.5">Benefício Exclusivo do Lojista</span>
                            <h4 className="text-base font-bold text-[#00416B]">{upsell.title || 'Desconto exclusivo para a sua próxima compra!'}</h4>
                            <p className="text-xs text-gray-700">{upsell.description || 'Utilize o cupom abaixo e garanta vantagens exclusivas.'}</p>
                          </div>
                          <div className="text-center sm:text-right">
                            {upsell.couponCode && (
                              <div className="font-mono font-bold text-sm bg-white border border-[#00416B] text-[#00416B] px-3 py-1.5 rounded mb-2">
                                {upsell.couponCode}
                              </div>
                            )}
                            {upsell.buttonLink && (
                              <a 
                                href={upsell.buttonLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block bg-[#00416B] hover:bg-[#002D4A] text-white text-xs font-bold px-4 py-2 rounded transition"
                              >
                                {upsell.buttonText || 'Aproveitar Oferta'}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 border border-red-200 text-center shadow-sm">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h3 className="font-bold text-base text-gray-800 mb-1">Objeto não encontrado na base de dados</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  O código <strong>{cleanCode}</strong> ainda não foi atualizado no sistema dos Correios ou a postagem foi realizada recentemente.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. SEÇÃO DE PARCEIROS OFICIAIS DOS CORREIOS (CLONADA DO SITE OFICIAL) */}
        <section className="bg-white rounded-lg border border-[#E0E0E0] p-6 mb-8 shadow-sm">
          <h2 className="text-base font-bold text-[#00416B] mb-4">
            Aproveite ofertas e benefícios dos nossos parceiros!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parceiro 1: Mais Correios */}
            <article className="border border-[#E5E5E5] rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src="https://apps2.correios.com.br/mservice/upload/arquivos/c158518dcfcbab40.png" 
                  alt="Mais Correios" 
                  className="h-10 w-auto"
                />
                <div>
                  <span className="text-xl font-bold text-[#00416B]">5%</span>
                  <p className="text-xs text-gray-600 font-medium">de desconto</p>
                </div>
              </div>
              <a 
                href="https://www.correios.com.br/afiliados/mais-correios" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center bg-[#00416B] hover:bg-[#002D4A] text-white text-xs font-bold py-2 rounded transition"
              >
                Ver cupons
              </a>
            </article>

            {/* Parceiro 2: AliExpress */}
            <article className="border border-[#E5E5E5] rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src="https://apps2.correios.com.br/mservice/upload/arquivos/8f103bd9cd96d25f.png" 
                  alt="AliExpress" 
                  className="h-10 w-auto"
                />
                <div>
                  <span className="text-xl font-bold text-[#00416B]">R$ 16,00</span>
                  <p className="text-xs text-gray-600 font-medium">de desconto</p>
                </div>
              </div>
              <a 
                href="https://www.correios.com.br/afiliados/aliexpress" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center bg-[#00416B] hover:bg-[#002D4A] text-white text-xs font-bold py-2 rounded transition"
              >
                Ver cupons
              </a>
            </article>

            {/* Parceiro 3: Shopee */}
            <article className="border border-[#E5E5E5] rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src="https://apps2.correios.com.br/mservice/upload/arquivos/34e163f68081460e.png" 
                  alt="Shopee" 
                  className="h-10 w-auto"
                />
                <div>
                  <p className="text-sm font-bold text-[#00416B]">Confira as</p>
                  <p className="text-xs text-gray-600 font-medium">ofertas</p>
                </div>
              </div>
              <a 
                href="https://shopee.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center bg-[#00416B] hover:bg-[#002D4A] text-white text-xs font-bold py-2 rounded transition"
              >
                Ir para loja
              </a>
            </article>
          </div>
        </section>

        {/* 6. BANNER OFICIAL CORREIOS CELULAR */}
        <div className="rounded-lg overflow-hidden shadow-sm mb-8 border border-gray-200">
          <a href="https://www.correioscelular.com.br/" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://apps2.correios.com.br/mservice/upload/arquivos/3ef933079433c89c.png" 
              alt="Correios Celular" 
              className="w-full h-auto object-cover"
            />
          </a>
        </div>
      </main>

      {/* 7. RODAPÉ INSTITUCIONAL OFICIAL DOS CORREIOS */}
      <footer className="bg-white border-t border-[#D9D9D9] text-[#444444] pt-8 pb-6 text-xs">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b border-[#EBEBEB]">
            {/* Coluna 1: Fale Conosco */}
            <div>
              <h3 className="font-bold text-sm text-[#00416B] mb-3">Fale Conosco</h3>
              <ul className="space-y-2 text-[#555]">
                <li><a href="https://faleconosco.correios.com.br/app/index.php" target="_blank" rel="noopener noreferrer" className="hover:underline">Registro de manifestações</a></li>
                <li><a href="https://www.correios.com.br/falecomoscorreios/central-de-atendimento" target="_blank" rel="noopener noreferrer" className="hover:underline">Central de atendimento</a></li>
                <li><a href="https://faleconosco.correios.com.br/app/cadastro/contrate/index.php" target="_blank" rel="noopener noreferrer" className="hover:underline">Soluções para o seu negócio</a></li>
                <li><a href="https://faleconosco.correios.com.br/app/cadastro/suporte/index.php" target="_blank" rel="noopener noreferrer" className="hover:underline">Suporte ao cliente com contrato</a></li>
                <li><a href="https://www.correios.com.br/falecomoscorreios/ouvidoria" target="_blank" rel="noopener noreferrer" className="hover:underline">Ouvidoria</a></li>
                <li><a href="https://www.correios.com.br/falecomoscorreios/canais-de-denuncia" target="_blank" rel="noopener noreferrer" className="hover:underline">Denúncia</a></li>
              </ul>
            </div>

            {/* Coluna 2: Sobre os Correios */}
            <div>
              <h3 className="font-bold text-sm text-[#00416B] mb-3">Sobre os Correios</h3>
              <ul className="space-y-2 text-[#555]">
                <li><a href="https://www.correios.com.br/acesso-a-informacao/institucional/identidade-corporativa" target="_blank" rel="noopener noreferrer" className="hover:underline">Identidade corporativa</a></li>
                <li><a href="https://www.correios.com.br/educacao-e-cultura" target="_blank" rel="noopener noreferrer" className="hover:underline">Educação e cultura</a></li>
                <li><a href="https://www.correios.com.br/acesso-a-informacao/servidores/arquivos/codigo-de-conduta-etica-integridade" target="_blank" rel="noopener noreferrer" className="hover:underline">Código de Conduta Ética</a></li>
                <li><a href="https://www.correios.com.br/acesso-a-informacao/transparencia-e-governanca/transparencia-e-prestacao-de-contas/transparencia-e-prestacao-de-contas" target="_blank" rel="noopener noreferrer" className="hover:underline">Transparência</a></li>
                <li><a href="https://www.correios.com.br/acesso-a-informacao/transparencia-e-governanca/sustentabilidade/sustentabilidade" target="_blank" rel="noopener noreferrer" className="hover:underline">Sustentabilidade</a></li>
              </ul>
            </div>

            {/* Coluna 3: Informações */}
            <div>
              <h3 className="font-bold text-sm text-[#00416B] mb-3">Informações</h3>
              <ul className="space-y-2 text-[#555]">
                <li><a href="http://www.postalis.org.br/" target="_blank" rel="noopener noreferrer" className="hover:underline">Postalis</a></li>
                <li><a href="https://www.postalsaude.com.br/" target="_blank" rel="noopener noreferrer" className="hover:underline">Postal Saúde</a></li>
                <li><a href="https://www.gov.br/mcom/pt-br" target="_blank" rel="noopener noreferrer" className="hover:underline">Ministério das Comunicações</a></li>
                <li><a href="https://www.correios.com.br/acesso-a-informacao/acoes-e-programas/carta-de-servicos-aos-usuarios" target="_blank" rel="noopener noreferrer" className="hover:underline">Carta de Serviços</a></li>
                <li><a href="https://loja.correios.com.br/" target="_blank" rel="noopener noreferrer" className="hover:underline">Loja on Line</a></li>
              </ul>
            </div>

            {/* Coluna 4: Aplicativos e Redes */}
            <div>
              <h3 className="font-bold text-sm text-[#00416B] mb-3">Aplicativos Correios</h3>
              <div className="flex flex-col space-y-2 mb-4">
                <a href="https://apps.apple.com/br/developer/ect-empresa-brasileira-de-correios-e-telegrafos/id866480129" target="_blank" rel="noopener noreferrer">
                  <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape-correios/aplicativo-correios-apple.png" alt="App Store" className="h-8 w-auto" />
                </a>
                <a href="https://play.google.com/store/apps/developer?id=Empresa+Brasileira+de+Correios+e+Telegrafos" target="_blank" rel="noopener noreferrer">
                  <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape-correios/aplicativo-correios-android.png" alt="Google Play" className="h-8 w-auto" />
                </a>
              </div>
            </div>
          </div>

          {/* MARCA GOVERNO FEDERAL E COPYRIGHT */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#777] gap-3">
            <div>
              <p>© Copyright 2026 Correios</p>
              <p>CNPJ 34.028.316/0001-03</p>
            </div>
            <img 
              src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape-correios/marca-gov.png" 
              alt="Correios e Governo Federal" 
              className="h-9 w-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
