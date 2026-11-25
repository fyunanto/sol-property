import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  LogOut as CheckoutIcon,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ContractStatus, Property, Room, Tenant } from '../../types';
import { buildWhatsAppLink, formatDateID, formatIDR } from '../../utils/formatters';
import { Modal } from '../ui/Modal';

export interface OnboardTenantPayload {
  fullName: string;
  nik: string;
  phone: string;
  email: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  propertyId: string;
  roomId: string;
  checkInDate: string;
  leaseEndDate: string;
  depositAmount: number;
  generateFirstInvoice: boolean;
}

interface TenantsModuleProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  onOnboardTenant: (payload: OnboardTenantPayload) => void;
  onVerifyTenantId: (tenantId: string) => void;
  onCheckoutTenant: (tenantId: string) => void;
}

const CONTRACT_STYLES: Record<ContractStatus, string> = {
  Aktif: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Akan Berakhir': 'bg-amber-50 text-amber-800 border-amber-200',
  Checkout: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function TenantsModule({
  properties,
  rooms,
  tenants,
  onOnboardTenant,
  onVerifyTenantId,
  onCheckoutTenant,
}: TenantsModuleProps) {
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [onboardOpen, setOnboardOpen] = useState(false);

  const vacantRooms = useMemo(() => rooms.filter((r) => r.status === 'Tersedia'), [rooms]);

  // Onboarding form state
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-11-24');
  const [leaseEndDate, setLeaseEndDate] = useState('2027-11-23');
  const [depositAmount, setDepositAmount] = useState(2000000);
  const [generateFirstInvoice, setGenerateFirstInvoice] = useState(true);

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  const getRoom = (id: string) => rooms.find((r) => r.id === id);

  const filteredTenants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tenants.filter((t) => {
      if (propertyFilter !== 'ALL' && t.propertyId !== propertyFilter) return false;
      if (statusFilter !== 'ALL' && t.contractStatus !== statusFilter) return false;
      if (q) {
        const roomNo = getRoom(t.roomId)?.roomNumber.toLowerCase() ?? '';
        const propName = getProperty(t.propertyId)?.name.toLowerCase() ?? '';
        const match =
          t.fullName.toLowerCase().includes(q) ||
          t.phone.toLowerCase().includes(q) ||
          t.nik.includes(q) ||
          roomNo.includes(q) ||
          propName.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tenants, propertyFilter, statusFilter, searchQuery, rooms, properties]);

  const openOnboardModal = () => {
    const firstVacant = vacantRooms[0];
    setFullName('');
    setNik('');
    setPhone('0812-');
    setEmail('');
    setOccupation('');
    setEmergencyContactName('');
    setEmergencyContactPhone('0813-');
    setSelectedRoomId(firstVacant?.id ?? '');
    setDepositAmount(firstVacant?.monthlyRate ?? 2000000);
    setCheckInDate('2026-11-24');
    setLeaseEndDate('2027-11-23');
    setGenerateFirstInvoice(true);
    setOnboardOpen(true);
  };

  const handleRoomSelectionChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const chosen = rooms.find((r) => r.id === roomId);
    if (chosen) {
      setDepositAmount(chosen.monthlyRate);
    }
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenRoom = rooms.find((r) => r.id === selectedRoomId);
    if (!chosenRoom) return;

    onOnboardTenant({
      fullName: fullName.trim(),
      nik: nik.trim(),
      phone: phone.trim(),
      email: email.trim(),
      occupation: occupation.trim() || 'Profesional',
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      propertyId: chosenRoom.propertyId,
      roomId: chosenRoom.id,
      checkInDate,
      leaseEndDate,
      depositAmount: Number(depositAmount),
      generateFirstInvoice,
    });
    setOnboardOpen(false);
  };

  const activeCount = tenants.filter((t) => t.contractStatus === 'Aktif').length;
  const expiringCount = tenants.filter((t) => t.contractStatus === 'Akan Berakhir').length;
  const totalDeposit = tenants
    .filter((t) => t.contractStatus !== 'Checkout')
    .reduce((sum, t) => sum + t.depositAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D92B22]">
            Direktori Penghuni
          </span>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            Data Penyewa &amp; <span className="text-[#D92B22]">Kontrak Sewa</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {activeCount} kontrak aktif · {expiringCount} akan berakhir · Total deposit ditahan{' '}
            <span className="font-mono text-[#111827] font-semibold">{formatIDR(totalDeposit)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={openOnboardModal}
          disabled={vacantRooms.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] disabled:bg-slate-300 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Onboarding Penyewa ({vacantRooms.length} Unit Kosong)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#FDF6F0] rounded-full border border-[#F3E6DD]">
            {(['ALL', 'Aktif', 'Akan Berakhir', 'Checkout'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-[#D92B22] shadow-sm'
                    : 'text-slate-600 hover:text-[#111827]'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            aria-label="Filter properti penyewa"
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
          >
            <option value="ALL">Semua Properti</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIK, WhatsApp, kamar..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Tenant Directory Table */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">Tidak ada data penyewa ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan filter pencarian atau tambahkan penyewa baru ke unit yang tersedia.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFE7E2] bg-[#FDF6F0]/70 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">Nama & Identitas (NIK)</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4">Properti & Unit</th>
                  <th className="py-3 px-4">Masa Sewa</th>
                  <th className="py-3 px-4 text-right">Deposit</th>
                  <th className="py-3 px-4">Status Kontrak</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTenants.map((tenant) => {
                  const prop = getProperty(tenant.propertyId);
                  const room = getRoom(tenant.roomId);

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{tenant.fullName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="font-mono tabular-nums">{tenant.nik}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              tenant.idVerified === 'Terverifikasi'
                                ? 'text-emerald-700 font-medium'
                                : 'text-amber-700 font-medium'
                            }
                          >
                            KTP {tenant.idVerified}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-800 tabular-nums">{tenant.phone}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Darurat: {tenant.emergencyContactName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 font-mono">
                          {room?.roomNumber ?? '-'}{' '}
                          <span className="font-sans font-normal text-slate-500">({room?.type})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{prop?.name}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                        <div className="text-slate-800">{formatDateID(tenant.checkInDate)}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          s.d. {formatDateID(tenant.leaseEndDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatIDR(tenant.depositAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${CONTRACT_STYLES[tenant.contractStatus]}`}
                        >
                          {tenant.contractStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTenant(tenant)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                          <a
                            href={buildWhatsAppLink(
                              tenant.phone,
                              `Halo ${tenant.fullName}, ini dari tim pengelola SOLProperty (${prop?.name ?? ''}).`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-md"
                            aria-label={`Chat WhatsApp ${tenant.fullName}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tenant Detail Modal */}
      <Modal
        open={Boolean(selectedTenant)}
        onClose={() => setSelectedTenant(null)}
        title={selectedTenant?.fullName ?? 'Detail Penyewa'}
        subtitle={
          selectedTenant
            ? `${getProperty(selectedTenant.propertyId)?.name ?? ''} · Unit ${getRoom(selectedTenant.roomId)?.roomNumber ?? '-'}`
            : ''
        }
      >
        {selectedTenant && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">NIK / Identitas KTP</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {selectedTenant.nik}
                </span>
                <span
                  className={`block text-xs mt-0.5 font-medium ${
                    selectedTenant.idVerified === 'Terverifikasi' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  Status KTP: {selectedTenant.idVerified}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Pekerjaan / Instansi</span>
                <span className="font-medium text-slate-900">{selectedTenant.occupation}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">WhatsApp & Email</span>
                <span className="font-mono text-slate-900 block">{selectedTenant.phone}</span>
                <span className="text-xs text-slate-500">{selectedTenant.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Kontak Darurat</span>
                <span className="font-medium text-slate-900 block">
                  {selectedTenant.emergencyContactName}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {selectedTenant.emergencyContactPhone}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Tanggal Check-In</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatDateID(selectedTenant.checkInDate)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Berakhir Kontrak</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatDateID(selectedTenant.leaseEndDate)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Uang Jaminan (Deposit)</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatIDR(selectedTenant.depositAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {selectedTenant.idVerified !== 'Terverifikasi' && (
                  <button
                    type="button"
                    onClick={() => {
                      onVerifyTenantId(selectedTenant.id);
                      setSelectedTenant({ ...selectedTenant, idVerified: 'Terverifikasi' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verifikasi KTP</span>
                  </button>
                )}
                {selectedTenant.contractStatus !== 'Checkout' && (
                  <button
                    type="button"
                    onClick={() => {
                      onCheckoutTenant(selectedTenant.id);
                      setSelectedTenant(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                  >
                    <CheckoutIcon className="w-3.5 h-3.5" />
                    <span>Proses Checkout Unit</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Onboarding Tenant Modal */}
      <Modal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        title="Onboarding Penyewa Baru"
        subtitle="Menempatkan penyewa pada kamar tersedia otomatis mengubah status kamar menjadi Terisi dan menerbitkan tagihan pertama."
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleOnboardSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Bima Sakti Putra"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIK (16 Digit KTP)</label>
              <input
                type="text"
                required
                minLength={12}
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="3276051204970001"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Karyawan / Mahasiswa"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kontak Darurat</label>
              <input
                type="text"
                required
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Contoh: Ibu Dewi (Orang Tua)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telepon Kontak Darurat</label>
              <input
                type="text"
                required
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="0813-9876-5432"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Kamar Tersedia
              </label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => handleRoomSelectionChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {vacantRooms.map((r) => {
                  const p = getProperty(r.propertyId);
                  return (
                    <option key={r.id} value={r.id}>
                      {p?.name} — Kamar {r.roomNumber} ({r.type}) · {formatIDR(r.monthlyRate)}/bln
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Check-In</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Akhir Kontrak Sewa</label>
              <input
                type="date"
                required
                value={leaseEndDate}
                onChange={(e) => setLeaseEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit Jaminan (IDR)</label>
              <input
                type="number"
                min={0}
                step={50000}
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <label className="flex items-start gap-2.5 pt-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={generateFirstInvoice}
                onChange={(e) => setGenerateFirstInvoice(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-xs text-slate-700 leading-snug">
                Otomatis terbitkan tagihan sewa bulan pertama di menu Pembayaran & Tagihan
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-[#F3EAE5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setOnboardOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E5DDD8] hover:bg-slate-50 rounded-full cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan &amp; Tempatkan Penyewa</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
