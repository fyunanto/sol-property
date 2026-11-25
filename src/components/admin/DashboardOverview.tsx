import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import {
  ActivityLog,
  AdminTab,
  Invoice,
  MaintenanceTicket,
  MonthlyRevenuePoint,
  Property,
  Room,
  Tenant,
} from '../../types';
import {
  daysUntilDue,
  formatCompactIDR,
  formatDateID,
  formatIDR,
  isInvoiceOverdue,
} from '../../utils/formatters';

interface DashboardOverviewProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  historicalRevenue: MonthlyRevenuePoint[];
  activities: ActivityLog[];
  onNavigate: (tab: AdminTab) => void;
  onOpenWhatsAppReminder: (invoice: Invoice) => void;
  onVerifyInvoice: (invoiceId: string) => void;
}

export function DashboardOverview({
  properties,
  rooms,
  tenants,
  invoices,
  tickets,
  historicalRevenue,
  activities,
  onNavigate,
  onOpenWhatsAppReminder,
  onVerifyInvoice,
}: DashboardOverviewProps) {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'Terisi').length;
  const vacantRooms = rooms.filter((r) => r.status === 'Tersedia').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const currentPeriodKey = '2026-11';
  const currentMonthInvoices = invoices.filter((inv) => inv.periodKey === currentPeriodKey);
  const currentMonthPaid = currentMonthInvoices
    .filter((inv) => inv.status === 'Lunas')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const pendingVerificationInvoices = invoices.filter((inv) => inv.status === 'Menunggu Verifikasi');
  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'Lunas');
  const overdueOrUnpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const overdueCount = unpaidInvoices.filter((inv) => isInvoiceOverdue(inv)).length;

  const openTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;

  const currentMonthPotential = currentMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const revenueSeries: MonthlyRevenuePoint[] = [
    ...historicalRevenue,
    {
      periodKey: currentPeriodKey,
      label: 'Nov 26',
      revenue: currentMonthPaid,
      target: Math.max(currentMonthPotential, 48000000),
      occupancyRate,
    },
  ];
  const maxChartVal = Math.max(...revenueSeries.map((m) => Math.max(m.revenue, m.target)), 50000000);

  const ringRadius = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (occupancyRate / 100) * ringCircumference;

  const dueAlerts = [...unpaidInvoices]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const getTenant = (id: string) => tenants.find((t) => t.id === id);
  const getRoom = (id: string) => rooms.find((r) => r.id === id);
  const getProperty = (id: string) => properties.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D92B22]">
            Ringkasan Eksekutif
          </span>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            Ringkasan <span className="text-[#D92B22]">Properti &amp; Okupansi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Periode operasional November 2026 · {properties.length} lokasi aktif · {totalRooms} total unit
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('tenants')}
            className="px-4 py-2 text-xs font-semibold text-[#D92B22] bg-white border border-[#D92B22]/35 hover:bg-[#FEF2F0] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Onboarding Penyewa
          </button>
          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <span>Kelola Tagihan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards (SOL Agency Card Pillar Tone: Soft Blush Icon Medallions + Warm Hairline Borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Properti &amp; Unit</span>
            <div className="w-8 h-8 rounded-full bg-[#FEF2F0] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#D92B22]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#111827] tabular-nums">
              {properties.length} Lokasi · {totalRooms} Unit
            </div>
            <p className="text-xs text-slate-500 mt-1.5 tabular-nums">
              {occupiedRooms} Terisi · {vacantRooms} Tersedia · {maintenanceRooms} Perbaikan
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-500">Tingkat Hunian</span>
            <div className="text-2xl font-extrabold text-[#D92B22] tabular-nums mt-2">
              {occupancyRate}%
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1.5 tabular-nums">
              {occupiedRooms} dari {totalRooms} unit produktif
            </p>
          </div>
          <div className="relative w-16 h-16 shrink-0" aria-label={`Tingkat hunian ${occupancyRate}%`}>
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r={ringRadius} fill="none" stroke="#F5EAE4" strokeWidth="6" />
              <circle
                cx="30"
                cy="30"
                r={ringRadius}
                fill="none"
                stroke="#D92B22"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#111827] tabular-nums">
              {occupancyRate}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pendapatan Sewa Bulan Ini</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#111827] font-mono tabular-nums tracking-tight">
              {formatIDR(currentMonthPaid)}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 tabular-nums">
              Target tagihan Nov:{' '}
              <span className="font-mono text-[#111827] font-medium">
                {formatCompactIDR(currentMonthPotential)}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tagihan Belum Lunas</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-[#EA580C]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#111827] font-mono tabular-nums tracking-tight">
              {formatIDR(overdueOrUnpaidTotal)}
            </div>
            <p className="text-xs mt-1.5 tabular-nums">
              <span className="text-[#D92B22] font-semibold">{overdueCount} lewat jatuh tempo</span>
              <span className="text-slate-300 mx-1.5">·</span>
              <span className="text-[#EA580C] font-semibold">
                {pendingVerificationInvoices.length} perlu verifikasi
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Row: 6-Month Revenue Chart + Unit Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#EFE7E2] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#F3EAE5]">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Pendapatan Sewa 6 Bulan Terakhir</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Realisasi kas masuk sewa (IDR) dibandingkan proyeksi tagihan bulanan
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D92B22]" />
                Kas Masuk
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F3E6DD]" />
                Proyeksi Target
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-6 gap-3 sm:gap-5 items-end h-56 pt-4">
              {revenueSeries.map((item) => {
                const revenuePct = Math.max(8, Math.round((item.revenue / maxChartVal) * 100));
                const targetPct = Math.max(10, Math.round((item.target / maxChartVal) * 100));
                const isCurrent = item.periodKey === currentPeriodKey;

                return (
                  <div key={item.periodKey} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[11px] font-mono tabular-nums text-slate-600 mb-2 font-medium">
                      {formatCompactIDR(item.revenue)}
                    </span>
                    <div className="w-full max-w-[56px] flex items-end justify-center gap-1 h-40">
                      <div
                        className="w-1/2 rounded-t-md bg-[#F3E6DD] transition-all duration-200"
                        style={{ height: `${targetPct}%` }}
                        title={`Target ${item.label}: ${formatIDR(item.target)}`}
                      />
                      <div
                        className={`w-1/2 rounded-t-md transition-all duration-200 ${
                          isCurrent
                            ? 'bg-gradient-to-t from-[#D92B22] to-[#EA580C]'
                            : 'bg-gradient-to-t from-[#D92B22]/85 to-[#F97316]/85 group-hover:from-[#D92B22] group-hover:to-[#EA580C]'
                        }`}
                        style={{ height: `${revenuePct}%` }}
                        title={`Kas Masuk ${item.label}: ${formatIDR(item.revenue)}`}
                      />
                    </div>
                    <div className="mt-2.5 text-center">
                      <div className={`text-xs font-medium ${isCurrent ? 'text-[#D92B22] font-bold' : 'text-slate-700'}`}>
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums">{item.occupancyRate}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#EFE7E2] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F3EAE5]">
              <div>
                <h2 className="text-base font-bold text-[#111827]">Komposisi Status Unit</h2>
                <p className="text-xs text-slate-500 mt-0.5">Distribusi seluruh kamar aktif</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('rooms')}
                className="text-xs font-semibold text-[#D92B22] hover:text-[#B91C1C] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Detail</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-5">
              <div className="h-3 w-full rounded-full bg-[#F5EAE4] overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${totalRooms ? (occupiedRooms / totalRooms) * 100 : 0}%` }}
                />
                <div
                  className="bg-[#D92B22] h-full"
                  style={{ width: `${totalRooms ? (vacantRooms / totalRooms) * 100 : 0}%` }}
                />
                <div
                  className="bg-[#F59E0B] h-full"
                  style={{ width: `${totalRooms ? (maintenanceRooms / totalRooms) * 100 : 0}%` }}
                />
              </div>

              <div className="mt-4 divide-y divide-[#F3EAE5]">
                <div className="py-2.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                    Terisi (Occupied)
                  </span>
                  <span className="font-mono font-semibold text-[#111827] tabular-nums">
                    {occupiedRooms} unit ({totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%)
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#D92B22]" />
                    Tersedia (Vacant)
                  </span>
                  <span className="font-mono font-semibold text-[#111827] tabular-nums">
                    {vacantRooms} unit ({totalRooms ? Math.round((vacantRooms / totalRooms) * 100) : 0}%)
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                    Perbaikan (Maintenance)
                  </span>
                  <span className="font-mono font-semibold text-[#111827] tabular-nums">
                    {maintenanceRooms} unit ({totalRooms ? Math.round((maintenanceRooms / totalRooms) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#F3EAE5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111827]">Okupansi per Properti</span>
              <span className="text-xs text-slate-500">{openTicketsCount} tiket perbaikan aktif</span>
            </div>
            {properties.map((prop) => {
              const propRooms = rooms.filter((r) => r.propertyId === prop.id);
              const propOcc = propRooms.filter((r) => r.status === 'Terisi').length;
              const pct = propRooms.length ? Math.round((propOcc / propRooms.length) * 100) : 0;
              return (
                <div key={prop.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate pr-2">{prop.name}</span>
                    <span className="font-mono text-slate-600 tabular-nums shrink-0">
                      {propOcc}/{propRooms.length} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#F5EAE4] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#EA580C] to-[#D92B22] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Operational Row: Upcoming Due-Date Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#EFE7E2] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EFE7E2] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Peringatan Jatuh Tempo &amp; Antrean Verifikasi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tindak lanjuti tagihan tertunggak atau verifikasi transfer penghuni secara langsung
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('billing')}
              className="text-xs font-semibold text-[#D92B22] hover:text-[#B91C1C] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Lihat Semua →
            </button>
          </div>

          {dueAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#111827]">Semua tagihan bulan ini telah lunas</p>
              <p className="text-xs text-slate-500 mt-1">Tidak ada tunggakan atau bukti transfer yang tertunda.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3EAE5]">
              {dueAlerts.map((inv) => {
                const tenant = getTenant(inv.tenantId);
                const room = getRoom(inv.roomId);
                const prop = getProperty(inv.propertyId);
                const overdue = isInvoiceOverdue(inv);
                const diff = daysUntilDue(inv.dueDate);

                return (
                  <div
                    key={inv.id}
                    className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FDF6F0]/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                        <span className="truncate">{tenant?.fullName ?? 'Penyewa'}</span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="font-mono text-xs text-slate-600 shrink-0">
                          {room?.roomNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                        <span>{prop?.name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Jatuh tempo {formatDateID(inv.dueDate)}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            inv.status === 'Menunggu Verifikasi'
                              ? 'text-[#EA580C]'
                              : overdue
                                ? 'text-[#D92B22]'
                                : 'text-amber-700'
                          }`}
                        >
                          {inv.status === 'Menunggu Verifikasi'
                            ? 'Menunggu Verifikasi Bukti'
                            : overdue
                              ? `Terlambat ${Math.abs(diff)} hari`
                              : `H-${diff} hari lagi`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-sm font-mono font-bold text-[#111827] tabular-nums">
                        {formatIDR(inv.totalAmount)}
                      </span>
                      {inv.status === 'Menunggu Verifikasi' ? (
                        <button
                          type="button"
                          onClick={() => onVerifyInvoice(inv.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Verifikasi Lunas
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsAppReminder(inv)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#D92B22] bg-white border border-[#D92B22]/35 hover:bg-[#FEF2F0] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Pengingat WA</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-[#EFE7E2] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#EFE7E2] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Aktivitas Operasional Terbaru</h2>
              <p className="text-xs text-slate-500 mt-0.5">Jejak pembayaran, penghuni, &amp; pemeliharaan</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('maintenance')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#D92B22] hover:text-[#B91C1C] cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{openTicketsCount} Tiket</span>
            </button>
          </div>

          <div className="divide-y divide-[#F3EAE5] flex-1">
            {activities.slice(0, 6).map((act) => (
              <div key={act.id} className="px-6 py-3.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-bold text-[#111827]">{act.actor}</span>
                  <span className="font-mono tabular-nums shrink-0">{act.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signature SOL Agency Gradient Operational Callout Banner */}
      <div className="sol-gradient-banner rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_12px_32px_rgba(217,43,34,0.18)]">
        <div>
          <h3 className="text-base font-extrabold tracking-tight">
            Rekapitulasi Keuangan &amp; Okupansi Siap Ekspor
          </h3>
          <p className="text-xs text-white/90 mt-1">
            Unduh laporan lengkap CSV/Excel atau cetak laporan resmi PT Solusi Optima Laju untuk periode November 2026.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('reports')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-[#D92B22] bg-white hover:bg-[#FEF2F0] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <span>Buka Laporan Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
