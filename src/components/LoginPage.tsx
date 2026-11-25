import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
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

export function LoginPage({ accounts, onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroError, setHeroError] = useState(false);

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
      {/* Clean SOL Agency Style Top Navigation Header */}
      <header className="w-full bg-white border-b border-[#EFE7E2]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <BrandMark size={40} className="drop-shadow-[0_2px_6px_rgba(217,43,34,0.16)]" />
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#111827] leading-none">
                SOL<span className="text-[#D92B22]">Property</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                PT Solusi Optima Laju · solproperty.solagency.id
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-slate-600">
            <span className="text-[#D92B22] font-semibold border-b-2 border-[#D92B22] py-1">
              Property Operations
            </span>
            <span>Kos Eksklusif</span>
            <span>Apartemen</span>
            <span>Kontrakan & Komersial</span>
          </div>

          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#D92B22] hover:bg-[#B91C1C] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <span>Akses Demo Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Split Hero + Login Form matching SOL Agency Airy Warm Aesthetic */}
      <main className="flex-1 sol-hero-glow">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-bold tracking-[0.08em] uppercase text-[#D92B22] mb-2">
                Full-Service Property Operations
              </p>
              <p className="text-sm font-semibold text-[#111827] mb-2">SOLProperty by SOL Agency</p>
              <h1
                className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111827] leading-[1.14]"
                style={{ textWrap: 'balance' }}
              >
                Kelola Properti Anda{' '}
                <span className="text-[#D92B22]">Lebih Mudah, Efisien &amp; Profesional</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Platform operasional terpadu untuk mengelola kos eksklusif, apartemen, dan properti sewa—dari
                okupansi kamar, kontrak penyewa, pengingat tagihan WhatsApp, hingga pelaporan keuangan.
              </p>
            </div>

            {/* Architectural Showcase Card with Subtle Warm Rim */}
            <div className="relative rounded-2xl overflow-hidden border border-[#EFE7E2] bg-white shadow-[0_14px_40px_rgba(17,24,39,0.06)] max-w-2xl">
              <div className="aspect-[16/8.5] relative bg-[#FDF6F0]">
                {!heroError ? (
                  <img
                    src={LOGIN_HERO_IMAGE}
                    alt="Kompleks hunian modern SOLProperty"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full sol-gradient-banner flex items-center justify-center text-white">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/75 via-[#111827]/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2 text-white">
                  <div>
                    <div className="text-xs font-semibold text-[#FDE047]">Portofolio Terkelola</div>
                    <div className="text-sm font-bold">
                      SOL Residence Depok · SOL Kost Margonda · SOL Apartment Jakarta
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/90">IDR Ledger Ready</span>
                </div>
              </div>
            </div>

            {/* Dual Role Capabilities (Clean Hairline Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 max-w-2xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF2F0] border border-[#FADAD4] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#D92B22]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">Portal Pemilik &amp; Manajer</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Analitik okupansi &amp; kas masuk, manajemen properti/kamar, verifikasi bayar, dan laporan CSV/cetak.
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
          <div className="lg:col-span-5">
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
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#D92B22] tabular-nums">3</span>
            <span className="text-xs text-slate-600 leading-snug">Lokasi Properti Aktif di Jakarta &amp; Depok</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#D92B22] tabular-nums">18</span>
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
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 SOLProperty · PT Solusi Optima Laju (SOL Agency)</span>
          <span className="font-mono">Jakarta &amp; Depok, Indonesia · solproperty.solagency.id</span>
        </div>
      </footer>
    </div>
  );
}
