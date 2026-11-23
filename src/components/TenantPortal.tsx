import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  MessageSquare,
  Plus,
  Printer,
  Receipt,
  Upload,
  Wrench,
} from 'lucide-react';
import {
  Invoice,
  MaintenanceTicket,
  Property,
  Room,
  Tenant,
  TenantTab,
  TicketPriority,
} from '../types';
import {
  buildWhatsAppLink,
  daysUntilDue,
  formatDateID,
  formatIDR,
  isInvoiceOverdue,
} from '../utils/formatters';
import { Modal } from './ui/Modal';

interface TenantPortalProps {
  activeTab: TenantTab;
  onTabChange: (tab: TenantTab) => void;
  tenant: Tenant;
  property: Property;
  room: Room;
  myInvoices: Invoice[];
  myTickets: MaintenanceTicket[];
  onSubmitPaymentConfirmation: (
    invoiceId: string,
    payload: {
      paymentMethod: string;
      paymentReference: string;
      receiptFileName: string;
      receiptNote: string;
    }
  ) => void;
  onSubmitComplaint: (payload: {
    title: string;
    category: MaintenanceTicket['category'];
    description: string;
    priority: TicketPriority;
  }) => void;
  onUpdateEmergencyContact: (name: string, phone: string) => void;
}

export function TenantPortal({
  activeTab,
  onTabChange,
  tenant,
  property,
  room,
  myInvoices,
  myTickets,
  onSubmitPaymentConfirmation,
  onSubmitComplaint,
  onUpdateEmergencyContact,
}: TenantPortalProps) {
  const [confirmInvoice, setConfirmInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Transfer BCA');
  const [paymentReference, setPaymentReference] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptNote, setReceiptNote] = useState('');

  const [complaintOpen, setComplaintOpen] = useState(false);
  const [compTitle, setCompTitle] = useState('');
  const [compCategory, setCompCategory] = useState<MaintenanceTicket['category']>('AC & Pendingin');
  const [compPriority, setCompPriority] = useState<TicketPriority>('Sedang');
  const [compDesc, setCompDesc] = useState('');

  const [editingEmergency, setEditingEmergency] = useState(false);
  const [ecName, setEcName] = useState(tenant.emergencyContactName);
  const [ecPhone, setEcPhone] = useState(tenant.emergencyContactPhone);
  const [imgError, setImgError] = useState(false);

  const sortedInvoices = useMemo(
    () => [...myInvoices].sort((a, b) => b.periodKey.localeCompare(a.periodKey)),
    [myInvoices]
  );

  const unpaidInvoice = useMemo(
    () => sortedInvoices.find((inv) => inv.status === 'Belum Bayar'),
    [sortedInvoices]
  );

  const pendingVerifyInvoice = useMemo(
    () => sortedInvoices.find((inv) => inv.status === 'Menunggu Verifikasi'),
    [sortedInvoices]
  );

  const openTickets = myTickets.filter((t) => t.status !== 'Resolved');

  const openPaymentModal = (inv: Invoice) => {
    setConfirmInvoice(inv);
    setPaymentMethod('Transfer BCA');
    setPaymentReference(`TRF-${inv.invoiceNumber.slice(-3)}-${tenant.fullName.split(' ')[0].toUpperCase()}`);
    setReceiptFileName('');
    setReceiptNote('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmInvoice) return;
    onSubmitPaymentConfirmation(confirmInvoice.id, {
      paymentMethod,
      paymentReference: paymentReference.trim() || 'TRF-MANUAL',
      receiptFileName: receiptFileName.trim() || `bukti_transfer_${confirmInvoice.periodKey}.jpg`,
      receiptNote: receiptNote.trim() || 'Pembayaran telah dikirim ke rekening BCA PT SOL Property Nusantara.',
    });
    setConfirmInvoice(null);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitComplaint({
      title: compTitle.trim(),
      category: compCategory,
      description: compDesc.trim(),
      priority: compPriority,
    });
    setComplaintOpen(false);
    setCompTitle('');
    setCompDesc('');
    setCompPriority('Sedang');
  };

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmergencyContact(ecName.trim(), ecPhone.trim());
    setEditingEmergency(false);
  };

  const dueDiff = unpaidInvoice ? daysUntilDue(unpaidInvoice.dueDate) : null;
  const overdue = unpaidInvoice ? isInvoiceOverdue(unpaidInvoice) : false;

  const managerWaHref = buildWhatsAppLink(
    property.managerPhone,
    `Halo Pak/Bu ${property.managerName}, saya ${tenant.fullName} penghuni Kamar ${room.roomNumber} (${property.name}). Saya ingin mengonfirmasi terkait hunian/tagihan sewa.`
  );

  return (
    <div className="space-y-6">
      {/* In-App Due-Date Reminder Banner (Visible across Overview & Billing if unpaid) */}
      {unpaidInvoice && (activeTab === 'overview' || activeTab === 'billing') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div className="flex items-start gap-3">
            <CalendarClock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                Pengingat Tagihan Sewa {unpaidInvoice.period} —{' '}
                <span className="font-mono">{formatIDR(unpaidInvoice.totalAmount)}</span>
              </h2>
              <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                {overdue
                  ? `Tagihan ${unpaidInvoice.invoiceNumber} telah melewati tanggal jatuh tempo (${formatDateID(unpaidInvoice.dueDate)}).`
                  : `Jatuh tempo pada ${formatDateID(unpaidInvoice.dueDate)} (${dueDiff} hari lagi). Transfer ke BCA 7120-8842-19 a.n. PT SOL Property Nusantara lalu konfirmasi pembayaran Anda.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={managerWaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100/60 rounded-lg whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hubungi Pengelola</span>
            </a>
            <button
              type="button"
              onClick={() => openPaymentModal(unpaidInvoice)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Konfirmasi Pembayaran</span>
            </button>
          </div>
        </div>
      )}

      {/* Pending Verification Notice */}
      {!unpaidInvoice && pendingVerifyInvoice && activeTab === 'overview' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
            <p className="text-xs text-blue-950">
              Bukti transfer untuk <strong>{pendingVerifyInvoice.invoiceNumber}</strong> (
              {formatIDR(pendingVerifyInvoice.totalAmount)}) sedang diverifikasi oleh pengelola properti.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('billing')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap cursor-pointer"
          >
            Lihat Status
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Selamat Datang, {tenant.fullName}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Portal Mandiri Penghuni · {property.name} · Kamar {room.roomNumber} ({room.type})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setComplaintOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Ajukan Komplain / Perbaikan</span>
            </button>
          </div>

          {/* Summary KPI Row (Tenant-Scoped Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs font-medium text-slate-500">Unit Hunian Aktif</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-2">
                Kamar {room.roomNumber}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {room.type} · Lantai {room.floor} · {room.areaSqm} m²
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs font-medium text-slate-500">Tarif Sewa Bulanan</span>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-2">
                {formatIDR(room.monthlyRate)}
              </div>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                Deposit aktif: {formatIDR(tenant.depositAmount)}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs font-medium text-slate-500">Masa Kontrak Sewa</span>
              <div className="text-xl font-bold text-slate-900 mt-2">{tenant.contractStatus}</div>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                Berlaku s.d. {formatDateID(tenant.leaseEndDate)}
              </p>
            </div>
          </div>

          {/* Room & Property Detail Card + Recent Tickets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-5">
                <div className="sm:col-span-2 bg-slate-100 min-h-[180px]">
                  {!imgError ? (
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-3 p-5 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-blue-700">{property.type}</span>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">{property.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {property.address}, {property.city}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-500">Catatan Kamar: </span>
                      <span className="text-slate-800 font-medium">{room.notes || 'Standar unit eksklusif'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fasilitas Gedung: </span>
                      <span className="text-slate-700">{property.facilities.join(' · ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Pengelola Lokasi: </span>
                      <span className="text-slate-800 font-medium">
                        {property.managerName} ({property.managerPhone})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900">Status Perbaikan Kamar Saya</h2>
                  <button
                    type="button"
                    onClick={() => onTabChange('maintenance')}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                  >
                    Kelola ({myTickets.length})
                  </button>
                </div>
                {myTickets.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Belum ada laporan perbaikan untuk Kamar {room.roomNumber}.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 mt-1">
                    {myTickets.slice(0, 3).map((tk) => (
                      <div key={tk.id} className="py-3">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-900 truncate">{tk.title}</span>
                          <span
                            className={`text-[11px] font-semibold shrink-0 ${
                              tk.status === 'Resolved'
                                ? 'text-emerald-700'
                                : tk.status === 'In Progress'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                            }`}
                          >
                            {tk.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {tk.ticketCode} · Teknisi: {tk.assignedTechnician}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>{openTickets.length} laporan sedang ditangani</span>
                <a
                  href={managerWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Chat WA Pengelola
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY BILLING & PAYMENT HISTORY */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tagihan & Riwayat Pembayaran Saya</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Rincian tagihan bulanan Kamar {room.roomNumber} · Rekening transfer BCA 7120-8842-19 a.n. PT SOL
              Property Nusantara
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4">No. Invoice & Periode</th>
                    <th className="py-3 px-4">Rincian Komponen</th>
                    <th className="py-3 px-4 text-right">Total (IDR)</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sortedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{inv.period}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 tabular-nums">
                          Sewa Pokok: <span className="font-mono">{formatIDR(inv.rentAmount)}</span>
                        </div>
                        {inv.additionalCharges.map((c, idx) => (
                          <div key={idx} className="text-[11px] text-slate-500 tabular-nums">
                            + {c.label}: <span className="font-mono">{formatIDR(c.amount)}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatIDR(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap tabular-nums text-slate-700">
                        {formatDateID(inv.dueDate)}
                        {inv.paidAt && (
                          <div className="text-[11px] text-emerald-700">Dibayar {formatDateID(inv.paidAt)}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            inv.status === 'Lunas'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : inv.status === 'Menunggu Verifikasi'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {inv.status === 'Belum Bayar' ? (
                          <button
                            type="button"
                            onClick={() => openPaymentModal(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Konfirmasi Transfer</span>
                          </button>
                        ) : inv.status === 'Menunggu Verifikasi' ? (
                          <span className="text-[11px] text-blue-700 font-medium">
                            Bukti terkirim ({inv.receiptFileName})
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {inv.paymentReference || 'LUNAS'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY MAINTENANCE COMPLAINTS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Komplain & Perbaikan Kamar</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Laporkan kendala fasilitas di Kamar {room.roomNumber} dan pantau progres teknisi
              </p>
            </div>
            <button
              type="button"
              onClick={() => setComplaintOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan Baru</span>
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Wrench className="w-9 h-9 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Belum ada laporan kerusakan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Klik "Buat Laporan Baru" apabila terdapat kendala AC, air, listrik, atau Wi-Fi di kamar Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map((tk) => (
                <div
                  key={tk.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-700">{tk.ticketCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tk.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Dilaporkan {formatDateID(tk.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          tk.priority === 'Tinggi'
                            ? 'text-rose-700 font-semibold'
                            : tk.priority === 'Sedang'
                              ? 'text-amber-700 font-semibold'
                              : 'text-slate-600'
                        }
                      >
                        Prioritas {tk.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{tk.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{tk.description}</p>
                    <p className="text-xs text-slate-500 pt-1">
                      Teknisi: <span className="font-medium text-slate-800">{tk.assignedTechnician}</span>
                      {tk.resolvedAt && (
                        <>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span className="text-emerald-700">Selesai {formatDateID(tk.resolvedAt)}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <span
                    className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded border whitespace-nowrap shrink-0 ${
                      tk.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : tk.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {tk.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LEASE CONTRACT & PROFILE */}
      {activeTab === 'contract' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kontrak Sewa & Profil Penghuni</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Dokumen ringkasan perjanjian sewa unit dan data kontak darurat pribadi Anda
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Ringkasan Kontrak</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Perjanjian Sewa Unit — {property.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {property.address}, {property.city}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                Status Kontrak: {tenant.contractStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Lengkap Penghuni</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{tenant.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">NIK / Identitas KTP</span>
                <span className="text-sm font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
                  {tenant.nik}
                </span>
                <span className="text-emerald-700 font-medium">KTP {tenant.idVerified}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pekerjaan / Instansi</span>
                <span className="text-sm font-medium text-slate-900 mt-0.5 block">{tenant.occupation}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nomor Unit & Tipe</span>
                <span className="text-sm font-mono font-semibold text-slate-900 mt-0.5 block">
                  Kamar {room.roomNumber} · {room.type} ({room.areaSqm} m²)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Periode Sewa</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block tabular-nums">
                  {formatDateID(tenant.checkInDate)} — {formatDateID(tenant.leaseEndDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tarif & Uang Jaminan</span>
                <span className="text-sm font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
                  {formatIDR(room.monthlyRate)} / bln
                </span>
                <span className="text-slate-500 font-mono tabular-nums">
                  Deposit: {formatIDR(tenant.depositAmount)}
                </span>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Kontak Darurat Terdaftar</h3>
                {!editingEmergency && (
                  <button
                    type="button"
                    onClick={() => {
                      setEcName(tenant.emergencyContactName);
                      setEcPhone(tenant.emergencyContactPhone);
                      setEditingEmergency(true);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 no-print cursor-pointer"
                  >
                    Perbarui Kontak Darurat
                  </button>
                )}
              </div>

              {editingEmergency ? (
                <form onSubmit={handleEmergencySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nama Kontak Darurat</label>
                    <input
                      type="text"
                      required
                      value={ecName}
                      onChange={(e) => setEcName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nomor Telepon</label>
                    <input
                      type="text"
                      required
                      value={ecPhone}
                      onChange={(e) => setEcPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEmergency(false)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{tenant.emergencyContactName}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-mono">{tenant.emergencyContactPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      <Modal
        open={Boolean(confirmInvoice)}
        onClose={() => setConfirmInvoice(null)}
        title="Konfirmasi Pembayaran Sewa"
        subtitle={
          confirmInvoice
            ? `${confirmInvoice.invoiceNumber} · Total ${formatIDR(confirmInvoice.totalAmount)}`
            : ''
        }
      >
        {confirmInvoice && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-900">Tujuan Transfer Resmi SOLProperty</div>
              <div className="text-slate-600">Bank BCA · No. Rekening: <strong className="font-mono text-slate-900">7120-8842-19</strong></div>
              <div className="text-slate-600">Atas Nama: PT SOL Property Nusantara</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Transfer</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer Mandiri">Transfer Mandiri</option>
                  <option value="Transfer BNI">Transfer BNI</option>
                  <option value="Transfer BRI">Transfer BRI</option>
                  <option value="QRIS SOLProperty">QRIS SOLProperty</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Referensi Transfer</label>
                <input
                  type="text"
                  required
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Contoh: TRF-BCA-231126"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unggah Bukti Transfer (JPG / PNG / PDF)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setReceiptFileName(file.name);
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              />
              {receiptFileName && (
                <p className="text-[11px] text-emerald-700 font-mono mt-1.5">
                  File terpilih: {receiptFileName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                placeholder="Contoh: Sudah ditransfer lunas dari m-BCA a.n. Raka Pratama"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirim Bukti Pembayaran</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* New Maintenance Complaint Modal */}
      <Modal
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        title="Ajukan Komplain & Perbaikan Kamar"
        subtitle={`Kamar ${room.roomNumber} · ${property.name}`}
      >
        <form onSubmit={handleComplaintSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Masalah</label>
              <select
                value={compCategory}
                onChange={(e) => setCompCategory(e.target.value as MaintenanceTicket['category'])}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="AC & Pendingin">AC & Pendingin</option>
                <option value="Air & Sanitasi">Air & Sanitasi</option>
                <option value="Listrik & Lampu">Listrik & Lampu</option>
                <option value="Internet & Wi-Fi">Internet & Wi-Fi</option>
                <option value="Furnitur & Kunci">Furnitur & Kunci</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Urgensi</label>
              <select
                value={compPriority}
                onChange={(e) => setCompPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Rendah">Rendah (Tidak Mendesak)</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi (Mendesak)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Keluhan</label>
            <input
              type="text"
              required
              value={compTitle}
              onChange={(e) => setCompTitle(e.target.value)}
              placeholder="Contoh: Keran shower kamar mandi bocor pelan"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Penjelasan Detail</label>
            <textarea
              rows={3}
              required
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              placeholder="Tuliskan detail kerusakan dan jadwal kunjungan teknisi yang nyaman bagi Anda..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setComplaintOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Kirim Laporan Perbaikan</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
