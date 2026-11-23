import React, { useState } from 'react';
import {
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  User,
  UserCheck,
  AlertCircle,
  ArrowRight,
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC]">
      {/* Left Architectural Brand Column */}
      <div className="relative lg:col-span-7 bg-[#0F172A] text-white flex flex-col justify-between overflow-hidden min-h-[320px] lg:min-h-screen">
        {!heroError ? (
          <img
            src={LOGIN_HERO_IMAGE}
            alt="Kompleks hunian modern SOLProperty"
            referrerPolicy="no-referrer"
            onError={() => setHeroError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1D4ED8]/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/75 to-[#0F172A]/45" />

        {/* Brand Header */}
        <div className="relative z-10 px-8 pt-8 lg:px-12 lg:pt-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <BrandMark size={42} className="shrink-0 shadow-md" />
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-bold tracking-tight text-white">SOLProperty</span>
                <span className="text-xs font-medium text-blue-300 tracking-wide">
                  Property Operations
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">solproperty.solagency.id</p>
            </div>
          </div>
        </div>

        {/* Core Value Statement */}
        <div className="relative z-10 px-8 py-10 lg:px-12 lg:py-14 max-w-2xl">
          <p className="text-xs font-medium text-blue-300 mb-3">
            Sistem Operasional Kos Eksklusif · Apartemen · Properti Sewa
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Kelola Properti Anda Lebih Mudah, Efisien dan Profesional
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Satukan pemantauan okupansi kamar, kontrak penghuni, penagihan sewa otomatis via WhatsApp, serta
            tiket pemeliharaan unit dalam satu pusat kendali operasional.
          </p>

          {/* Role Architecture Overview (Clean Hairline Grid, No Nested Boxes) */}
          <div className="mt-10 pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Portal Pemilik & Manajer</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Analitik pendapatan & okupansi real-time, kelola multi-properti, onboarding penyewa, verifikasi
                pembayaran, dan ekspor laporan keuangan.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Portal Mandiri Penghuni</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Pantau detail kamar & kontrak aktif, cek rincian tagihan bulanan, unggah bukti transfer sewa,
                dan ajukan laporan perbaikan kamar.
              </p>
            </div>
          </div>
        </div>

        {/* Quiet Footer */}
        <div className="relative z-10 px-8 pb-7 lg:px-12 flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 SOLProperty · PT SOL Property Nusantara</span>
          <span className="hidden sm:inline">Jakarta & Depok Operations</span>
        </div>
      </div>

      {/* Right Authentication Form Column */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 mb-2">
              <Building2 className="w-4 h-4" />
              <span>Akses Terotentikasi Berbasis Peran</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke SOLProperty</h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Masukkan kredensial akun Pemilik/Admin atau Penghuni untuk membuka ruang kerja Anda.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5"
          >
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                  className="w-full pl-10 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-3">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Isi Otomatis Akun Demo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoFill('tenant')}
                  className="flex flex-col items-start px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span className="text-xs font-semibold text-slate-900">
                    Demo Fill Tenant (user01)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                    user01 · User123*
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('admin')}
                  className="flex flex-col items-start px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span className="text-xs font-semibold text-slate-900">
                    Demo Fill Owner/Admin (admin01)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                    admin01 · Admin123*
                  </span>
                </button>
              </div>
            </div>
          </form>

          <p className="mt-5 text-xs text-slate-500 leading-relaxed">
            Hak akses dipisahkan secara ketat: akun Penghuni (<span className="font-mono">user01</span>) hanya
            dapat mengakses data kamar, tagihan, dan komplain miliknya sendiri.
          </p>
        </div>
      </div>
    </div>
  );
}
