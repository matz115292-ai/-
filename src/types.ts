export type PropertyType = 'villa' | 'apartment' | 'land' | 'building' | 'office' | 'commercial';
export type PropertyPurpose = 'sale' | 'rent';
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented';

export interface Property {
  id: string;
  referenceCode: string;
  title: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  area: number; // in sq meters
  city: string;
  neighborhood: string;
  rooms?: number;
  bathrooms?: number;
  floor?: string;
  status: PropertyStatus;
  features: string[];
  ownerName: string;
  ownerPhone: string;
  marketerId?: string;
  marketerName?: string;
  imageUrl: string;
  images?: string[]; // قائمة الصور المرفقة للعقار (ملفات محملة)
  videoUrl?: string; // مقطع الفيديو المرفق (ملف محمل مباشرة)
  videoName?: string; // اسم ملف الفيديو
  googleMapsUrl?: string; // رابط موقع العقار على خرائط جوجل (اختياري)
  latitude?: number;
  longitude?: number;
  description: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  username: string; // اسم المستخدم للدخول
  name: string; // الاسم الكامل
  password: string; // الرقم السري الممنوح من المسؤول
  role: CurrentUserRole; // 'admin' | 'staff'
  phone?: string;
  email?: string;
  marketerId?: string; // إذا كان مرتبطاً بمسوق عقاري
  status: 'active' | 'suspended';
  createdAt: string;
}

export type MarketerStatus = 'active' | 'inactive';
export type MarketerTier = 'junior' | 'certified' | 'senior' | 'director';

export interface MarketerPromotion {
  id: string;
  fromTier?: MarketerTier;
  toTier: MarketerTier;
  date: string;
  reason?: string;
  promotedBy?: string;
  newCommissionRate?: number;
}

export interface Marketer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber?: string; // رقم رخصة فال للوساطة والتسويق العقاري
  commissionRate?: number; // نسبة السعي / العمولة %
  status: MarketerStatus;
  specialization?: string; // نطاق العمل والتخصص
  tier?: MarketerTier; // رتبة وترقية المسوق
  promotionHistory?: MarketerPromotion[];
  notes?: string;
  createdAt: string;
}

export type CurrentUserRole = 'admin' | 'staff'; // admin (مسؤول النظام - كامل الصلاحيات بما فيها الحذف والترقيات) | staff (مسوق / موظف وساطة)

export type ClientRole = 'buyer' | 'tenant' | 'seller' | 'investor';
export type ClientStatus = 'active' | 'negotiating' | 'closed' | 'inactive';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: ClientRole;
  budgetMin: number;
  budgetMax: number;
  preferredTypes: PropertyType[];
  preferredPurpose: 'sale' | 'rent' | 'any';
  preferredCities: string[];
  preferredNeighborhoods?: string[];
  status: ClientStatus;
  notes: string;
  createdAt: string;
  linkedPropertyIds?: string[];
}

export type AppointmentType = 'visit' | 'call' | 'meeting' | 'deal';
export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string;
  propertyId: string;
  type: AppointmentType;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
}

export type TabType = 'properties' | 'map' | 'clients' | 'matching' | 'appointments' | 'marketers' | 'users' | 'stats';
