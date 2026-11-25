import React, { useState } from 'react';
import { Building2, Edit3, MapPin, Phone, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Property, PropertyType, Room } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { Modal } from '../ui/Modal';

interface PropertiesModuleProps {
  properties: Property[];
  rooms: Room[];
  onAddProperty: (property: Omit<Property, 'id'>) => void;
  onUpdateProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => void;
  onSelectPropertyRooms: (propertyId: string) => void;
}

const DEFAULT_FACILITIES = [
  'Wi-Fi High Speed',
  'AC',
  'Parkir Motor & Mobil',
  'CCTV 24 Jam',
  'Dapur Bersama',
  'Laundry',
  'Security 24/7',
];

export function PropertiesModule({
  properties,
  rooms,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onSelectPropertyRooms,
}: PropertiesModuleProps) {
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProperties =
    typeFilter === 'ALL' ? properties : properties.filter((p) => p.type === typeFilter);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<PropertyType>('Kos Eksklusif');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [managerName, setManagerName] = useState('Hendra Wijaya');
  const [managerPhone, setManagerPhone] = useState('0811-9482-7100');
  const [facilitiesText, setFacilitiesText] = useState('Wi-Fi 150 Mbps, AC, Parkir, CCTV 24 Jam');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingProperty(null);
    setName('');
    setCode('');
    setType('Kos Eksklusif');
    setAddress('');
    setCity('Depok, Jawa Barat');
    setManagerName('Hendra Wijaya');
    setManagerPhone('0811-9482-7100');
    setFacilitiesText('Wi-Fi 150 Mbps, AC, Parkir, CCTV 24 Jam');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setName(prop.name);
    setCode(prop.code);
    setType(prop.type);
    setAddress(prop.address);
    setCity(prop.city);
    setManagerName(prop.managerName);
    setManagerPhone(prop.managerPhone);
    setFacilitiesText(prop.facilities.join(', '));
    setDescription(prop.description);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFacilities = facilitiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingProperty) {
      onUpdateProperty({
        ...editingProperty,
        name: name.trim(),
        code: code.trim().toUpperCase() || editingProperty.code,
        type,
        address: address.trim(),
        city: city.trim(),
        managerName: managerName.trim(),
        managerPhone: managerPhone.trim(),
        facilities: parsedFacilities.length > 0 ? parsedFacilities : DEFAULT_FACILITIES.slice(0, 4),
        description: description.trim(),
      });
    } else {
      onAddProperty({
        name: name.trim(),
        code: code.trim().toUpperCase() || 'SOL',
        type,
        address: address.trim(),
        city: city.trim(),
        managerName: managerName.trim(),
        managerPhone: managerPhone.trim(),
        facilities: parsedFacilities.length > 0 ? parsedFacilities : DEFAULT_FACILITIES.slice(0, 4),
        imageUrl: '/src/assets/images/sol_residence_depok_1795458552162.jpg',
        description: description.trim() || 'Properti hunian sewa terkelola SOLProperty.',
      });
    }
    setModalOpen(false);
  };

  const propertyToDelete = properties.find((p) => p.id === confirmDeleteId);
  const roomsInDeleteTarget = rooms.filter((r) => r.propertyId === confirmDeleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D92B22]">
            Portofolio Lokasi
          </span>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-0.5">
            Manajemen <span className="text-[#D92B22]">Properti</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola portofolio lokasi kos eksklusif, apartemen, kontrakan, komersial, villa, hingga hotel
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Properti</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white border border-[#EFE7E2] rounded-2xl p-3 flex flex-wrap items-center gap-1.5">
        {(['ALL', 'Kos Eksklusif', 'Apartemen', 'Kontrakan', 'Komersial', 'Villa', 'Hotel'] as const).map(
          (cat) => {
            const active = typeFilter === cat;
            const count =
              cat === 'ALL' ? properties.length : properties.filter((p) => p.type === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setTypeFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#D92B22] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#111827] hover:bg-[#FDF6F0]'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}{' '}
                <span className={`font-mono ml-1 ${active ? 'text-white/85' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Property Portfolio Cards */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white border border-[#EFE7E2] rounded-2xl p-12 text-center">
          <Building2 className="w-9 h-9 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#111827]">
            Belum ada properti pada kategori {typeFilter}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Klik &ldquo;Tambah Properti&rdquo; untuk mendaftarkan lokasi {typeFilter} baru.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredProperties.map((prop) => {
          const propRooms = rooms.filter((r) => r.propertyId === prop.id);
          const occupied = propRooms.filter((r) => r.status === 'Terisi').length;
          const vacant = propRooms.filter((r) => r.status === 'Tersedia').length;
          const maintenance = propRooms.filter((r) => r.status === 'Maintenance').length;
          const occupancyPct = propRooms.length > 0 ? Math.round((occupied / propRooms.length) * 100) : 0;
          const monthlyPotential = propRooms
            .filter((r) => r.status === 'Terisi')
            .reduce((sum, r) => sum + r.monthlyRate, 0);

          return (
            <article
              key={prop.id}
              className="bg-white border border-[#EFE7E2] rounded-2xl overflow-hidden flex flex-col shadow-[0_6px_24px_rgba(17,24,39,0.03)]"
            >
              {/* Architectural Thumbnail */}
              <div className="relative aspect-[4/3] bg-[#FDF6F0] overflow-hidden">
                {!brokenImages[prop.id] ? (
                  <img
                    src={prop.imageUrl}
                    alt={prop.name}
                    referrerPolicy="no-referrer"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [prop.id]: true }))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full sol-gradient-banner flex flex-col items-center justify-center text-white p-6 text-center">
                    <Building2 className="w-10 h-10 mb-2 opacity-90" />
                    <span className="text-sm font-semibold">{prop.name}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                  <span className="text-xs font-medium text-white/95">
                    {prop.type} · Kode {prop.code}
                  </span>
                  <span className="text-xs font-mono font-semibold tabular-nums">
                    {occupancyPct}% Terisi
                  </span>
                </div>
              </div>

              {/* Property Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{prop.name}</h2>
                  <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {prop.address}, {prop.city}
                    </span>
                  </p>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{prop.description}</p>

                  {/* Facilities (Zero-pill clean inline text with separators) */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Fasilitas Utama</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {prop.facilities.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Occupancy & Revenue Line */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {propRooms.length} unit ({occupied} terisi · {vacant} kosong
                      {maintenance > 0 ? ` · ${maintenance} perbaikan` : ''})
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#F5EAE4] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#EA580C] to-[#D92B22] rounded-full"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Estimasi Sewa Aktif / Bln</span>
                    <span className="font-mono font-bold text-[#111827] tabular-nums">
                      {formatIDR(monthlyPotential)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Pengelola: {prop.managerName}</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3" />
                      {prop.managerPhone}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPropertyRooms(prop.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D92B22] hover:text-[#B91C1C] cursor-pointer"
                    >
                      <span>Lihat Daftar Kamar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(prop)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Ubah ${prop.name}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(prop.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Hapus ${prop.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      )}

      {/* Add / Edit Property Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProperty ? 'Ubah Data Properti' : 'Tambah Lokasi Properti Baru'}
        subtitle="Lengkapi informasi bangunan, jenis properti, penanggung jawab, dan fasilitas."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Properti</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: SOL Residence Kemang"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Properti</label>
              <input
                type="text"
                required
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SRK"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Properti</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B22]/20 focus:border-[#D92B22]"
              >
                <option value="Kos Eksklusif">Kos Eksklusif</option>
                <option value="Apartemen">Apartemen</option>
                <option value="Kontrakan">Kontrakan</option>
                <option value="Komersial">Komersial</option>
                <option value="Villa">Villa</option>
                <option value="Hotel">Hotel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kota / Wilayah</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Depok, Jawa Barat"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Raya Nusantara No. 12"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pengelola</label>
              <input
                type="text"
                required
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Pengelola</label>
              <input
                type="text"
                required
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fasilitas (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={facilitiesText}
              onChange={(e) => setFacilitiesText(e.target.value)}
              placeholder="Wi-Fi, AC, Parkir, CCTV 24 Jam"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkasan keunggulan lokasi dan tipe hunian..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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
              {editingProperty ? 'Simpan Perubahan' : 'Tambah Properti'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        title="Konfirmasi Hapus Properti"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong className="text-slate-900">{propertyToDelete?.name}</strong>?
            {roomsInDeleteTarget.length > 0 && (
              <span className="block mt-2 text-rose-700 font-medium">
                Perhatian: Properti ini masih memiliki {roomsInDeleteTarget.length} unit kamar terdaftar.
                Hapus atau pindahkan unit terlebih dahulu jika tidak ingin menghilangkan data kamar.
              </span>
            )}
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirmDeleteId) {
                  onDeleteProperty(confirmDeleteId);
                  setConfirmDeleteId(null);
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
            >
              Hapus Properti
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
