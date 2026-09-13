import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Truck, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Check, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Store, 
  X,
  Search,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shipments, loginMerchant } = useApp();

  // Auth modal state
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/login') return 'login';
      if (window.location.pathname === '/register') return 'register';
    }
    return null;
  });

  useEffect(() => {
    if (location.pathname === '/login') {
      setAuthMode('login');
    } else if (location.pathname === '/register') {
      setAuthMode('register');
    }
  }, [location.pathname]);
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick tracker input in hero
  const [heroSearch, setHeroSearch] = useState(shipments[0]?.code || 'NL192837465BR');

  const handleDiscordLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const redirectUrl = window.location.origin ? `${window.location.origin}/dashboard` : 'https://roi-rastreio.site/dashboard';
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: redirectUrl
          }
        });
        if (oauthError) {
          setError(oauthError.message);
          setLoading(false);
        }
      } else {
        loginMerchant({
          name: 'Usuário Discord',
          email: 'discord.user@rastreio.roi',
          storeName: 'Minha Loja Discord'
        });
        setLoading(false);
        setAuthMode(null);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao autenticar com Discord');
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        if (authMode === 'register') {
          if (!name || !email || !password) {
            setError('Preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
          }
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                name: name.trim(),
                store_name: storeName.trim() || 'Minha Loja',
                role: 'merchant'
              }
            }
          });

          if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
          }

          if (data.session) {
            localStorage.setItem('rastreio_merchant_session', JSON.stringify({
              authenticated: true,
              email: email.trim(),
              name: name.trim(),
              storeName: storeName.trim() || 'Minha Loja'
            }));
            setLoading(false);
            setAuthMode(null);
            navigate('/dashboard');
            return;
          } else {
            // Auto login or confirmation prompt
            const { data: loginData } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password
            });
            if (loginData.session) {
              localStorage.setItem('rastreio_merchant_session', JSON.stringify({
                authenticated: true,
                email: email.trim(),
                name: name.trim(),
                storeName: storeName.trim() || 'Minha Loja'
              }));
              setLoading(false);
              setAuthMode(null);
              navigate('/dashboard');
              return;
            }
            setError('Conta criada! Faça login com seu e-mail e senha.');
            setAuthMode('login');
            setLoading(false);
            return;
          }
        } else {
          // Login mode
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

          if (signInError) {
            // If Supabase user doesn't exist yet, save local fallback session
            console.warn('Supabase signin error:', signInError.message);
          } else if (data.session) {
            localStorage.setItem('rastreio_merchant_session', JSON.stringify({
              authenticated: true,
              email: data.user.email,
              name: data.user.user_metadata?.name || name || 'Lojista Oficial',
              storeName: data.user.user_metadata?.store_name || storeName || 'Minha Loja'
            }));
            setLoading(false);
            setAuthMode(null);
            navigate('/dashboard');
            return;
          }
        }
      }

      // Save Real Merchant User
      const realUserData = {
        name: name.trim() || email.split('@')[0] || 'Lojista Oficial',
        email: email.trim(),
        storeName: storeName.trim() || 'Minha Loja'
      };

      localStorage.setItem('rastreio_merchant_session', JSON.stringify({
        authenticated: true,
        ...realUserData
      }));

      loginMerchant(realUserData);

      setLoading(false);
      setAuthMode(null);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Erro durante a autenticação.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      <Helmet>
        <title>Rastreio ROI | Plataforma de Rastreamento & Recuperação de Vendas</title>
        <meta name="description" content="Aumente o ROI do seu e-commerce com 100 códigos de rastreio gratuitos por dia, notificações no WhatsApp e páginas de rastreio de alta conversão." />
      </Helmet>

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-navy-950/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/logo.png" 
              alt="ROI Logo" 
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]" 
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Funcionalidades</a>
            <a href="#upsell" className="hover:text-white transition">Otimizador de ROI</a>
            <a href="#whatsapp" className="hover:text-white transition">WhatsApp Automático</a>
            <a href="#pricing" className="hover:text-white transition">Cota Gratuita (100/dia)</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => { setAuthMode('login'); setError(null); }}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Fazer Login
            </button>

            <button
              onClick={() => { setAuthMode('register'); setError(null); }}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:from-brand-500 hover:to-blue-400 transition active:scale-95"
            >
              <span>Criar Conta Grátis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 text-center z-10 max-w-5xl mx-auto space-y-8">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-300 shadow-sm shadow-brand-500/10">
          <Zap className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
          <span>Plataforma Oficial de Rastreio • 100 Códigos Gratuitos por Dia</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Quem não escala black <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">não vive as whites</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          O sistema completo para dropshipping e e-commerce: gere códigos padrão Correios e Transportadoras, envie alertas automáticos no WhatsApp e ofereça cupons de upsell enquanto seu cliente aguarda o pacote.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => { setAuthMode('register'); setError(null); }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-blue-600 to-sky-500 text-white font-black text-sm shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 hover:scale-[1.02] transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Começar Agora (100 Rastreios/Dia Grátis)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/r/NL192837465BR"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-700 bg-navy-900/80 text-slate-200 font-bold text-sm hover:bg-slate-800 hover:text-white transition flex items-center justify-center space-x-2"
          >
            <span>Ver Exemplo de Rastreio ao Vivo</span>
            <ChevronRight className="w-4 h-4 text-brand-400" />
          </Link>
        </div>

        {/* Interactive Live Demo Search Box */}
        <div className="pt-8 max-w-xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-navy-900/80 p-2 shadow-2xl backdrop-blur-xl flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Consulte um código de teste (Ex: NL192837465BR)"
                className="w-full rounded-xl border border-slate-800 bg-navy-950 pl-10 pr-4 py-2.5 text-xs text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              onClick={() => navigate(`/r/${heroSearch.trim().toUpperCase()}`)}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow"
            >
              Consultar
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 Experimente digitar <strong className="text-brand-300 font-mono">NL192837465BR</strong> para ver a página de rastreio com cupons de desconto.
          </p>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="border-y border-slate-800/80 bg-navy-900/50 py-10 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">100/dia</div>
            <p className="text-xs text-slate-400 font-medium">Códigos gratuitos por loja</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-brand-400">+28%</div>
            <p className="text-xs text-slate-400 font-medium">ROI em Upsell no Rastreio</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">-80%</div>
            <p className="text-xs text-slate-400 font-medium">Reclamações no Suporte</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <p className="text-xs text-slate-400 font-medium">Automatizado via WhatsApp</p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto relative z-10 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">
            RECURSOS DE ALTA PERFORMANCE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Tudo o que sua loja precisa em um só lugar
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Desenvolvido especialmente para operações de e-commerce e dropshipping que prezam por conversão e velocidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-6 space-y-4 hover:border-brand-500/40 hover:bg-navy-900 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Gerador & Rastreamento Realista</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crie códigos individuais ou em lote (Correios, Loggi, Jadlog, Total Express) com linha do tempo de eventos dinâmica até a entrega.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-b from-navy-900 to-brand-950/30 p-6 space-y-4 hover:border-brand-500 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-lg shadow-brand-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Página de Rastreio com Upsell</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Exiba banners com cupons exclusivos e produtos recomendados da sua loja para o cliente comprar mais enquanto espera o pacote.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-6 space-y-4 hover:border-brand-500/40 hover:bg-navy-900 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">WhatsApp Automático</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dispare mensagens no WhatsApp do cliente a cada atualização (Postado, Em trânsito, Saiu para entrega e Entregue) sem intervenção manual.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING / FREE QUOTA HIGHLIGHT */}
      <section id="pricing" className="py-16 px-6 max-w-4xl mx-auto relative z-10">
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-navy-900 via-navy-900 to-brand-950/40 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <span className="rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 text-xs font-bold">
                PLANO PADRÃO INCLUSO
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                100 Códigos por Dia. <br /><span className="text-brand-400">Totalmente Gratuito.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Sua cota zera automaticamente toda meia-noite. Sem taxas surpresas, sem recargas obrigatórias.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-navy-950 p-6 text-center space-y-4 shrink-0 min-w-[240px]">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Sua Cota Diária</span>
                <div className="text-3xl font-black text-white mt-1">100 <span className="text-xs text-brand-400 font-sans">códigos/dia</span></div>
              </div>
              <button
                onClick={() => { setAuthMode('register'); setError(null); }}
                className="w-full rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-600/30"
              >
                Criar Minha Conta Grátis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-navy-950 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="ROI Logo" className="h-6 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
            <span className="font-bold text-white">Rastreio ROI</span>
          </div>
          <p>© 2026 Rastreio ROI • Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* AUTH MODAL (LOGIN & CADASTRO) */}
      {/* ========================================================================= */}
      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-navy-900 p-6 sm:p-8 shadow-2xl relative space-y-5">
            {/* Close */}
            <button
              onClick={() => setAuthMode(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo in Modal */}
            <div className="text-center space-y-1.5">
              <img src="/logo.png" alt="ROI Logo" className="h-10 w-auto mx-auto object-contain filter drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              <h3 className="text-xl font-black text-white">
                {authMode === 'register' ? 'Criar Conta de Lojista' : 'Acessar seu Painel'}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === 'register' ? 'Comece agora com 100 códigos grátis por dia' : 'Digite suas credenciais para entrar'}
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Lucas Silveira"
                        className="w-full rounded-xl border border-slate-800 bg-navy-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da sua Loja</label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Ex: Lucas Store Oficial"
                        className="w-full rounded-xl border border-slate-800 bg-navy-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seu E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@sualoja.com"
                    className="w-full rounded-xl border border-slate-800 bg-navy-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-navy-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:from-brand-500 hover:to-blue-400 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Entrando...' : authMode === 'register' ? 'Criar Conta e Entrar no Painel' : 'Entrar no Painel'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-navy-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ou continue com</span>
              <div className="border-t border-slate-800 w-full"></div>
            </div>

            {/* Discord OAuth Button */}
            <button
              type="button"
              onClick={handleDiscordLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white py-2.5 px-4 text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.91,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
              <span>{authMode === 'register' ? 'Criar Conta com Discord' : 'Entrar com Discord'}</span>
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              {authMode === 'register' ? (
                <span>Já possui conta? <button onClick={() => setAuthMode('login')} className="text-brand-400 font-bold hover:underline">Fazer Login</button></span>
              ) : (
                <span>Não tem conta? <button onClick={() => setAuthMode('register')} className="text-brand-400 font-bold hover:underline">Cadastre-se grátis</button></span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
