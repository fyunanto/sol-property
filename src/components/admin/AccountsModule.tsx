import React, { useState } from 'react';
import { Plus, Shield, UserCheck } from 'lucide-react';
import { Room, Tenant, UserAccount, UserRole } from '../../types';
import { Modal } from '../ui/Modal';

interface AccountsModuleProps {
  accounts: UserAccount[];
  tenants: Tenant[];
  rooms: Room[];
  currentUserId: string;
  onToggleAccountActive: (accountId: string) => void;
  onCreateAccount: (account: Omit<UserAccount, 'id' | 'lastLogin'>) => void;
}

export function AccountsModule({
  accounts,
  tenants,
  rooms,
  currentUserId,
  onToggleAccountActive,
  onCreateAccount,
}: AccountsModuleProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('User123*');
  const [role, setRole] = useState<UserRole>('tenant');
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id ?? '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedTenant = role === 'tenant' ? tenants.find((t) => t.id === selectedTenantId) : undefined;
    const linkedRoom = linkedTenant ? rooms.find((r) => r.id === linkedTenant.roomId) : undefined;

    onCreateAccount({
      username: username.trim().toLowerCase(),
      password,
      role,
      fullName: role === 'tenant' && linkedTenant ? linkedTenant.fullName : fullName.trim(),
      roleLabel:
        role === 'admin'
          ? 'Property Manager'
          : `Penghuni · Kamar ${linkedRoom?.roomNumber ?? '-'}`,
      email: role === 'tenant' && linkedTenant ? linkedTenant.email : email.trim(),
      phone: role === 'tenant' && linkedTenant ? linkedTenant.phone : phone.trim(),
      tenantId: role === 'tenant' ? linkedTenant?.id : undefined,
      active: true,
    });
    setCreateOpen(false);
    setUsername('');
    setFullName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Akun & Hak Akses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola akun Pemilik/Manajer dan akses Portal Mandiri Penghuni dengan isolasi peran ketat
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Akun Baru</span>
        </button>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Peran & Ruang Lingkup</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Login Terakhir</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {accounts.map((acc) => {
                const isSelf = acc.id === currentUserId;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {acc.fullName}
                      {isSelf && <span className="text-slate-400 font-normal ml-1.5">(Anda)</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">{acc.username}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                        {acc.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-blue-700" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                        <span>{acc.roleLabel}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-700">{acc.email}</div>
                      <div className="font-mono text-[11px] text-slate-500">{acc.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {acc.lastLogin}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          acc.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {acc.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => onToggleAccountActive(acc.id)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-md cursor-pointer disabled:cursor-not-allowed"
                      >
                        {acc.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tambah Akun Portal"
        subtitle="Buat akses baru untuk penghuni terdaftar atau manajer operasional."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Peran Akun</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="tenant">Penghuni (Portal Mandiri)</option>
                <option value="admin">Owner / Manajer (Admin Penuh)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: user02"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {role === 'tenant' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hubungkan ke Data Penyewa
              </label>
              <select
                required
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {tenants.map((t) => {
                  const r = rooms.find((rm) => rm.id === t.roomId);
                  return (
                    <option key={t.id} value={t.id}>
                      {t.fullName} — Kamar {r?.roomNumber ?? '-'} ({t.contractStatus})
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Awal</label>
            <input
              type="text"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
