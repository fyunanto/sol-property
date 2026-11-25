import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  MessageSquare,
  Plus,
  Receipt,
  Search,
  XCircle,
} from 'lucide-react';
import { Invoice, InvoiceStatus, Property, Room, Tenant } from '../../types';
import {
  buildWhatsAppLink,
  buildWhatsAppReminderText,
  formatDateID,
  formatIDR,
  isInvoiceOverdue,
} from '../../utils/formatters';
import { Modal } from '../ui/Modal';

export interface CreateInvoicePayload {
  tenantId: string;
  period: string;
  periodKey: string;
  rentAmount: number;
  electricityFee: number;
  parkingFee: number;
  otherFeeLabel: string;
  otherFeeAmount: number;
  dueDate: string;
}

interface BillingModuleProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  onCreateInvoice: (payload: CreateInvoicePayload) => void;
  onVerifyPayment: (invoiceId: string, method?: string, reference?: string) => void;
  onRejectPayment: (invoiceId: string) => void;
  externalWhatsAppInvoice: Invoice | null;
  onClearExternalWhatsApp: () => void;
}

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  Lunas: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Menunggu Verifikasi': 'bg-amber-50 text-amber-800 border-amber-200',
  'Belum Bayar': 'bg-[#FEF2F0] text-[#D92B22] border-[#F8C9C3]',
};

export function BillingModule({
  properties,
  rooms,
  tenants,
  invoices,
  onCreateInvoice,
  onVerifyPayment,
  onRejectPayment,
  externalWhatsAppInvoice,
  onClearExternalWhatsApp,
}: BillingModuleProps) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('2026-11');
  const [searchQuery, setSearchQuery] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [whatsAppInvoice, setWhatsAppInvoice] = useState<Invoice | null>(null);
  const [waDraftMessage, setWaDraftMessage] = useState('');
  const [copiedWa, setCopiedWa] = useState(false);

  const [reviewInvoice, setReviewInvoice] = useState<Invoice | null>(null);
  const [manualMethod, setManualMethod] = useState('Transfer BCA');
  const [manualRef, setManualRef] = useState('');

  // Create invoice form
  const activeTenants = useMemo(
    () => tenants.filter((t) => t.contractStatus !== 'Checkout'),
    [tenants]
  );
  const [selectedTenantId, setSelectedTenantId] = useState(activeTenants[0]?.id ?? '');
  const [period, setPeriod] = useState('Desember 2026');
  const [periodKey, setPeriodKey] = useState('2026-12');
  const [rentAmount, setRentAmount] = useState(2450000);
  const [electricityFee, setElectricityFee] = useState(175000);
  const [parkingFee, setParkingFee] = useState(75000);
  const [otherFeeLabel, setOtherFeeLabel] = useState('');
  const [otherFeeAmount, setOtherFeeAmount] = useState(0);
  const [dueDate, setDueDate] = useState('2026-12-10');

  const getTenant = (id: string) => tenants.find((t) => t.id === id);
  const getRoom = (id: string) => rooms.find((r) => r.id === id);
  const getProperty = (id: string) => properties.find((p) => p.id === id);

  // Sync external WA trigger from dashboard
  const activeWaInvoice = whatsAppInvoice ?? externalWhatsAppInvoice;

  const openWhatsAppModal = (inv: Invoice) => {
    const tenant = getTenant(inv.tenantId);
    const prop = getProperty(inv.propertyId);
    const room = getRoom(inv.roomId);
    setWhatsAppInvoice(inv);
    setWaDraftMessage(buildWhatsAppReminderText(inv, tenant, prop, room));
    setCopiedWa(false);
  };

  // If external trigger arrived from dashboard
  React.useEffect(() => {
    if (externalWhatsAppInvoice) {
      const tenant = getTenant(externalWhatsAppInvoice.tenantId);
      const prop = getProperty(externalWhatsAppInvoice.propertyId);
      const room = getRoom(externalWhatsAppInvoice.roomId);
      setWaDraftMessage(buildWhatsAppReminderText(externalWhatsAppInvoice, tenant, prop, room));
      setCopiedWa(false);
    }
  }, [externalWhatsAppInvoice]);

  const closeWhatsAppModal = () => {
    setWhatsAppInvoice(null);
    onClearExternalWhatsApp();
  };

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(waDraftMessage);
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2200);
    } catch {
      setCopiedWa(false);
    }
  };

  const periods = useMemo(() => {
    const map = new Map<string, string>();
    invoices.forEach((inv) => map.set(inv.periodKey, inv.period));
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (periodFilter !== 'ALL' && inv.periodKey !== periodFilter) return false;
      if (propertyFilter !== 'ALL' && inv.propertyId !== propertyFilter) return false;
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
      if (q) {
        const tenantName = getTenant(inv.tenantId)?.fullName.toLowerCase() ?? '';
        const roomNo = getRoom(inv.roomId)?.roomNumber.toLowerCase() ?? '';
        const match =
          inv.invoiceNumber.toLowerCase().includes(q) ||
          tenantName.includes(q) ||
          roomNo.includes(q) ||
          inv.period.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [invoices, periodFilter, propertyFilter, statusFilter, searchQuery, tenants, rooms]);

  const summary = useMemo(() => {
    const base = invoices.filter((inv) => periodFilter === 'ALL' || inv.periodKey === periodFilter);
    return {
      paid: base.filter((i) => i.status === 'Lunas').reduce((s, i) => s + i.totalAmount, 0),
      pendingVerify: base
        .filter((i) => i.status === 'Menunggu Verifikasi')
        .reduce((s, i) => s + i.totalAmount, 0),
      pendingVerifyCount: base.filter((i) => i.status === 'Menunggu Verifikasi').length,
      unpaid: base.filter((i) => i.status === 'Belum Bayar').reduce((s, i) => s + i.totalAmount, 0),
      unpaidCount: base.filter((i) => i.status === 'Belum Bayar').length,
    };
  }, [invoices, periodFilter]);

  const openCreateModal = () => {
    const firstTenant = activeTenants[0];
    setSelectedTenantId(firstTenant?.id ?? '');
    const room = firstTenant ? getRoom(firstTenant.roomId) : undefined;
    setRentAmount(room?.monthlyRate ?? 2400000);
    setPeriod('Desember 2026');
    setPeriodKey('2026-12');
    setElectricityFee(175000);
    setParkingFee(75000);
    setOtherFeeLabel('');
    setOtherFeeAmount(0);
    setDueDate('2026-12-10');
    setCreateOpen(true);
  };

  const handleTenantChange = (tId: string) => {
    setSelectedTenantId(tId);
    const t = getTenant(tId);
    const r = t ? getRoom(t.roomId) : undefined;
    if (r) setRentAmount(r.monthlyRate);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;
    onCreateInvoice({
      tenantId: selectedTenantId,
      period: period.trim(),
      periodKey: periodKey.trim(),
      rentAmount: Number(rentAmount),
      electricityFee: Number(electricityFee),
      parkingFee: Number(parkingFee),
      otherFeeLabel: otherFeeLabel.trim(),
      otherFeeAmount: Number(otherFeeAmount),
      dueDate,
    });
    setCreateOpen(false);
  };

  const openReviewModal = (inv: Invoice) => {
    setReviewInvoice(inv);
    setManualMethod(inv.paymentMethod || 'Transfer BCA');
    setManualRef(inv.paymentReference || `TRF-${inv.invoiceNumber.slice(-3)}-2026`);
  };

  const activeWaTenant = activeWaInvoice ? getTenant(activeWaInvoice.tenantId) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D92B22]">
            Keuangan &amp; Penagihan
          </span>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            Pembayaran &amp; <span className="text-[#D92B22]">Tagihan Sewa</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penerbitan invoice sewa, verifikasi bukti transfer penghuni, dan pengingat WhatsApp 1-klik
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tagihan Baru</span>
        </button>
      </div>

      {/* Billing Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500">Total Lunas (Periode Dipilih)</span>
          <div className="text-xl font-extrabold font-mono text-emerald-700 tabular-nums mt-1.5">
            {formatIDR(summary.paid)}
          </div>
        </div>
        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500">
            Menunggu Verifikasi ({summary.pendingVerifyCount} tagihan)
          </span>
          <div className="text-xl font-extrabold font-mono text-[#EA580C] tabular-nums mt-1.5">
            {formatIDR(summary.pendingVerify)}
          </div>
        </div>
        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500">
            Belum Bayar / Jatuh Tempo ({summary.unpaidCount} tagihan)
          </span>
          <div className="text-xl font-extrabold font-mono text-[#D92B22] tabular-nums mt-1.5">
            {formatIDR(summary.unpaid)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#FDF6F0] rounded-full border border-[#F3E6DD]">
            {(['ALL', 'Belum Bayar', 'Menunggu Verifikasi', 'Lunas'] as const).map((st) => (
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
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            aria-label="Filter periode tagihan"
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
          >
            <option value="ALL">Semua Periode</option>
            {periods.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            aria-label="Filter properti tagihan"
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

        <div className="relative lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. invoice, nama, kamar..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">Tidak ada tagihan pada filter ini</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ubah periode/status atau buat tagihan baru untuk penyewa aktif.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFE7E2] bg-[#FDF6F0]/70 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">No. Invoice & Periode</th>
                  <th className="py-3 px-4">Penyewa & Unit</th>
                  <th className="py-3 px-4 text-right">Sewa Pokok</th>
                  <th className="py-3 px-4 text-right">Biaya Tambahan</th>
                  <th className="py-3 px-4 text-right">Total Tagihan</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.map((inv) => {
                  const tenant = getTenant(inv.tenantId);
                  const room = getRoom(inv.roomId);
                  const prop = getProperty(inv.propertyId);
                  const extraSum = inv.additionalCharges.reduce((s, c) => s + c.amount, 0);
                  const overdue = isInvoiceOverdue(inv);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{inv.period}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{tenant?.fullName ?? '-'}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {prop?.code} · Kamar <span className="font-mono">{room?.roomNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {formatIDR(inv.rentAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-slate-700 tabular-nums">{formatIDR(extraSum)}</div>
                        {inv.additionalCharges.length > 0 && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px] ml-auto">
                            {inv.additionalCharges.map((c) => c.label).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatIDR(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                        <div className={overdue ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
                          {formatDateID(inv.dueDate)}
                        </div>
                        {overdue && (
                          <div className="text-[11px] text-rose-600 font-medium">Lewat jatuh tempo</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${INVOICE_STATUS_STYLES[inv.status]}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {inv.status !== 'Lunas' && (
                            <button
                              type="button"
                              onClick={() => openWhatsAppModal(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WA</span>
                            </button>
                          )}
                          {inv.status === 'Menunggu Verifikasi' ? (
                            <button
                              type="button"
                              onClick={() => openReviewModal(inv)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full cursor-pointer"
                            >
                              Verifikasi
                            </button>
                          ) : inv.status === 'Belum Bayar' ? (
                            <button
                              type="button"
                              onClick={() => openReviewModal(inv)}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
                            >
                              Catat Bayar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openReviewModal(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Bukti</span>
                            </button>
                          )}
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

      {/* 1-Click WhatsApp Reminder Modal */}
      <Modal
        open={Boolean(activeWaInvoice)}
        onClose={closeWhatsAppModal}
        title="Pengingat Tagihan WhatsApp"
        subtitle={
          activeWaInvoice
            ? `${activeWaInvoice.invoiceNumber} · ${activeWaTenant?.fullName ?? ''} (${activeWaTenant?.phone ?? '-'})`
            : ''
        }
        maxWidthClass="max-w-xl"
      >
        {activeWaInvoice && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pratinjau Pesan (dapat disesuaikan sebelum dikirim)
              </label>
              <textarea
                rows={13}
                value={waDraftMessage}
                onChange={(e) => setWaDraftMessage(e.target.value)}
                className="w-full px-3.5 py-3 text-xs font-mono leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                {copiedWa ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin ke Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Pesan</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeWhatsAppModal}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Tutup
                </button>
                <a
                  href={buildWhatsAppLink(activeWaTenant?.phone ?? '', waDraftMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  <span>Buka di WhatsApp (wa.me)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify / Record Payment Modal */}
      <Modal
        open={Boolean(reviewInvoice)}
        onClose={() => setReviewInvoice(null)}
        title={
          reviewInvoice?.status === 'Lunas'
            ? 'Rincian Bukti Pelunasan'
            : reviewInvoice?.status === 'Menunggu Verifikasi'
              ? 'Verifikasi Konfirmasi Transfer'
              : 'Catat Pembayaran Tagihan'
        }
        subtitle={reviewInvoice ? `${reviewInvoice.invoiceNumber} · ${reviewInvoice.period}` : ''}
      >
        {reviewInvoice && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Penyewa</span>
                <span className="font-semibold text-slate-900">
                  {getTenant(reviewInvoice.tenantId)?.fullName} (Kamar{' '}
                  {getRoom(reviewInvoice.roomId)?.roomNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sewa Pokok</span>
                <span className="font-mono tabular-nums">{formatIDR(reviewInvoice.rentAmount)}</span>
              </div>
              {reviewInvoice.additionalCharges.map((c, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-500">{c.label}</span>
                  <span className="font-mono tabular-nums">{formatIDR(c.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Tagihan</span>
                <span className="font-mono tabular-nums">{formatIDR(reviewInvoice.totalAmount)}</span>
              </div>
            </div>

            {reviewInvoice.receiptFileName && (
              <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
                <div className="font-semibold text-blue-900">Konfirmasi Transfer dari Penghuni</div>
                <div className="text-slate-700">
                  Metode: <span className="font-medium">{reviewInvoice.paymentMethod}</span> · Ref:{' '}
                  <span className="font-mono">{reviewInvoice.paymentReference}</span>
                </div>
                <div className="text-slate-700">
                  Lampiran Bukti: <span className="font-mono">{reviewInvoice.receiptFileName}</span>
                </div>
                {reviewInvoice.receiptNote && (
                  <p className="text-slate-600 italic">"{reviewInvoice.receiptNote}"</p>
                )}
              </div>
            )}

            {reviewInvoice.status === 'Lunas' ? (
              <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Terverifikasi Lunas pada {formatDateID(reviewInvoice.paidAt)}</span>
                </div>
                <div>
                  Metode: {reviewInvoice.paymentMethod || 'Transfer Bank'} · No. Ref:{' '}
                  <span className="font-mono">{reviewInvoice.paymentReference || '-'}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="Transfer BNI">Transfer BNI</option>
                    <option value="QRIS SOLProperty">QRIS SOLProperty</option>
                    <option value="Tunai / Cash">Tunai / Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Referensi / Mutasi</label>
                  <input
                    type="text"
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {reviewInvoice.status === 'Menunggu Verifikasi' ? (
                <button
                  type="button"
                  onClick={() => {
                    onRejectPayment(reviewInvoice.id);
                    setReviewInvoice(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tolak Bukti</span>
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewInvoice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
                {reviewInvoice.status !== 'Lunas' && (
                  <button
                    type="button"
                    onClick={() => {
                      onVerifyPayment(reviewInvoice.id, manualMethod, manualRef);
                      setReviewInvoice(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui & Tandai Lunas</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create New Invoice Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Terbitkan Tagihan Sewa Baru"
        subtitle="Tambahkan komponen sewa pokok dan biaya utilitas tambahan untuk penyewa aktif."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Penyewa & Unit</label>
            <select
              required
              value={selectedTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {activeTenants.map((t) => {
                const r = getRoom(t.roomId);
                const p = getProperty(t.propertyId);
                return (
                  <option key={t.id} value={t.id}>
                    {t.fullName} — {p?.code} Kamar {r?.roomNumber} ({formatIDR(r?.monthlyRate ?? 0)})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Label Periode</label>
              <input
                type="text"
                required
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Desember 2026"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Bulan</label>
              <input
                type="month"
                required
                value={periodKey}
                onChange={(e) => setPeriodKey(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jatuh Tempo</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sewa Pokok (IDR)</label>
              <input
                type="number"
                min={0}
                step={50000}
                required
                value={rentAmount}
                onChange={(e) => setRentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Listrik / Air (IDR)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={electricityFee}
                onChange={(e) => setElectricityFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parkir / IPL (IDR)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={parkingFee}
                onChange={(e) => setParkingFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biaya Lainnya (Opsional)
              </label>
              <input
                type="text"
                value={otherFeeLabel}
                onChange={(e) => setOtherFeeLabel(e.target.value)}
                placeholder="Contoh: Paket Laundry"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Lainnya (IDR)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={otherFeeAmount}
                onChange={(e) => setOtherFeeAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Estimasi Total Tagihan</span>
            <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {formatIDR(
                Number(rentAmount) +
                  Number(electricityFee) +
                  Number(parkingFee) +
                  (otherFeeLabel.trim() ? Number(otherFeeAmount) : 0)
              )}
            </span>
          </div>

          <div className="pt-2 border-t border-[#F3EAE5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E5DDD8] hover:bg-slate-50 rounded-full cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full cursor-pointer"
            >
              Terbitkan Tagihan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
