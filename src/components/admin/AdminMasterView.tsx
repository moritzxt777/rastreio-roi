import React, { useState } from 'react';
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
  Check, 
  X,
  Sparkles,
  Lock,
  Activity
} from 'lucide-react';
import { Storage, getTodayDateString } from '../../utils/storage';

export const AdminMasterView: React.FC = () => {
  const { allUsers, adminSetUserLimit, adminResetQuota, currentUser, switchUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newLimit, setNewLimit] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold">PAINEL MASTER</span>
            <span className="text-xs text-slate-400">Controle Global de Cotas Diárias</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Administração de Usuários & Limites Diários
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajuste a cota de 100 códigos/dia de qualquer cliente, libere acesso ilimitado ou monitore o consumo em tempo real.
          </p>
        </div>

        {currentUser.role !== 'admin' && (
          <button
            onClick={() => switchUser('usr_admin')}
            className="rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition flex items-center gap-1.5 shadow"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Entrar como Administrador</span>
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search Bar */}
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

      {/* Users Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Lojista / Usuário</th>
                <th className="py-3.5 px-4">Loja / E-mail</th>
                <th className="py-3.5 px-4">Consumo de Hoje</th>
                <th className="py-3.5 px-4">Cota Diária Configurada</th>
                <th className="py-3.5 px-4">Tipo de Acesso</th>
                <th className="py-3.5 px-4 text-right">Ações Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const userQuota = Storage.getDailyQuota(u.id);
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {u.name}
                        {u.id === currentUser.id && (
                          <span className="text-[9px] bg-brand-500/20 text-brand-300 px-1.5 py-0.2 rounded font-bold">Você</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {u.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{u.storeName}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>

                    {/* Consumed today */}
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

                    {/* Daily Limit */}
                    <td className="py-3.5 px-4">
                      {u.isUnlimited ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ILIMITADO
                        </span>
                      ) : (
                        <span className="font-bold text-brand-400 text-sm font-mono">
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

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="flex items-center space-x-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition"
                          title="Alterar Cota Diária"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Ajustar Cota</span>
                        </button>

                        <button
                          onClick={() => handleReset(u.id, u.name)}
                          className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition"
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

      {/* Edit Quota Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
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

            <div className="space-y-1">
              <p className="text-xs text-slate-400">Usuário: <strong className="text-white">{editingUser.name}</strong></p>
              <p className="text-xs text-slate-400">Loja: <strong className="text-white">{editingUser.storeName}</strong></p>
            </div>

            {/* Unlimited switch */}
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

            {/* Limit Input */}
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
    </div>
  );
};
