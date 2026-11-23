import { Invoice, Property, Room, Tenant } from '../types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactIDR(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2).replace('.', ',')} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return formatIDR(amount);
}

export function formatDateID(isoDate?: string): string {
  if (!isoDate) return '-';
  const parsed = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function isInvoiceOverdue(invoice: Invoice, referenceDate = '2026-11-23'): boolean {
  if (invoice.status === 'Lunas') return false;
  return invoice.dueDate < referenceDate;
}

export function daysUntilDue(dueDate: string, referenceDate = '2026-11-23'): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime();
  const ref = new Date(`${referenceDate}T00:00:00`).getTime();
  return Math.round((due - ref) / (1000 * 60 * 60 * 24));
}

export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  return `62${digits}`;
}

export function buildWhatsAppReminderText(
  invoice: Invoice,
  tenant: Tenant | undefined,
  property: Property | undefined,
  room: Room | undefined
): string {
  const chargesLines =
    invoice.additionalCharges.length > 0
      ? invoice.additionalCharges
          .map((c) => `  • ${c.label}: ${formatIDR(c.amount)}`)
          .join('\n')
      : '  • Biaya Tambahan: Rp 0';

  const overdue = isInvoiceOverdue(invoice);
  const urgencyNote = overdue
    ? `Tagihan ini telah melewati tanggal jatuh tempo (${formatDateID(invoice.dueDate)}). Mohon segera melakukan pelunasan agar kenyamanan hunian tetap terjaga.`
    : `Mohon melakukan pembayaran sebelum tanggal jatuh tempo pada ${formatDateID(invoice.dueDate)}.`;

  return [
    `Halo Bapak/Ibu *${tenant?.fullName ?? 'Penyewa'}*,`,
    ``,
    `Berikut pengingat tagihan sewa unit dari *SOLProperty — Property Operations*:`,
    ``,
    `• No. Invoice: *${invoice.invoiceNumber}*`,
    `• Properti: *${property?.name ?? '-'}*`,
    `• Unit / Kamar: *${room?.roomNumber ?? '-'} (${room?.type ?? '-'})*`,
    `• Periode: *${invoice.period}*`,
    `• Sewa Pokok: ${formatIDR(invoice.rentAmount)}`,
    chargesLines,
    `• *Total Tagihan: ${formatIDR(invoice.totalAmount)}*`,
    `• Jatuh Tempo: *${formatDateID(invoice.dueDate)}*`,
    ``,
    urgencyNote,
    ``,
    `Pembayaran dapat ditransfer ke:`,
    `Bank BCA a.n. PT SOL Property Nusantara`,
    `No. Rek: *7120-8842-19*`,
    ``,
    `Setelah transfer, mohon unggah bukti bayar melalui Portal Penghuni SOLProperty (solproperty.solagency.id) atau balas pesan ini.`,
    ``,
    `Terima kasih atas kerja samanya.`,
    `*Tim Operasional SOLProperty*`,
  ].join('\n');
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (value: string | number) => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
