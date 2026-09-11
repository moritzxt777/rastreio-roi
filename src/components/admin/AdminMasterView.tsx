import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Edit3, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Search, 
  X,
  LogOut,
  Package,
  Activity,
  Plus
} from 'lucide-react';
import { Storage } from '../../utils/storage';

export const AdminMasterView: React.FC = () => {
  const navigate = useNavigate();
  const { allUsers, adminSetUserLimit, adminResetQuota } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newLimit, setNewLimit] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Check admin session
  useEffect(() => {
    const rawSession = localStorage.getItem('rastreio_admin_session');
    if (!rawSession) {
      navigate('/admin-login');
      return;
    }
    try {
      const sess = JSON.parse(rawSession);
      if (!sess.authenticated || sess.role !== 'admin') {
        navigate('/admin-login');
      }
    } catch {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('rastreio_admin_session');
    navigate('/admin-login');
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setNewLimit(user.dailyLimit || 100);
    setIsUnlimited(!!user.isUnlimited);
  };

  const handleSaveLimit = () => {
    if (!editingUser) return;
    adminSetUserLimit(editingUser.id, Number(newLimit), isUnlimited);
    setActionSuccess(`Cota diária de ${editingUser.name} alterada para ${isUnlimited ? 'ILIMITADA' : `${newLimit} códigos/dia`}!`);
    setEditingUser(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReset = (userId: string, userName: string) => {
    adminResetQuota(userId);
    setActionSuccess(`Cota diária de hoje do usuário ${userName} foi zerada para 0 consumidos!`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Helmet>
        <title>Painel Master Admin | Controle de Cotas & Usuários</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Admin Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-30 px-6 py-3.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm text-white">PAINEL MASTER ADMINISTRATIVO</span>
                <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold">ACESSO PRIVADO</span>
              </div>
              <p className="text-[10px] text-slate-400">Controle Global de Cotas Diárias & Lojistas</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white transition"
            >
              Ir para Loja / Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500 hover:text-white transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Admin Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <span className="text-xs font-bold text-slate-400">Total de Lojistas Cadastrados</span>
            <div className="text-2xl font-black text-white mt-1">{allUsers.length} lojistas</div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
            <span className="text-xs font-bold text-amber-400">Cota Padrão do Sistema</span>
            <div className="text-2xl font-black text-white mt-1">100 códigos / dia</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Zera diariamente à meia-noite</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <span className="text-xs font-bold text-slate-400">Status do Servidor</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" /> Operando 100%
            </div>
          </div>
        </div>

        {actionSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filtrar por nome, e-mail ou loja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Lojista / Usuário</th>
                  <th className="py-3.5 px-4">Loja / E-mail</th>
                  <th className="py-3.5 px-4">Consumo de Hoje</th>
                  <th className="py-3.5 px-4">Cota Diária Liberada</th>
                  <th className="py-3.5 px-4">Perfil</th>
                  <th className="py-3.5 px-4 text-right">Ações de Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const userQuota = Storage.getDailyQuota(u.id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {u.id}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{u.storeName}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{userQuota.used} códigos</span>
                          <span className="text-[10px] text-slate-500">
                            / {userQuota.isUnlimited ? '∞' : userQuota.limit}
                          </span>
                        </div>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-emerald-400"
                            style={{ width: `${userQuota.isUnlimited ? 100 : Math.min(100, (userQuota.used / userQuota.limit) * 100)}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.isUnlimited ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ILIMITADO
                          </span>
                        ) : (
                          <span className="font-bold text-amber-400 text-sm font-mono">
                            {u.dailyLimit || 100} <span className="text-xs text-slate-400 font-sans">/ dia</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role === 'admin' ? 'Master Admin' : 'Lojista Padrão'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="flex items-center space-x-1 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Alterar Cota</span>
                          </button>

                          <button
                            onClick={() => handleReset(u.id, u.name)}
                            className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
                            title="Zerar cota consumida hoje"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Alteração de Cota */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  Alterar Cota Diária do Usuário
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-slate-500 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-400">Usuário: <strong className="text-white">{editingUser.name}</strong></p>
                <p className="text-slate-400">Loja: <strong className="text-white">{editingUser.storeName}</strong></p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Acesso Ilimitado (Sem Cota)</span>
                  <p className="text-[11px] text-slate-400">Liberar geração infinita de códigos</p>
                </div>
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
              </div>

              {!isUnlimited && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantidade de Códigos por Dia:
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[100, 250, 500, 1000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewLimit(val)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          newLimit === val ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {val}/dia
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={newLimit}
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLimit}
                  className="w-1/2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                >
                  Salvar Nova Cota
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
