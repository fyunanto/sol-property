import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Invoice, MaintenanceTicket, Property, Room, Tenant } from '../../types';
import { exportToCSV, formatDateID, formatIDR } from '../../utils/formatters';

interface ReportsModuleProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  onExportToast: (message: string) => void;
}

export function ReportsModule({
  properties,
  rooms,
  tenants,
  invoices,
  tickets,
  onExportToast,
}: ReportsModuleProps) {
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('2026-11');

  const periods = useMemo(() => {
    const map = new Map<string, string>();
    invoices.forEach((inv) => map.set(inv.periodKey, inv.period));
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [invoices]);

  const scopedProperties = useMemo(
    () => (propertyFilter === 'ALL' ? properties : properties.filter((p) => p.id === propertyFilter)),
    [properties, propertyFilter]
  );

  const reportRows = useMemo(() => {
    return scopedProperties.map((prop) => {
      const propRooms = rooms.filter((r) => r.propertyId === prop.id);
      const occupied = propRooms.filter((r) => r.status === 'Terisi').length;
      const occupancyPct = propRooms.length > 0 ? Math.round((occupied / propRooms.length) * 100) : 0;

      const propInvoices = invoices.filter(
        (inv) => inv.propertyId === prop.id && (periodFilter === 'ALL' || inv.periodKey === periodFilter)
      );
      const cashIn = propInvoices
        .filter((inv) => inv.status === 'Lunas')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      const receivables = propInvoices
        .filter((inv) => inv.status !== 'Lunas')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      const propMaintenance = tickets
        .filter((t) => t.propertyId === prop.id && (periodFilter === 'ALL' || t.createdAt.startsWith(periodFilter)))
        .reduce((sum, t) => sum + t.cost, 0);

      return {
        property: prop,
        totalUnits: propRooms.length,
        occupiedUnits: occupied,
        occupancyPct,
        cashIn,
        receivables,
        maintenanceExpense: propMaintenance,
        netOperatingIncome: cashIn - propMaintenance,
      };
    });
  }, [scopedProperties, rooms, invoices, tickets, periodFilter]);

  const totals = useMemo(() => {
    return reportRows.reduce(
      (acc, r) => ({
        totalUnits: acc.totalUnits + r.totalUnits,
        occupiedUnits: acc.occupiedUnits + r.occupiedUnits,
        cashIn: acc.cashIn + r.cashIn,
        receivables: acc.receivables + r.receivables,
        maintenanceExpense: acc.maintenanceExpense + r.maintenanceExpense,
        netOperatingIncome: acc.netOperatingIncome + r.netOperatingIncome,
      }),
      {
        totalUnits: 0,
        occupiedUnits: 0,
        cashIn: 0,
        receivables: 0,
        maintenanceExpense: 0,
        netOperatingIncome: 0,
      }
    );
  }, [reportRows]);

  const scopedInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        (propertyFilter === 'ALL' || inv.propertyId === propertyFilter) &&
        (periodFilter === 'ALL' || inv.periodKey === periodFilter)
    );
  }, [invoices, propertyFilter, periodFilter]);

  const selectedPeriodLabel =
    periodFilter === 'ALL'
      ? 'Semua Periode'
      : periods.find(([k]) => k === periodFilter)?.[1] ?? periodFilter;

  const handleDownloadCSV = () => {
    const headers = [
      'Properti',
      'Tipe',
      'Total Unit',
      'Unit Terisi',
      'Okupansi (%)',
      'Kas Masuk Sewa (IDR)',
      'Piutang Belum Lunas (IDR)',
      'Biaya Perawatan (IDR)',
      'Pendapatan Operasional Bersih (IDR)',
    ];
    const rows = reportRows.map((r) => [
      r.property.name,
      r.property.type,
      r.totalUnits,
      r.occupiedUnits,
      r.occupancyPct,
      r.cashIn,
      r.receivables,
      r.maintenanceExpense,
      r.netOperatingIncome,
    ]);
    rows.push([
      'TOTAL PORTOFOLIO',
      '-',
      totals.totalUnits,
      totals.occupiedUnits,
      totals.totalUnits ? Math.round((totals.occupiedUnits / totals.totalUnits) * 100) : 0,
      totals.cashIn,
      totals.receivables,
      totals.maintenanceExpense,
      totals.netOperatingIncome,
    ]);

    exportToCSV(`SOLProperty_Laporan_${periodFilter}.csv`, headers, rows);
    onExportToast(`Laporan CSV (${selectedPeriodLabel}) berhasil diunduh.`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getTenant = (id: string) => tenants.find((t) => t.id === id);
  const getRoom = (id: string) => rooms.find((r) => r.id === id);
  const getProperty = (id: string) => properties.find((p) => p.id === id);

  return (
    <div className="space-y-6 print-full-width">
      {/* Print-Only Formal Letterhead */}
      <div className="hidden print-only pb-4 mb-4 border-b-2 border-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">SOLProperty — Laporan Keuangan & Okupansi</h1>
            <p className="text-xs text-slate-600">
              PT SOL Property Nusantara · https://solproperty.solagency.id
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Periode: {selectedPeriodLabel}</div>
            <div>Dicetak: 23 Nov 2026</div>
          </div>
        </div>
      </div>

      {/* Screen Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Laporan Lengkap Keuangan & Hunian</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rekapitulasi kas masuk, piutang sewa, biaya perawatan, dan tingkat hunian per lokasi properti
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh CSV / Excel</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 no-print">
        <div className="flex items-center gap-2">
          <label htmlFor="rep-period" className="text-xs font-semibold text-slate-600">
            Periode:
          </label>
          <select
            id="rep-period"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg"
          >
            <option value="ALL">Semua Periode</option>
            {periods.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rep-prop" className="text-xs font-semibold text-slate-600">
            Properti:
          </label>
          <select
            id="rep-prop"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg"
          >
            <option value="ALL">Seluruh Portofolio</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Executive Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print-break-inside-avoid">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500">Kas Masuk Sewa (Lunas)</span>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums mt-1.5">
            {formatIDR(totals.cashIn)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500">Piutang Sewa Tertunda</span>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums mt-1.5">
            {formatIDR(totals.receivables)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500">Beban Perawatan Unit</span>
          <div className="text-xl font-bold font-mono text-slate-800 tabular-nums mt-1.5">
            {formatIDR(totals.maintenanceExpense)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500">Pendapatan Bersih (NOI)</span>
          <div className="text-xl font-bold font-mono text-[#1D4ED8] tabular-nums mt-1.5">
            {formatIDR(totals.netOperatingIncome)}
          </div>
        </div>
      </div>

      {/* Per-Property Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden print-break-inside-avoid">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Ringkasan Kinerja per Properti · {selectedPeriodLabel}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Lokasi Properti</th>
                <th className="py-3 px-4 text-right">Hunian</th>
                <th className="py-3 px-4 text-right">Okupansi</th>
                <th className="py-3 px-4 text-right">Kas Masuk (IDR)</th>
                <th className="py-3 px-4 text-right">Piutang (IDR)</th>
                <th className="py-3 px-4 text-right">Biaya Perawatan</th>
                <th className="py-3 px-4 text-right">NOI Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reportRows.map((row) => (
                <tr key={row.property.id}>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{row.property.name}</div>
                    <div className="text-[11px] text-slate-500">{row.property.type} · {row.property.city}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {row.occupiedUnits}/{row.totalUnits}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {row.occupancyPct}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                    {formatIDR(row.cashIn)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-700">
                    {formatIDR(row.receivables)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {formatIDR(row.maintenanceExpense)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    {formatIDR(row.netOperatingIncome)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-xs">
                <td className="py-3.5 px-4 text-slate-900">TOTAL PORTOFOLIO</td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                  {totals.occupiedUnits}/{totals.totalUnits}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                  {totals.totalUnits ? Math.round((totals.occupiedUnits / totals.totalUnits) * 100) : 0}%
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700">
                  {formatIDR(totals.cashIn)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-700">
                  {formatIDR(totals.receivables)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                  {formatIDR(totals.maintenanceExpense)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#1D4ED8]">
                  {formatIDR(totals.netOperatingIncome)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Detailed Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Rincian Buku Kas Tagihan ({scopedInvoices.length} transaksi)
          </h2>
          <span className="text-xs text-slate-500">{selectedPeriodLabel}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-4">Invoice</th>
                <th className="py-2.5 px-4">Properti & Unit</th>
                <th className="py-2.5 px-4">Penyewa</th>
                <th className="py-2.5 px-4">Tgl Bayar / Jatuh Tempo</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Nominal (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {scopedInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-2.5 px-4 font-mono text-slate-800 whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap text-slate-700">
                    {getProperty(inv.propertyId)?.code} · {getRoom(inv.roomId)?.roomNumber}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap text-slate-900 font-medium">
                    {getTenant(inv.tenantId)?.fullName ?? '-'}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap tabular-nums text-slate-600">
                    {inv.paidAt ? `Lunas ${formatDateID(inv.paidAt)}` : `JT ${formatDateID(inv.dueDate)}`}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span
                      className={
                        inv.status === 'Lunas'
                          ? 'text-emerald-700 font-semibold'
                          : inv.status === 'Menunggu Verifikasi'
                            ? 'text-blue-700 font-semibold'
                            : 'text-rose-700 font-semibold'
                      }
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                    {formatIDR(inv.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
