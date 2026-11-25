import React, { useMemo, useState } from 'react';
import {
  DoorOpen,
  Edit3,
  LayoutGrid,
  List,
  Plus,
  Search,
  User,
  Wrench,
} from 'lucide-react';
import { Property, Room, RoomStatus, RoomType, Tenant } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { Modal } from '../ui/Modal';

interface RoomsModuleProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  initialPropertyFilter?: string;
  onAddRoom: (room: Omit<Room, 'id'>) => void;
  onUpdateRoom: (room: Room) => void;
  onToggleRoomStatus: (roomId: string, newStatus: RoomStatus) => void;
}

const STATUS_STYLES: Record<RoomStatus, { text: string; bg: string }> = {
  Terisi: { text: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  Tersedia: { text: 'text-[#D92B22]', bg: 'bg-[#FEF2F0] border-[#F8C9C3]' },
  Maintenance: { text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
};

export function RoomsModule({
  properties,
  rooms,
  tenants,
  initialPropertyFilter = 'ALL',
  onAddRoom,
  onUpdateRoom,
  onToggleRoomStatus,
}: RoomsModuleProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [propertyFilter, setPropertyFilter] = useState<string>(initialPropertyFilter);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<RoomType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Room form state
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomType, setRoomType] = useState<RoomType>('Deluxe');
  const [monthlyRate, setMonthlyRate] = useState(2400000);
  const [yearlyRate, setYearlyRate] = useState(26500000);
  const [areaSqm, setAreaSqm] = useState(20);
  const [status, setStatus] = useState<RoomStatus>('Tersedia');
  const [notes, setNotes] = useState('');

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  const getTenant = (id?: string) => (id ? tenants.find((t) => t.id === id) : undefined);

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter((r) => {
      if (propertyFilter !== 'ALL' && r.propertyId !== propertyFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
      if (q) {
        const propName = getProperty(r.propertyId)?.name.toLowerCase() ?? '';
        const tenantName = getTenant(r.tenantId)?.fullName.toLowerCase() ?? '';
        const match =
          r.roomNumber.toLowerCase().includes(q) ||
          propName.includes(q) ||
          tenantName.includes(q) ||
          r.type.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [rooms, propertyFilter, statusFilter, typeFilter, searchQuery, properties, tenants]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setPropertyId(propertyFilter !== 'ALL' ? propertyFilter : properties[0]?.id ?? '');
    setRoomNumber('');
    setFloor(1);
    setRoomType('Deluxe');
    setMonthlyRate(2400000);
    setYearlyRate(26400000);
    setAreaSqm(20);
    setStatus('Tersedia');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setPropertyId(room.propertyId);
    setRoomNumber(room.roomNumber);
    setFloor(room.floor);
    setRoomType(room.type);
    setMonthlyRate(room.monthlyRate);
    setYearlyRate(room.yearlyRate);
    setAreaSqm(room.areaSqm);
    setStatus(room.status);
    setNotes(room.notes ?? '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      onUpdateRoom({
        ...editingRoom,
        propertyId,
        roomNumber: roomNumber.trim().toUpperCase(),
        floor: Number(floor),
        type: roomType,
        monthlyRate: Number(monthlyRate),
        yearlyRate: Number(yearlyRate),
        areaSqm: Number(areaSqm),
        status,
        tenantId: status === 'Terisi' ? editingRoom.tenantId : undefined,
        notes: notes.trim(),
      });
    } else {
      onAddRoom({
        propertyId,
        roomNumber: roomNumber.trim().toUpperCase(),
        floor: Number(floor),
        type: roomType,
        monthlyRate: Number(monthlyRate),
        yearlyRate: Number(yearlyRate),
        areaSqm: Number(areaSqm),
        status,
        notes: notes.trim(),
      });
    }
    setModalOpen(false);
  };

  const counts = {
    all: rooms.length,
    Terisi: rooms.filter((r) => r.status === 'Terisi').length,
    Tersedia: rooms.filter((r) => r.status === 'Tersedia').length,
    Maintenance: rooms.filter((r) => r.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D92B22]">
            Inventaris Unit Sewa
          </span>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            Pengelolaan <span className="text-[#D92B22]">Kamar &amp; Unit</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {counts.all} total unit · {counts.Terisi} terisi · {counts.Tersedia} tersedia · {counts.Maintenance}{' '}
            dalam perbaikan
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-[#FDF6F0] rounded-full border border-[#EFE7E2]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#D92B22] shadow-sm' : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#D92B22] shadow-sm' : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kamar</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segmented Tabs */}
          <div className="flex items-center p-1 bg-[#FDF6F0] rounded-full border border-[#F3E6DD]">
            {(['ALL', 'Terisi', 'Tersedia', 'Maintenance'] as const).map((st) => (
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
            aria-label="Filter properti"
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">Semua Properti</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RoomType | 'ALL')}
            aria-label="Filter tipe kamar"
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="VIP / Studio">VIP / Studio</option>
          </select>
        </div>

        <div className="relative lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. kamar, penyewa..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <DoorOpen className="w-9 h-9 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">Tidak ada unit yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1">
            Ubah filter pencarian atau tambahkan unit kamar baru untuk properti ini.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Board View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const prop = getProperty(room.propertyId);
            const tenant = getTenant(room.tenantId);
            const stStyle = STATUS_STYLES[room.status];

            return (
              <div
                key={room.id}
                className="bg-white border border-[#EFE7E2] rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-base font-bold text-slate-900 font-mono">
                          {room.roomNumber}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Lt. {room.floor} · {room.areaSqm} m²
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {prop?.name} · {room.type}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${stStyle.bg} ${stStyle.text}`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Tarif Bulanan</span>
                      <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                        {formatIDR(room.monthlyRate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Tarif Tahunan</span>
                      <span className="text-xs font-semibold font-mono text-slate-700 tabular-nums">
                        {formatIDR(room.yearlyRate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    {tenant ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{tenant.fullName}</span>
                      </div>
                    ) : room.status === 'Maintenance' ? (
                      <div className="flex items-center gap-2 text-amber-700">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{room.notes || 'Sedang dalam pemeliharaan'}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unit kosong — siap untuk onboarding penyewa</span>
                    )}
                  </div>
                </div>

                {/* Quick Status Switch & Edit */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <select
                    aria-label={`Ubah status kamar ${room.roomNumber}`}
                    value={room.status}
                    onChange={(e) => onToggleRoomStatus(room.id, e.target.value as RoomStatus)}
                    className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  >
                    <option value="Terisi">Status: Terisi</option>
                    <option value="Tersedia">Status: Tersedia</option>
                    <option value="Maintenance">Status: Maintenance</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => openEditModal(room)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="bg-white border border-[#EFE7E2] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFE7E2] bg-[#FDF6F0]/70 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">No. Unit</th>
                  <th className="py-3 px-4">Properti</th>
                  <th className="py-3 px-4">Tipe & Luas</th>
                  <th className="py-3 px-4 text-right">Tarif / Bulan</th>
                  <th className="py-3 px-4 text-right">Tarif / Tahun</th>
                  <th className="py-3 px-4">Penghuni Aktif</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRooms.map((room) => {
                  const prop = getProperty(room.propertyId);
                  const tenant = getTenant(room.tenantId);
                  const stStyle = STATUS_STYLES[room.status];

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {room.roomNumber}
                        <span className="text-slate-400 font-sans font-normal ml-1.5">Lt.{room.floor}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{prop?.name}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {room.type} · {room.areaSqm} m²
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatIDR(room.monthlyRate)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums whitespace-nowrap">
                        {formatIDR(room.yearlyRate)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {tenant ? tenant.fullName : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${stStyle.bg} ${stStyle.text}`}
                        >
                          {room.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <select
                            aria-label={`Ubah status ${room.roomNumber}`}
                            value={room.status}
                            onChange={(e) => onToggleRoomStatus(room.id, e.target.value as RoomStatus)}
                            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700"
                          >
                            <option value="Terisi">Terisi</option>
                            <option value="Tersedia">Tersedia</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => openEditModal(room)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            aria-label={`Edit kamar ${room.roomNumber}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
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
      )}

      {/* Create / Edit Room Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? `Ubah Unit ${editingRoom.roomNumber}` : 'Tambah Unit Kamar Baru'}
        subtitle="Atur properti, tipe unit, tarif sewa bulanan/tahunan, dan status ketersediaan."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Properti</label>
              <select
                required
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Kamar / Unit</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Contoh: A-301"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lantai</label>
              <input
                type="number"
                min={1}
                required
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Luas (m²)</label>
              <input
                type="number"
                min={8}
                required
                value={areaSqm}
                onChange={(e) => setAreaSqm(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Unit</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="VIP / Studio">VIP / Studio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Bulanan (IDR)</label>
              <input
                type="number"
                min={500000}
                step={50000}
                required
                value={monthlyRate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMonthlyRate(val);
                  if (!editingRoom) setYearlyRate(Math.round(val * 11));
                }}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Tahunan (IDR)</label>
              <input
                type="number"
                min={5000000}
                step={100000}
                required
                value={yearlyRate}
                onChange={(e) => setYearlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Awal</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="Tersedia">Tersedia</option>
              <option value="Terisi">Terisi</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Unit</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Balkon pribadi, water heater, meja kerja"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-[#F3EAE5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E5DDD8] hover:bg-slate-50 rounded-full cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full cursor-pointer"
            >
              {editingRoom ? 'Simpan Unit' : 'Tambah Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
