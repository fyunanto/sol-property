export type UserRole = 'admin' | 'tenant';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  phone: string;
  tenantId?: string;
  active: boolean;
  lastLogin: string;
}

export type PropertyType =
  | 'Kos Eksklusif'
  | 'Apartemen'
  | 'Kontrakan'
  | 'Komersial'
  | 'Villa'
  | 'Hotel';

export interface Property {
  id: string;
  name: string;
  code: string;
  type: PropertyType;
  address: string;
  city: string;
  managerName: string;
  managerPhone: string;
  facilities: string[];
  imageUrl: string;
  description: string;
}

export type RoomType = 'Standard' | 'Deluxe' | 'VIP / Studio';
export type RoomStatus = 'Terisi' | 'Tersedia' | 'Maintenance';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  monthlyRate: number;
  yearlyRate: number;
  areaSqm: number;
  status: RoomStatus;
  tenantId?: string;
  notes?: string;
}

export type IdVerificationStatus = 'Terverifikasi' | 'Menunggu';
export type ContractStatus = 'Aktif' | 'Akan Berakhir' | 'Checkout';

export interface Tenant {
  id: string;
  fullName: string;
  nik: string;
  idVerified: IdVerificationStatus;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  occupation: string;
  propertyId: string;
  roomId: string;
  checkInDate: string;
  leaseEndDate: string;
  depositAmount: number;
  contractStatus: ContractStatus;
}

export type InvoiceStatus = 'Lunas' | 'Menunggu Verifikasi' | 'Belum Bayar';

export interface AdditionalCharge {
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  period: string; // e.g., "November 2026"
  periodKey: string; // e.g., "2026-11"
  rentAmount: number;
  additionalCharges: AdditionalCharge[];
  totalAmount: number;
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  receiptFileName?: string;
  receiptNote?: string;
}

export type TicketPriority = 'Rendah' | 'Sedang' | 'Tinggi';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export interface MaintenanceTicket {
  id: string;
  ticketCode: string;
  propertyId: string;
  roomId: string;
  tenantId?: string;
  reportedBy: string;
  title: string;
  category: 'AC & Pendingin' | 'Air & Sanitasi' | 'Listrik & Lampu' | 'Internet & Wi-Fi' | 'Furnitur & Kunci' | 'Lainnya';
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTechnician: string;
  cost: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface MonthlyRevenuePoint {
  periodKey: string;
  label: string;
  revenue: number;
  target: number;
  occupancyRate: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'billing' | 'tenant' | 'maintenance' | 'property';
}

export type AdminTab =
  | 'dashboard'
  | 'properties'
  | 'rooms'
  | 'tenants'
  | 'billing'
  | 'maintenance'
  | 'reports'
  | 'accounts';

export type TenantTab = 'overview' | 'billing' | 'maintenance' | 'contract';
