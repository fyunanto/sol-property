import React, { useMemo, useState } from 'react';
import {
  Building2,
  DoorOpen,
  FileBarChart2,
  FileText,
  Home,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { AppHeader } from './components/AppHeader';
import { useDynamicFavicon } from './components/BrandMark';
import { LoginPage } from './components/LoginPage';
import { TenantPortal } from './components/TenantPortal';
import { AccountsModule } from './components/admin/AccountsModule';
import { BillingModule, CreateInvoicePayload } from './components/admin/BillingModule';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { MaintenanceModule } from './components/admin/MaintenanceModule';
import { PropertiesModule } from './components/admin/PropertiesModule';
import { ReportsModule } from './components/admin/ReportsModule';
import { RoomsModule } from './components/admin/RoomsModule';
import { OnboardTenantPayload, TenantsModule } from './components/admin/TenantsModule';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import {
  HISTORICAL_REVENUE,
  INITIAL_ACCOUNTS,
  INITIAL_ACTIVITIES,
  INITIAL_INVOICES,
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_TICKETS,
} from './data/seedData';
import {
  ActivityLog,
  AdminTab,
  Invoice,
  MaintenanceTicket,
  Property,
  Room,
  RoomStatus,
  Tenant,
  TenantTab,
  TicketPriority,
  UserAccount,
} from './types';

const ADMIN_NAV_ITEMS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Ringkasan Properti', icon: LayoutDashboard },
  { id: 'properties', label: 'Manajemen Properti', icon: Building2 },
  { id: 'rooms', label: 'Pengelolaan Kamar', icon: DoorOpen },
  { id: 'tenants', label: 'Data Penyewa', icon: Users },
  { id: 'billing', label: 'Pembayaran & Tagihan', icon: Receipt },
  { id: 'maintenance', label: 'Pemeliharaan Kamar', icon: Wrench },
  { id: 'reports', label: 'Laporan Lengkap', icon: FileBarChart2 },
  { id: 'accounts', label: 'Manajemen Akun', icon: ShieldCheck },
];

const TENANT_NAV_ITEMS: { id: TenantTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Ringkasan Hunian', icon: Home },
  { id: 'billing', label: 'Tagihan & Pembayaran', icon: Receipt },
  { id: 'maintenance', label: 'Komplain & Perbaikan', icon: Wrench },
  { id: 'contract', label: 'Kontrak & Profil', icon: FileText },
];

export default function App() {
  // Dynamically inject crisp SVG favicon into document.head
  useDynamicFavicon();

  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);

  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [tenantTab, setTenantTab] = useState<TenantTab>('overview');
  const [roomsInitialPropFilter, setRoomsInitialPropFilter] = useState<string>('ALL');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [externalWaInvoice, setExternalWaInvoice] = useState<Invoice | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (actor: string, action: string, category: ActivityLog['category']) => {
    const nowLabel = '23 Nov · Baru saja';
    setActivities((prev) => [
      { id: `act-${Date.now()}`, timestamp: nowLabel, actor, action, category },
      ...prev,
    ]);
  };

  // Authentication handlers
  const handleLoginSuccess = (account: UserAccount) => {
    const updatedAccount: UserAccount = { ...account, lastLogin: '2026-11-23 · Aktif' };
    setAccounts((prev) => prev.map((a) => (a.id === account.id ? updatedAccount : a)));
    setCurrentUser(updatedAccount);
    setAdminTab('dashboard');
    setTenantTab('overview');
    setMobileNavOpen(false);
    pushToast(`Selamat datang, ${account.fullName} (${account.roleLabel}).`, 'info');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMobileNavOpen(false);
    setExternalWaInvoice(null);
    pushToast('Anda telah keluar dari sesi SOLProperty.', 'info');
  };

  // --- ADMIN OPERATIONS HANDLERS ---
  const handleAddProperty = (payload: Omit<Property, 'id'>) => {
    const newProp: Property = { ...payload, id: `prop-${Date.now()}` };
    setProperties((prev) => [...prev, newProp]);
    logActivity(currentUser?.fullName ?? 'Admin', `Menambahkan lokasi properti baru: ${newProp.name}`, 'property');
    pushToast(`Properti "${newProp.name}" berhasil ditambahkan.`);
  };

  const handleUpdateProperty = (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    logActivity(currentUser?.fullName ?? 'Admin', `Memperbarui profil properti ${updated.name}`, 'property');
    pushToast(`Perubahan pada "${updated.name}" disimpan.`);
  };

  const handleDeleteProperty = (propertyId: string) => {
    const target = properties.find((p) => p.id === propertyId);
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setRooms((prev) => prev.filter((r) => r.propertyId !== propertyId));
    logActivity(currentUser?.fullName ?? 'Admin', `Menghapus properti ${target?.name ?? propertyId}`, 'property');
    pushToast(`Properti "${target?.name ?? ''}" telah dihapus.`, 'info');
  };

  const handleAddRoom = (payload: Omit<Room, 'id'>) => {
    const newRoom: Room = { ...payload, id: `r-${Date.now()}` };
    setRooms((prev) => [...prev, newRoom]);
    logActivity(currentUser?.fullName ?? 'Admin', `Menambahkan unit kamar ${newRoom.roomNumber} (${newRoom.type})`, 'property');
    pushToast(`Kamar ${newRoom.roomNumber} berhasil ditambahkan.`);
  };

  const handleUpdateRoom = (updated: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    pushToast(`Data kamar ${updated.roomNumber} diperbarui.`);
  };

  const handleToggleRoomStatus = (roomId: string, newStatus: RoomStatus) => {
    const target = rooms.find((r) => r.id === roomId);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: newStatus, tenantId: newStatus === 'Terisi' ? r.tenantId : undefined }
          : r
      )
    );
    if (target) {
      logActivity(
        currentUser?.fullName ?? 'Admin',
        `Mengubah status Kamar ${target.roomNumber} menjadi ${newStatus}`,
        'property'
      );
      pushToast(`Status Kamar ${target.roomNumber} diubah menjadi ${newStatus}.`);
    }
  };

  const handleOnboardTenant = (payload: OnboardTenantPayload) => {
    const newTenantId = `t-${Date.now()}`;
    const chosenRoom = rooms.find((r) => r.id === payload.roomId);
    const chosenProp = properties.find((p) => p.id === payload.propertyId);

    const newTenant: Tenant = {
      id: newTenantId,
      fullName: payload.fullName,
      nik: payload.nik,
      idVerified: 'Terverifikasi',
      phone: payload.phone,
      email: payload.email,
      emergencyContactName: payload.emergencyContactName,
      emergencyContactPhone: payload.emergencyContactPhone,
      occupation: payload.occupation,
      propertyId: payload.propertyId,
      roomId: payload.roomId,
      checkInDate: payload.checkInDate,
      leaseEndDate: payload.leaseEndDate,
      depositAmount: payload.depositAmount,
      contractStatus: 'Aktif',
    };

    setTenants((prev) => [newTenant, ...prev]);
    setRooms((prev) =>
      prev.map((r) => (r.id === payload.roomId ? { ...r, status: 'Terisi', tenantId: newTenantId } : r))
    );

    if (payload.generateFirstInvoice && chosenRoom) {
      const seq = String(invoices.length + 1).padStart(3, '0');
      const firstInv: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV/SOL/2026/11/${seq}`,
        tenantId: newTenantId,
        propertyId: payload.propertyId,
        roomId: payload.roomId,
        period: 'November 2026',
        periodKey: '2026-11',
        rentAmount: chosenRoom.monthlyRate,
        additionalCharges: [{ label: 'Biaya Administrasi Awal', amount: 100000 }],
        totalAmount: chosenRoom.monthlyRate + 100000,
        dueDate: payload.checkInDate,
        status: 'Belum Bayar',
      };
      setInvoices((prev) => [firstInv, ...prev]);
    }

    logActivity(
      currentUser?.fullName ?? 'Admin',
      `Onboarding penyewa ${newTenant.fullName} ke ${chosenProp?.code ?? ''} Kamar ${chosenRoom?.roomNumber ?? ''}`,
      'tenant'
    );
    pushToast(
      `${newTenant.fullName} ditempatkan di Kamar ${chosenRoom?.roomNumber ?? ''}${
        payload.generateFirstInvoice ? ' & tagihan pertama diterbitkan.' : '.'
      }`
    );
  };

  const handleVerifyTenantId = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, idVerified: 'Terverifikasi' } : t)));
    if (target) {
      pushToast(`Identitas KTP ${target.fullName} telah terverifikasi.`);
    }
  };

  const handleCheckoutTenant = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, contractStatus: 'Checkout' } : t)));
    setRooms((prev) =>
      prev.map((r) => (r.id === target.roomId ? { ...r, status: 'Tersedia', tenantId: undefined } : r))
    );
    const roomNo = rooms.find((r) => r.id === target.roomId)?.roomNumber ?? '';
    logActivity(
      currentUser?.fullName ?? 'Admin',
      `Menyelesaikan checkout ${target.fullName} — Kamar ${roomNo} kembali Tersedia`,
      'tenant'
    );
    pushToast(`Checkout ${target.fullName} selesai. Kamar ${roomNo} kini berstatus Tersedia.`, 'info');
  };

  const handleCreateInvoice = (payload: CreateInvoicePayload) => {
    const tenant = tenants.find((t) => t.id === payload.tenantId);
    if (!tenant) return;
    const charges = [];
    if (payload.electricityFee > 0) charges.push({ label: 'Listrik & Air', amount: payload.electricityFee });
    if (payload.parkingFee > 0) charges.push({ label: 'Parkir / IPL', amount: payload.parkingFee });
    if (payload.otherFeeLabel && payload.otherFeeAmount > 0) {
      charges.push({ label: payload.otherFeeLabel, amount: payload.otherFeeAmount });
    }
    const total = payload.rentAmount + charges.reduce((s, c) => s + c.amount, 0);
    const seq = String(invoices.length + 1).padStart(3, '0');
    const yearMonthSlash = payload.periodKey.replace('-', '/');

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/SOL/${yearMonthSlash}/${seq}`,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      roomId: tenant.roomId,
      period: payload.period,
      periodKey: payload.periodKey,
      rentAmount: payload.rentAmount,
      additionalCharges: charges,
      totalAmount: total,
      dueDate: payload.dueDate,
      status: 'Belum Bayar',
    };

    setInvoices((prev) => [newInv, ...prev]);
    logActivity(
      currentUser?.fullName ?? 'Admin',
      `Menerbitkan tagihan ${newInv.invoiceNumber} untuk ${tenant.fullName}`,
      'billing'
    );
    pushToast(`Tagihan ${newInv.invoiceNumber} berhasil diterbitkan.`);
  };

  const handleVerifyPayment = (invoiceId: string, method?: string, reference?: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;
    const tenantName = tenants.find((t) => t.id === target.tenantId)?.fullName ?? 'Penyewa';

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'Lunas',
              paidAt: '2026-11-23',
              paymentMethod: method || inv.paymentMethod || 'Transfer BCA',
              paymentReference: reference || inv.paymentReference || `VER-${inv.invoiceNumber.slice(-3)}`,
            }
          : inv
      )
    );
    logActivity(
      currentUser?.fullName ?? 'Admin',
      `Memverifikasi pelunasan ${target.invoiceNumber} (${tenantName})`,
      'billing'
    );
    pushToast(`Tagihan ${target.invoiceNumber} (${tenantName}) telah diverifikasi Lunas.`);
  };

  const handleRejectPayment = (invoiceId: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'Belum Bayar',
              receiptFileName: undefined,
              receiptNote: undefined,
              paymentReference: undefined,
            }
          : inv
      )
    );
    if (target) {
      pushToast(`Bukti pembayaran ${target.invoiceNumber} dikembalikan ke status Belum Bayar.`, 'info');
    }
  };

  const handleCreateTicket = (payload: Omit<MaintenanceTicket, 'id' | 'ticketCode' | 'createdAt'>) => {
    const codeNum = String(42 + tickets.length).padStart(3, '0');
    const newTicket: MaintenanceTicket = {
      ...payload,
      id: `mt-${Date.now()}`,
      ticketCode: `MNT-2026-${codeNum}`,
      createdAt: '2026-11-23',
    };
    setTickets((prev) => [newTicket, ...prev]);
    const roomNo = rooms.find((r) => r.id === payload.roomId)?.roomNumber ?? '';
    logActivity(
      payload.reportedBy,
      `Membuat tiket perbaikan ${newTicket.ticketCode} (${roomNo}): ${newTicket.title}`,
      'maintenance'
    );
    pushToast(`Tiket perbaikan ${newTicket.ticketCode} berhasil dicatat.`);
  };

  const handleUpdateTicket = (updated: MaintenanceTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    logActivity(
      currentUser?.fullName ?? 'Admin',
      `Memperbarui tiket ${updated.ticketCode} menjadi ${updated.status}`,
      'maintenance'
    );
    pushToast(`Tiket ${updated.ticketCode} diperbarui (${updated.status}).`);
  };

  const handleToggleAccountActive = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, active: !a.active } : a))
    );
    pushToast('Status aktivasi akun telah diperbarui.');
  };

  const handleCreateAccount = (payload: Omit<UserAccount, 'id' | 'lastLogin'>) => {
    if (accounts.some((a) => a.username.toLowerCase() === payload.username.toLowerCase())) {
      pushToast(`Username "${payload.username}" sudah terdaftar.`, 'error');
      return;
    }
    const created: UserAccount = {
      ...payload,
      id: `acc-${Date.now()}`,
      lastLogin: 'Belum pernah login',
    };
    setAccounts((prev) => [...prev, created]);
    pushToast(`Akun "${created.username}" (${created.fullName}) berhasil dibuat.`);
  };

  // --- TENANT PORTAL HANDLERS (STRICTLY SCOPED TO LOGGED-IN TENANT) ---
  const loggedInTenant = useMemo(() => {
    if (!currentUser || currentUser.role !== 'tenant' || !currentUser.tenantId) return null;
    return tenants.find((t) => t.id === currentUser.tenantId) ?? null;
  }, [currentUser, tenants]);

  const loggedInTenantRoom = useMemo(
    () => (loggedInTenant ? rooms.find((r) => r.id === loggedInTenant.roomId) ?? null : null),
    [loggedInTenant, rooms]
  );

  const loggedInTenantProperty = useMemo(
    () => (loggedInTenant ? properties.find((p) => p.id === loggedInTenant.propertyId) ?? null : null),
    [loggedInTenant, properties]
  );

  const handleTenantSubmitPayment = (
    invoiceId: string,
    payload: {
      paymentMethod: string;
      paymentReference: string;
      receiptFileName: string;
      receiptNote: string;
    }
  ) => {
    if (!loggedInTenant) return;
    // Security guard: ensure tenant can ONLY update their own invoice
    const target = invoices.find((i) => i.id === invoiceId && i.tenantId === loggedInTenant.id);
    if (!target) return;

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === target.id
          ? {
              ...inv,
              status: 'Menunggu Verifikasi',
              paymentMethod: payload.paymentMethod,
              paymentReference: payload.paymentReference,
              receiptFileName: payload.receiptFileName,
              receiptNote: payload.receiptNote,
            }
          : inv
      )
    );
    logActivity(
      loggedInTenant.fullName,
      `Mengirim konfirmasi transfer ${payload.paymentMethod} untuk ${target.invoiceNumber}`,
      'billing'
    );
    pushToast('Bukti transfer terkirim! Menunggu verifikasi pengelola properti.');
  };

  const handleTenantSubmitComplaint = (payload: {
    title: string;
    category: MaintenanceTicket['category'];
    description: string;
    priority: TicketPriority;
  }) => {
    if (!loggedInTenant) return;
    handleCreateTicket({
      propertyId: loggedInTenant.propertyId,
      roomId: loggedInTenant.roomId,
      tenantId: loggedInTenant.id,
      reportedBy: loggedInTenant.fullName,
      title: payload.title,
      category: payload.category,
      description: payload.description,
      priority: payload.priority,
      status: 'Open',
      assignedTechnician: 'Menunggu Penugasan Pengelola',
      cost: 0,
    });
  };

  const handleTenantUpdateEmergency = (name: string, phone: string) => {
    if (!loggedInTenant) return;
    setTenants((prev) =>
      prev.map((t) =>
        t.id === loggedInTenant.id
          ? { ...t, emergencyContactName: name, emergencyContactPhone: phone }
          : t
      )
    );
    pushToast('Kontak darurat Anda telah diperbarui.');
  };

  // --- LOGIN GATEWAY ---
  if (!currentUser) {
    return (
      <>
        <LoginPage accounts={accounts} onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const pendingVerifyCount = invoices.filter((i) => i.status === 'Menunggu Verifikasi').length;
  const openMaintenanceCount = tickets.filter((t) => t.status !== 'Resolved').length;

  const myTenantInvoices = loggedInTenant
    ? invoices.filter((inv) => inv.tenantId === loggedInTenant.id)
    : [];
  const myTenantTickets = loggedInTenant
    ? tickets.filter((tk) => tk.tenantId === loggedInTenant.id || tk.roomId === loggedInTenant.roomId)
    : [];
  const myUnpaidCount = myTenantInvoices.filter((inv) => inv.status === 'Belum Bayar').length;

  const handleQuickReportTrigger = () => {
    if (isAdmin) {
      if (adminTab === 'reports') {
        window.print();
      } else {
        setAdminTab('reports');
        pushToast('Membuka Laporan Lengkap — klik Cetak Laporan atau Unduh CSV.', 'info');
      }
    } else {
      if (tenantTab === 'contract') {
        window.print();
      } else {
        setTenantTab('contract');
        pushToast('Membuka Ringkasan Kontrak untuk dicetak.', 'info');
      }
    }
  };

  const renderSidebarNav = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-200">
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-blue-400 tracking-wide block">
            {isAdmin ? 'Admin Control Center' : 'Portal Mandiri Penghuni'}
          </span>
          <span className="text-sm font-bold text-white mt-0.5 block">
            {isAdmin ? 'Operasional Properti' : `Kamar ${loggedInTenantRoom?.roomNumber ?? '-'}`}
          </span>
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu utama">
        {isAdmin
          ? ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = adminTab === item.id;
              const count =
                item.id === 'billing'
                  ? pendingVerifyCount
                  : item.id === 'maintenance'
                    ? openMaintenanceCount
                    : 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAdminTab(item.id);
                    if (item.id === 'rooms') setRoomsInitialPropFilter('ALL');
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {count > 0 && (
                    <span
                      className={`font-mono text-[11px] tabular-nums shrink-0 ${
                        active ? 'text-blue-100' : 'text-amber-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })
          : TENANT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = tenantTab === item.id;
              const count = item.id === 'billing' ? myUnpaidCount : 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTenantTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {count > 0 && (
                    <span
                      className={`font-mono text-[11px] tabular-nums shrink-0 ${
                        active ? 'text-blue-100' : 'text-amber-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
      </nav>

      {/* Sidebar Bottom Account Info */}
      <div className="px-5 py-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
        <div className="text-slate-200 font-semibold truncate">{currentUser.fullName}</div>
        <div className="font-mono truncate">{currentUser.username} · {isAdmin ? 'Admin' : 'Penghuni'}</div>
        <div className="pt-1 text-slate-500">solproperty.solagency.id</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <AppHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onQuickReport={handleQuickReportTrigger}
        onToggleMobileNav={() => setMobileNavOpen(true)}
      />

      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 no-print">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">{renderSidebarNav(false)}</div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden flex bg-slate-950/60 no-print"
            onClick={() => setMobileNavOpen(false)}
          >
            <div className="w-64 max-w-[82vw] h-full" onClick={(e) => e.stopPropagation()}>
              {renderSidebarNav(true)}
            </div>
          </div>
        )}

        {/* Main Operational Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {isAdmin ? (
            <>
              {adminTab === 'dashboard' && (
                <DashboardOverview
                  properties={properties}
                  rooms={rooms}
                  tenants={tenants}
                  invoices={invoices}
                  tickets={tickets}
                  historicalRevenue={HISTORICAL_REVENUE}
                  activities={activities}
                  onNavigate={(tab) => setAdminTab(tab)}
                  onOpenWhatsAppReminder={(inv) => {
                    setExternalWaInvoice(inv);
                    setAdminTab('billing');
                  }}
                  onVerifyInvoice={(invoiceId) => handleVerifyPayment(invoiceId)}
                />
              )}

              {adminTab === 'properties' && (
                <PropertiesModule
                  properties={properties}
                  rooms={rooms}
                  onAddProperty={handleAddProperty}
                  onUpdateProperty={handleUpdateProperty}
                  onDeleteProperty={handleDeleteProperty}
                  onSelectPropertyRooms={(propId) => {
                    setRoomsInitialPropFilter(propId);
                    setAdminTab('rooms');
                  }}
                />
              )}

              {adminTab === 'rooms' && (
                <RoomsModule
                  key={roomsInitialPropFilter}
                  properties={properties}
                  rooms={rooms}
                  tenants={tenants}
                  initialPropertyFilter={roomsInitialPropFilter}
                  onAddRoom={handleAddRoom}
                  onUpdateRoom={handleUpdateRoom}
                  onToggleRoomStatus={handleToggleRoomStatus}
                />
              )}

              {adminTab === 'tenants' && (
                <TenantsModule
                  properties={properties}
                  rooms={rooms}
                  tenants={tenants}
                  onOnboardTenant={handleOnboardTenant}
                  onVerifyTenantId={handleVerifyTenantId}
                  onCheckoutTenant={handleCheckoutTenant}
                />
              )}

              {adminTab === 'billing' && (
                <BillingModule
                  properties={properties}
                  rooms={rooms}
                  tenants={tenants}
                  invoices={invoices}
                  onCreateInvoice={handleCreateInvoice}
                  onVerifyPayment={handleVerifyPayment}
                  onRejectPayment={handleRejectPayment}
                  externalWhatsAppInvoice={externalWaInvoice}
                  onClearExternalWhatsApp={() => setExternalWaInvoice(null)}
                />
              )}

              {adminTab === 'maintenance' && (
                <MaintenanceModule
                  properties={properties}
                  rooms={rooms}
                  tickets={tickets}
                  onCreateTicket={handleCreateTicket}
                  onUpdateTicket={handleUpdateTicket}
                />
              )}

              {adminTab === 'reports' && (
                <ReportsModule
                  properties={properties}
                  rooms={rooms}
                  tenants={tenants}
                  invoices={invoices}
                  tickets={tickets}
                  onExportToast={(msg) => pushToast(msg)}
                />
              )}

              {adminTab === 'accounts' && (
                <AccountsModule
                  accounts={accounts}
                  tenants={tenants}
                  rooms={rooms}
                  currentUserId={currentUser.id}
                  onToggleAccountActive={handleToggleAccountActive}
                  onCreateAccount={handleCreateAccount}
                />
              )}
            </>
          ) : loggedInTenant && loggedInTenantProperty && loggedInTenantRoom ? (
            <TenantPortal
              activeTab={tenantTab}
              onTabChange={setTenantTab}
              tenant={loggedInTenant}
              property={loggedInTenantProperty}
              room={loggedInTenantRoom}
              myInvoices={myTenantInvoices}
              myTickets={myTenantTickets}
              onSubmitPaymentConfirmation={handleTenantSubmitPayment}
              onSubmitComplaint={handleTenantSubmitComplaint}
              onUpdateEmergencyContact={handleTenantUpdateEmergency}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <h2 className="text-base font-semibold text-slate-900">Data Hunian Belum Terhubung</h2>
              <p className="text-xs text-slate-500 mt-1">
                Akun Anda belum tertaut ke unit kamar aktif. Silakan hubungi pengelola properti.
              </p>
            </div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
