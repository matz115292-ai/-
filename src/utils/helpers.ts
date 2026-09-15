import { Property, Client, PropertyType, PropertyPurpose, PropertyStatus, ClientRole, ClientStatus, MarketerTier } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA').format(amount) + ' ر.س';
}

export function formatArea(area: number): string {
  return `${new Intl.NumberFormat('ar-SA').format(area)} م²`;
}

export const MARKETER_TIERS: {
  value: MarketerTier;
  label: string;
  badge: string;
  color: string;
  bg: string;
  border: string;
  recommendedCommission: number;
  description: string;
}[] = [
  {
    value: 'junior',
    label: 'مسوق متدرب',
    badge: '🔰 متدرب',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    recommendedCommission: 2.0,
    description: 'في مرحلة التدريب والتأهيل تحت إشراف مدير الفريق'
  },
  {
    value: 'certified',
    label: 'مسوق معتمد',
    badge: '🎖️ معتمد',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    recommendedCommission: 2.5,
    description: 'وسيط عقاري مرخص ومستقل يدير الصفقات الاعتيادية'
  },
  {
    value: 'senior',
    label: 'مسوق أول متميز',
    badge: '⭐ مسوق أول',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    recommendedCommission: 3.0,
    description: 'حقق مستهدفات استثنائية ويدير الصفقات العقارية الكبرى'
  },
  {
    value: 'director',
    label: 'مدير تسويق وشريك',
    badge: '👑 مدير تسويق',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    recommendedCommission: 3.5,
    description: 'رئيس فريق وله صلاحيات الإشراف وإغلاق الصفقات الاستراتيجية'
  }
];

export function getMarketerTierInfo(tier?: MarketerTier) {
  return MARKETER_TIERS.find(t => t.value === tier) || MARKETER_TIERS[1]; // default certified
}

export const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'villa', label: 'فيلا', icon: 'Home' },
  { value: 'apartment', label: 'شقة', icon: 'Building2' },
  { value: 'land', label: 'أرض', icon: 'Trees' },
  { value: 'building', label: 'عمارة', icon: 'Building' },
  { value: 'office', label: 'مكتب', icon: 'Briefcase' },
  { value: 'commercial', label: 'تجاري / محل', icon: 'Store' },
];

export const PROPERTY_PURPOSES: { value: PropertyPurpose; label: string }[] = [
  { value: 'sale', label: 'للبيع' },
  { value: 'rent', label: 'للإيجار' },
];

export const PROPERTY_STATUSES: { value: PropertyStatus; label: string; color: string; bg: string }[] = [
  { value: 'available', label: 'متاح للطلب', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { value: 'reserved', label: 'محجوز حالياً', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { value: 'sold', label: 'تم البيع', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  { value: 'rented', label: 'تم التأجير', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
];

export const CLIENT_ROLES: { value: ClientRole; label: string; color: string }[] = [
  { value: 'buyer', label: 'مشتري', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'tenant', label: 'مستأجر', color: 'bg-blue-100 text-blue-800' },
  { value: 'investor', label: 'مستثمر', color: 'bg-purple-100 text-purple-800' },
  { value: 'seller', label: 'مالك / بائع', color: 'bg-amber-100 text-amber-800' },
];

export const CLIENT_STATUSES: { value: ClientStatus; label: string; color: string }[] = [
  { value: 'active', label: 'نشط وجاد', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'negotiating', label: 'مرحلة التفاوض', color: 'bg-amber-100 text-amber-800' },
  { value: 'closed', label: 'أتم الصفقة', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'inactive', label: 'متوقف / غير مهتم', color: 'bg-slate-100 text-slate-700' },
];

export const COMMON_FEATURES = [
  'مسبح خاص',
  'مصعد راكب',
  'حديقة خاصة',
  'تكييف مركزي',
  'موقف سيارة خاص',
  'غرفة خادمة',
  'غرفة سائق',
  'مؤثثة بالكامل',
  'مطبخ راكب',
  'دخول ذكي (Smart Lock)',
  'واجهة جنوبية',
  'واجهة شمالية',
  'شارع عريض 20م+',
  'إطلالة بانورامية',
  'حراسة وأمن',
  'نادي رياضي مشترك',
];

export const IMAGE_PRESETS = [
  { label: 'فيلا مودرن مع مسبح', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80' },
  { label: 'فيلا فاخرة كلاسيك', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80' },
  { label: 'شقة عصرية مفروشة', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80' },
  { label: 'شقة بنتهاوس أنيقة', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80' },
  { label: 'مكتب تجاري بأبراج', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80' },
  { label: 'محل ومعرض تجاري', url: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&w=1000&q=80' },
  { label: 'أرض فضاء سكنية', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80' },
  { label: 'عمارة سكنية استثمارية', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80' },
];

export interface MatchResult {
  score: number; // 0 to 100
  reasons: string[];
  isMatch: boolean;
}

/**
 * Calculates a match score between a client's requirements and a property
 */
export function calculateMatch(client: Client, property: Property): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Purpose check (Sale vs Rent)
  if (client.preferredPurpose === 'any' || client.preferredPurpose === property.purpose) {
    score += 30;
    reasons.push(property.purpose === 'sale' ? 'متوافق مع غرض الشراء' : 'متوافق مع غرض الإيجار');
  } else {
    return { score: 0, reasons: ['نوع العملية غير متطابق (بيع مقابل إيجار)'], isMatch: false };
  }

  // 2. Type check
  if (client.preferredTypes.length === 0 || client.preferredTypes.includes(property.type)) {
    score += 30;
    const typeLabel = PROPERTY_TYPES.find(t => t.value === property.type)?.label || property.type;
    reasons.push(`نوع العقار (${typeLabel}) مطلوب للعميل`);
  }

  // 3. Budget check (within range, with a 10% tolerance flexibility)
  const minBudget = client.budgetMin * 0.9;
  const maxBudget = client.budgetMax * 1.1;

  if (property.price >= client.budgetMin && property.price <= client.budgetMax) {
    score += 25;
    reasons.push('السعر يقع تماماً ضمن ميزانية العميل');
  } else if (property.price >= minBudget && property.price <= maxBudget) {
    score += 15;
    reasons.push('السعر مقارب لميزانية العميل (بفارق بسيط)');
  }

  // 4. City & Neighborhood check
  const cityMatch = client.preferredCities.length === 0 || 
    client.preferredCities.some(c => property.city.includes(c) || c.includes(property.city));
  
  if (cityMatch) {
    score += 10;
    reasons.push(`المدينة (${property.city}) متوافقة`);
  }

  if (client.preferredNeighborhoods && client.preferredNeighborhoods.length > 0) {
    const neighborhoodMatch = client.preferredNeighborhoods.some(n => 
      property.neighborhood.includes(n) || n.includes(property.neighborhood)
    );
    if (neighborhoodMatch) {
      score += 5;
      reasons.push(`الحي (${property.neighborhood}) مفضل لدى العميل`);
    }
  }

  return {
    score: Math.min(score, 100),
    reasons,
    isMatch: score >= 50,
  };
}
