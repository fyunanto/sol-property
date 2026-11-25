import React, { useMemo, useState } from 'react';
import { Plus, Search, Wrench } from 'lucide-react';
import {
  MaintenanceTicket,
  Property,
  Room,
  TicketPriority,
  TicketStatus,
} from '../../types';
import { formatDateID, formatIDR } from '../../utils/formatters';
import { Modal } from '../ui/Modal';

interface MaintenanceModuleProps {
  properties: Property[];
  rooms: Room[];
  tickets: MaintenanceTicket[];
  onCreateTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'ticketCode' | 'createdAt'>) => void;
  onUpdateTicket: (ticket: MaintenanceTicket) => void;
}

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  Tinggi: 'text-rose-700 font-semibold',
  Sedang: 'text-amber-700 font-semibold',
  Rendah: 'text-slate-600 font-medium',
};

const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  Open: 'bg-rose-50 text-rose-800 border-rose-200',
  'In Progress': 'bg-amber-50 text-amber-800 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export function MaintenanceModule({
  properties,
  rooms,
  tickets,
  onCreateTicket,
  onUpdateTicket,
}: MaintenanceModuleProps) {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);

  // Create form state
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceTicket['category']>('AC & Pendingin');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Sedang');
  const [assignedTechnician, setAssignedTechnician] = useState('Pak Dedi (Teknisi HVAC)');
  const [cost, setCost] = useState(0);

  // Edit ticket state
  const [editStatus, setEditStatus] = useState<TicketStatus>('Open');
  const [editTech, setEditTech] = useState('');
  const [editCost, setEditCost] = useState(0);

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  const getRoom = (id: string) => rooms.find((r) => r.id === id);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (propertyFilter !== 'ALL' && t.propertyId !== propertyFilter) return false;
      if (q) {
        const roomNo = getRoom(t.roomId)?.roomNumber.toLowerCase() ?? '';
        const match =
          t.ticketCode.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.reportedBy.toLowerCase().includes(q) ||
          t.assignedTechnician.toLowerCase().includes(q) ||
          roomNo.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, propertyFilter, searchQuery, rooms]);

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const totalCost = tickets.reduce((sum, t) => sum + t.cost, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const room = getRoom(selectedRoomId);
    if (!room) return;
    onCreateTicket({
      propertyId: room.propertyId,
      roomId: room.id,
      tenantId: room.tenantId,
      reportedBy: 'Hendra Wijaya (Pengelola)',
      title: title.trim(),
      category,
      description: description.trim(),
      priority,
      status: 'Open',
      assignedTechnician: assignedTechnician.trim() || 'Belum Ditugaskan',
      cost: Number(cost),
    });
    setCreateOpen(false);
    setTitle('');
    setDescription('');
    setCost(0);
  };

  const openManageModal = (ticket: MaintenanceTicket) => {
    setEditingTicket(ticket);
    setEditStatus(ticket.status);
    setEditTech(ticket.assignedTechnician);
    setEditCost(ticket.cost);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    onUpdateTicket({
      ...editingTicket,
      status: editStatus,
      assignedTechnician: editTech.trim() || 'Belum Ditugaskan',
      cost: Number(editCost),
      resolvedAt: editStatus === 'Resolved' ? editingTicket.resolvedAt ?? '2026-11-23' : undefined,
    });
    setEditingTicket(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D92B22]">
            Pemeliharaan &amp; Teknisi
          </span>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            Pemeliharaan &amp; <span className="text-[#D92B22]">Komplain Kamar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {openCount} tiket terbuka · {inProgressCount} sedang dikerjakan · Total biaya perawatan{' '}
            <span className="font-mono font-semibold text-[#111827]">{formatIDR(totalCost)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Tiket Perbaikan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#FDF6F0] rounded-full border border-[#F3E6DD]">
            {(['ALL', 'Open', 'In Progress', 'Resolved'] as const).map((st) => (
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
                {st === 'ALL' ? 'Semua Status' : st}
              </button>
            ))}
          </div>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            aria-label="Filter properti perbaikan"
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
            placeholder="Cari kode tiket, keluhan, teknisi..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">Tidak ada tiket pemeliharaan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Semua keluhan perbaikan telah selesai atau belum ada laporan yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFE7E2] bg-[#FDF6F0]/70 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">Tiket & Keluhan</th>
                  <th className="py-3 px-4">Unit & Pelapor</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Teknisi Ditugaskan</th>
                  <th className="py-3 px-4 text-right">Biaya (IDR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTickets.map((ticket) => {
                  const prop = getProperty(ticket.propertyId);
                  const room = getRoom(ticket.roomId);

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono font-semibold text-slate-700">{ticket.ticketCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{ticket.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{formatDateID(ticket.createdAt)}</span>
                        </div>
                        <div className="font-semibold text-slate-900 mt-0.5">{ticket.title}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ticket.description}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">
                          {room?.roomNumber} · <span className="font-sans font-normal text-slate-600">{prop?.code}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{ticket.reportedBy}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={PRIORITY_STYLES[ticket.priority]}>{ticket.priority}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {ticket.assignedTechnician}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatIDR(ticket.cost)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${TICKET_STATUS_STYLES[ticket.status]}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openManageModal(ticket)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
                        >
                          Tindak Lanjut
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Catat Tiket Pemeliharaan Baru"
        subtitle="Jadwalkan perbaikan fasilitas kamar dan catat estimasi biaya perawatan."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Kamar</label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {rooms.map((r) => {
                  const p = getProperty(r.propertyId);
                  return (
                    <option key={r.id} value={r.id}>
                      {p?.name} — {r.roomNumber} ({r.status})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Kerusakan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceTicket['category'])}
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Masalah</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC tidak dingin & perlu cuci berkala"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Detail</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan lokasi kerusakan atau kebutuhan suku cadang..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teknisi</label>
              <input
                type="text"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Biaya (IDR)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3EAE5] flex items-center justify-end gap-2.5">
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
              Simpan Tiket
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Ticket Modal */}
      <Modal
        open={Boolean(editingTicket)}
        onClose={() => setEditingTicket(null)}
        title={`Tindak Lanjut ${editingTicket?.ticketCode ?? ''}`}
        subtitle={editingTicket?.title}
        maxWidthClass="max-w-lg"
      >
        {editingTicket && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed">
              {editingTicket.description}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Penanganan</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Open">Open (Menunggu)</option>
                <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                <option value="Resolved">Resolved (Selesai)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teknisi Ditugaskan</label>
                <input
                  type="text"
                  value={editTech}
                  onChange={(e) => setEditTech(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Biaya Aktual (IDR)</label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={editCost}
                  onChange={(e) => setEditCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F3EAE5] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E5DDD8] hover:bg-slate-50 rounded-full cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full cursor-pointer"
              >
                Simpan Pembaruan
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
