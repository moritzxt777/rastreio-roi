import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. If Supabase is configured, authenticate via Supabase Auth
      if (isSupabaseConfigured()) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (authError || !data.user) {
          setLoading(false);
          setError(authError?.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
          return;
        }

        // Verify role in profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role !== 'admin') {
          await supabase.auth.signOut();
          setLoading(false);
          setError('Acesso negado: Este usuário não possui permissões de Administrador Master.');
          return;
        }

        setLoading(false);
        navigate('/admin-master');
        return;
      }

      // 2. Fallback for Dev Environment when Supabase is not configured
      const adminEmailEnv = import.meta.env.VITE_ADMIN_EMAIL || 'admin@rastreioja.com';
      if (email.trim().toLowerCase() === adminEmailEnv.toLowerCase()) {
        localStorage.setItem('rastreio_admin_session', JSON.stringify({
          authenticated: true,
          email: adminEmailEnv,
          role: 'admin',
          loggedInAt: new Date().toISOString()
        }));
        setLoading(false);
        navigate('/admin-master');
      } else {
        setLoading(false);
        setError('Acesso restrito. Utilize seu e-mail de Administrador configurado no Supabase.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Erro durante a autenticação.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 text-slate-100 font-sans">
      <Helmet>
        <title>Acesso Restrito | Painel Administrativo Master</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-brand-500/20">
            <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Painel Master Admin</h1>
          <p className="text-xs text-slate-400">Área restrita para controle de usuários e cotas diárias</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-navy-900/80 p-6 shadow-2xl backdrop-blur-md space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Administrativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@seudominio.com"
                  className="w-full rounded-xl border border-slate-800 bg-navy-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Senha de Acesso</label>
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
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-blue-400 transition active:scale-95 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Autenticando...' : 'Entrar no Painel Master'}</span>
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition font-medium"
          >
            ← Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
};
