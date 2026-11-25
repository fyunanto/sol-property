import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  User,
  UserCheck,
} from 'lucide-react';
import { BrandMark } from './BrandMark';
import { LOGIN_HERO_IMAGE } from '../data/seedData';
import { UserAccount } from '../types';

interface LoginPageProps {
  accounts: UserAccount[];
  onLoginSuccess: (account: UserAccount) => void;
}

type ShowcaseTabId =
  | 'all'
  | 'kos'
  | 'apartemen'
  | 'kontrakan'
  | 'villa'
  | 'hotel';

interface ShowcaseTabConfig {
  id: ShowcaseTabId;
  label: string;
  kicker: string;
  headlineStart: string;
  headlineAccent: string;
  description: string;
  imageUrl: string;
  imageCaptionTitle: string;
  imageCaptionSub: string;
  badgeNote: string;
  highlights: string[];
}

const SHOWCASE_TABS: ShowcaseTabConfig[] = [
  {
    id: 'all',
    label: 'Property Operations',
    kicker: 'Full-Service Property Operations',
    headlineStart: 'Kelola Properti Anda',
    headlineAccent: 'Lebih Mudah, Efisien & Profesional',
    description:
      'Platform operasional terpadu untuk mengelola kos eksklusif, apartemen, kontrakan & komersial, villa, hingga hotel—dari okupansi unit, kontrak penghuni, tagihan WhatsApp, hingga pelaporan keuangan.',
    imageUrl: LOGIN_HERO_IMAGE,
    imageCaptionTitle: 'Portofolio Multi-Properti Terintegrasi',
    imageCaptionSub: 'Kos Eksklusif · Apartemen · Kontrakan · Villa · Boutique Hotel',
    badgeNote: 'IDR Ledger Ready',
    highlights: [
      'Pantau tingkat hunian & kas masuk real-time lintas lokasi',
      'Pengingat tagihan otomatis 1-klik via WhatsApp (wa.me)',
      'Isolasi akses ketat antara Pemilik/Admin dan Penghuni',
    ],
  },
  {
    id: 'kos',
    label: 'Kos Eksklusif',
    kicker: 'Manajemen Kos Eksklusif & Coliving',
    headlineStart: 'Operasional Kos Eksklusif',
    headlineAccent: 'Otomatis Tanpa Ribet Catatan Manual',
    description:
      'Atur kamar Standard, Deluxe, hingga VIP, pantau pembayaran sewa bulanan, token listrik, laundry, parkir, serta terima laporan perbaikan kamar langsung dari Portal Mandiri Penghuni.',
    imageUrl: '/src/assets/images/sol_residence_depok_1795458552162.jpg',
    imageCaptionTitle: 'SOL Residence Depok & SOL Kost Margonda',
    imageCaptionSub: '12 Unit Kos Eksklusif · Okupansi & Penagihan Bulanan Otomatis',
    badgeNote: 'Mulai Rp 1,85 Jt/bln',
    highlights: [
      'Onboarding penghuni baru langsung ubah status kamar & terbitkan invoice',
      'Penghuni unggah bukti transfer & cek riwayat pembayaran sendiri',
      'Pengingat jatuh tempo WhatsApp lengkap dengan rincian utilitas',
    ],
  },
  {
    id: 'apartemen',
    label: 'Apartemen',
    kicker: 'Manajemen Unit Apartemen & Suite',
    headlineStart: 'Kelola Sewa Apartemen',
    headlineAccent: 'Transparan, Rapi & Terukur',
    description:
      'Kelola multi-unit studio dan 1-bedroom secara profesional—lengkap dengan pencatatan IPL gedung, deposit jaminan, kontrak tahunan/bulanan, serta jadwal perawatan unit berkala.',
    imageUrl: '/src/assets/images/sol_apartment_jakarta_1795458551684.jpg',
    imageCaptionTitle: 'SOL Apartment Suite Jakarta — TB Simatupang',
    imageCaptionSub: 'Studio & Executive Suite · Pengelolaan IPL, Parkir & Kontrak',
    badgeNote: 'Kontrak Bulanan & Tahunan',
    highlights: [
      'Pencatatan terpisah untuk sewa pokok, IPL, dan parkir basement',
      'Notifikasi kontrak akan berakhir & manajemen uang jaminan (deposit)',
      'Laporan Net Operating Income (NOI) siap cetak & ekspor CSV',
    ],
  },
  {
    id: 'kontrakan',
    label: 'Kontrakan & Komersial',
    kicker: 'Rumah Sewa, Ruko & Ruang Komersial',
    headlineStart: 'Kendali Penuh Kontrakan',
    headlineAccent: '& Aset Properti Komersial',
    description:
      'Catat perjanjian sewa rumah kontrakan, ruko, maupun ruang kantor secara terpusat. Pantau termin pembayaran, identitas penyewa (NIK/KTP), serta biaya pemeliharaan bangunan secara akurat.',
    imageUrl: '/src/assets/images/sol_kost_margonda_1795458554474.jpg',
    imageCaptionTitle: 'Pengelolaan Kontrakan & Unit Komersial',
    imageCaptionSub: 'Verifikasi KTP Penyewa · Jadwal Jatuh Tempo · Buku Kas Properti',
    badgeNote: 'Multi-Termin Sewa',
    highlights: [
      'Arsip digital NIK penyewa, kontak darurat, & status verifikasi',
      'Pelacakan biaya perbaikan bangunan & teknisi yang ditugaskan',
      'Rekap piutang & kas masuk per aset dalam satu dasbor eksekutif',
    ],
  },
  {
    id: 'villa',
    label: 'Villa',
    kicker: 'Operasional Villa & Private Resort',
    headlineStart: 'Kelola Villa & Resort',
    headlineAccent: 'Lebih Terjadwal & Menguntungkan',
    description:
      'Rancang pengelolaan villa liburan maupun long-stay secara efisien—mulai dari ketersediaan unit, penjadwalan housekeeping & perawatan kolam renang, hingga laporan bagi hasil pemilik properti.',
    imageUrl: LOGIN_HERO_IMAGE,
    imageCaptionTitle: 'SOL Villa Sanctuary Puncak — Cisarua, Bogor',
    imageCaptionSub: 'Private Pool Villa · Housekeeping Harian & Laporan Pemilik',
    badgeNote: 'Villa & Resort Ready',
    highlights: [
      'Status unit real-time: Terisi, Tersedia, atau Maintenance',
      'Tiket pemeliharaan khusus kolam renang, taman, & fasilitas villa',
      'Laporan pendapatan bersih (NOI) per unit siap kirim ke pemilik',
    ],
  },
  {
    id: 'hotel',
    label: 'Hotel',
    kicker: 'Operasional Boutique Hotel & Guest House',
    headlineStart: 'Manajemen Kamar Hotel',
    headlineAccent: 'Cepat, Akurat & Siap Layanan 24/7',
    description:
      'Optimalkan tingkat hunian boutique hotel dan guest house Anda dengan papan status kamar visual, alur check-in/checkout cepat, pelacakan housekeeping, dan rekap pendapatan harian maupun bulanan.',
    imageUrl: '/src/assets/images/sol_apartment_jakarta_1795458551684.jpg',
    imageCaptionTitle: 'SOL Boutique Hotel Sudirman — Jakarta Pusat',
    imageCaptionSub: 'Executive & Premier Suite · Papan Kamar & Housekeeping Terpadu',
    badgeNote: 'Hospitality Operations',
    highlights: [
      'Papan status kamar Grid & Tabel untuk pergantian tamu yang cepat',
      'Koordinasi tiket housekeeping & teknisi dengan prioritas penanganan',
      'Ekspor laporan keuangan & tingkat hunian instan dalam format CSV/Cetak',
    ],
  },
];

export function LoginPage({ accounts, onLoginSuccess }: LoginPageProps) {
  const [activeShowcase, setActiveShowcase] = useState<ShowcaseTabId>('all');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroError, setHeroError] = useState(false);

  const currentShowcase =
    SHOWCASE_TABS.find((t) => t.id === activeShowcase) ?? SHOWCASE_TABS[0];

  const handleTabSelect = (id: ShowcaseTabId) => {
    setActiveShowcase(id);
    setHeroError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim().toLowerCase();
    const matched = accounts.find(
      (acc) => acc.username.toLowerCase() === trimmedUser && acc.password === password
    );

    if (!matched) {
      setError('Username atau kata sandi tidak sesuai. Gunakan akun demo atau periksa kredensial Anda.');
      return;
    }

    if (!matched.active) {
      setError('Akun ini sedang dinonaktifkan oleh pengelola properti. Hubungi administrator.');
      return;
    }

    onLoginSuccess(matched);
  };

  const handleDemoFill = (role: 'admin' | 'tenant') => {
    setError(null);
    if (role === 'admin') {
      setUsername('admin01');
      setPassword('Admin123*');
    } else {
      setUsername('user01');
      setPassword('User123*');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      {/* Clean SOL Agency Style Interactive Top Navigation Header */}
      <header className="w-full bg-white border-b border-[#EFE7E2] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4 lg:gap-6">
          <button
            type="button"
            onClick={() => handleTabSelect('all')}
            className="flex items-center gap-3 shrink-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92B22] rounded-lg"
          >
            <BrandMark size={40} className="drop-shadow-[0_2px_6px_rgba(217,43,34,0.16)]" />
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#111827] leading-none">
                SOL<span className="text-[#D92B22]">Property</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                PT Solusi Optima Laju · solproperty.solagency.id
              </div>
            </div>
          </button>

          {/* Interactive Property Type Navigation Tabs (Desktop) */}
          <nav
            className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600"
            aria-label="Kategori Properti SOLProperty"
          >
            {SHOWCASE_TABS.map((tab) => {
              const isActive = activeShowcase === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabSelect(tab.id)}
                  className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#D92B22] font-semibold border-[#D92B22]'
                      : 'text-slate-600 hover:text-[#111827] border-transparent hover:border-[#EFE7E2]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <span>Akses Demo Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Interactive Tab Bar for Mobile / Tablet / Laptop < xl */}
        <div className="xl:hidden border-t border-[#F3EAE5] bg-[#FDF6F0]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 overflow-x-auto py-2">
            {SHOWCASE_TABS.map((tab) => {
              const isActive = activeShowcase === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabSelect(tab.id)}
                  className={`py-1 text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#D92B22] font-bold border-[#D92B22]'
                      : 'text-slate-600 hover:text-[#111827] border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Split Hero + Login Form matching SOL Agency Airy Warm Aesthetic */}
      <main className="flex-1 sol-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Editorial Hero Column (Updates Dynamically per Selected Tab) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-bold tracking-[0.08em] uppercase text-[#D92B22] mb-2">
                {currentShowcase.kicker}
              </p>
              <p className="text-sm font-semibold text-[#111827] mb-2">SOLProperty by SOL Agency</p>
              <h1
                className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111827] leading-[1.14]"
                style={{ textWrap: 'balance' }}
              >
                {currentShowcase.headlineStart}{' '}
                <span className="text-[#D92B22]">{currentShowcase.headlineAccent}</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                {currentShowcase.description}
              </p>
            </div>

            {/* Architectural Showcase Card with Subtle Warm Rim */}
            <div className="relative rounded-2xl overflow-hidden border border-[#EFE7E2] bg-white shadow-[0_14px_40px_rgba(17,24,39,0.06)] max-w-2xl">
              <div className="aspect-[16/8.2] relative bg-[#FDF6F0]">
                {!heroError ? (
                  <img
                    key={currentShowcase.id}
                    src={currentShowcase.imageUrl}
                    alt={currentShowcase.imageCaptionTitle}
                    referrerPolicy="no-referrer"
                    onError={() => setHeroError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full sol-gradient-banner flex items-center justify-center text-white">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-[#111827]/25 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2 text-white">
                  <div>
                    <div className="text-xs font-semibold text-[#FDE047]">
                      {currentShowcase.imageCaptionTitle}
                    </div>
                    <div className="text-sm font-bold">{currentShowcase.imageCaptionSub}</div>
                  </div>
                  <span className="text-xs font-mono text-white/95">{currentShowcase.badgeNote}</span>
                </div>
              </div>

              {/* Segment-Specific Operational Highlights */}
              <div className="px-5 py-4 bg-white border-t border-[#F3EAE5] grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentShowcase.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D92B22] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dual Role Capabilities (Clean Hairline Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 max-w-2xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF2F0] border border-[#FADAD4] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#D92B22]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">Portal Pemilik &amp; Manajer</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Analitik okupansi &amp; kas masuk, kelola Kos, Apartemen, Kontrakan, Villa, dan Hotel dalam satu dasbor.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF2F0] border border-[#FADAD4] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-[#EA580C]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">Portal Mandiri Penghuni</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Cek detail kamar &amp; kontrak aktif, tagihan bulanan pribadi, kirim bukti transfer, dan lapor perbaikan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Authentication Card Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white border border-[#EFE7E2] rounded-2xl p-6 sm:p-8 shadow-[0_18px_48px_rgba(17,24,39,0.07)]">
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D92B22]">
                  Akses Terotentikasi
                </span>
                <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-1">
                  Masuk ke SOLProperty
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan akun Pemilik/Admin atau Penghuni untuk membuka ruang kerja Anda.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FEF2F0] border border-[#F8C9C3] text-[#991B1B] text-xs leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 text-[#D92B22] shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="login-username" className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: admin01 atau user01"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-[#111827] bg-white border border-[#E5DDD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D92B22]/20 focus:border-[#D92B22] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-sm text-[#111827] bg-white border border-[#E5DDD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D92B22]/20 focus:border-[#D92B22] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#111827] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92B22]"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 bg-[#D92B22] hover:bg-[#B91C1C] text-white text-sm font-semibold rounded-full transition-colors cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92B22] focus-visible:ring-offset-2"
                >
                  <span>Masuk ke Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-4 border-t border-[#F3EAE5]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
                    <KeyRound className="w-3.5 h-3.5 text-[#D92B22]" />
                    <span>Isi Otomatis Akun Demo</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleDemoFill('tenant')}
                      className="flex flex-col items-start px-3.5 py-2.5 rounded-xl border border-[#E8D8D2] hover:border-[#D92B22] hover:bg-[#FEF2F0]/70 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92B22]"
                    >
                      <span className="text-xs font-bold text-[#111827]">
                        Demo Fill Tenant (user01)
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                        user01 · User123*
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoFill('admin')}
                      className="flex flex-col items-start px-3.5 py-2.5 rounded-xl border border-[#D92B22]/35 bg-[#FEF2F0]/40 hover:border-[#D92B22] hover:bg-[#FEF2F0] text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92B22]"
                    >
                      <span className="text-xs font-bold text-[#D92B22]">
                        Demo Fill Owner/Admin (admin01)
                      </span>
                      <span className="text-[11px] text-slate-600 font-mono mt-0.5">
                        admin01 · Admin123*
                      </span>
                    </button>
                  </div>
                </div>
              </form>

              <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">
                Isolasi hak akses aktif: akun Penghuni (<span className="font-mono">user01</span>) hanya dapat
                melihat kamar, tagihan, dan laporan perbaikan miliknya sendiri.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Signature SOL Agency Warm Blush Metrics Strip */}
      <section className="bg-[#FDF6F0] border-y border-[#F3E6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#D92B22] tabular-nums">5</span>
            <span className="text-xs text-slate-600 leading-snug">
              Lokasi Aktif: Kos, Apartemen, Villa &amp; Hotel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#D92B22] tabular-nums">22</span>
            <span className="text-xs text-slate-600 leading-snug">Unit Kamar &amp; Suite Terpantau Real-Time</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#D92B22] tabular-nums">1-Klik</span>
            <span className="text-xs text-slate-600 leading-snug">Pengingat Tagihan Otomatis via WhatsApp</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#D92B22] tabular-nums">100%</span>
            <span className="text-xs text-slate-600 leading-snug">Pemisahan Akses Pemilik &amp; Penghuni</span>
          </div>
        </div>
      </section>

      {/* Quiet SOL Footer */}
      <footer className="bg-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 SOLProperty · PT Solusi Optima Laju (SOL Agency)</span>
          <span className="font-mono">Jakarta, Depok &amp; Puncak · solproperty.solagency.id</span>
        </div>
      </footer>
    </div>
  );
}
