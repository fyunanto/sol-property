import { LogOut, Menu, Printer, Shield, UserCheck } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { UserAccount } from '../types';

interface AppHeaderProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onQuickReport: () => void;
  onToggleMobileNav: () => void;
}

export function AppHeader({
  currentUser,
  onLogout,
  onQuickReport,
  onToggleMobileNav,
}: AppHeaderProps) {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Drawer Trigger + Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <BrandMark size={36} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 truncate">
                <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  SOLProperty
                </span>
                <span className="hidden sm:inline text-[11px] font-semibold text-[#1D4ED8] tracking-wide whitespace-nowrap">
                  PROPERTY OPERATIONS
                </span>
                <span className="hidden md:inline text-slate-300" aria-hidden="true">·</span>
                <span className="hidden md:inline text-[11px] font-mono text-slate-500 truncate">
                  https://solproperty.solagency.id
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Kelola Properti Anda Lebih Mudah, Efisien dan Profesional
              </p>
            </div>
          </div>
        </div>

        {/* Right: Active Role Indicator, Quick Report/Print, Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 pr-3 border-r border-slate-200 text-right">
            <div>
              <div className="text-xs font-semibold text-slate-900 leading-tight whitespace-nowrap">
                {currentUser.fullName}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight whitespace-nowrap flex items-center justify-end gap-1 mt-0.5">
                {isAdmin ? (
                  <Shield className="w-3 h-3 text-[#2563EB]" />
                ) : (
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                )}
                <span>{currentUser.roleLabel}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onQuickReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{isAdmin ? 'Laporan / Cetak' : 'Cetak Kontrak'}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
