import React, { useState } from 'react';
import { Property, Client, PropertyType, ClientRole } from '../types';
import { 
  PROPERTY_TYPES, 
  COMMON_FEATURES, 
  formatCurrency, 
  formatArea,
  calculateMatch 
} from '../utils/helpers';
import { 
  DEFAULT_CITY, 
  SAUDI_CITIES, 
  JEDDAH_NEIGHBORHOODS, 
  CITY_NEIGHBORHOODS 
} from '../data/locations';
import { 
  X, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  MessageSquare,
  ArrowRight,
  Send,
  Eye,
  ExternalLink
} from 'lucide-react';
import { SmartWhatsAppClientParser } from './SmartWhatsAppClientParser';
import { ParsedClientData } from '../utils/whatsappParser';

interface ClientRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (clientData: Omit<Client, 'id' | 'createdAt'>) => Client;
  properties: Property[];
  onViewProperty?: (property: Property) => void;
}

export const ClientRequestModal: React.FC<ClientRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
  properties,
  onViewProperty,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+9665');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ClientRole>('buyer');
  const [preferredPurpose, setPreferredPurpose] = useState<'sale' | 'rent'>('sale');
  const [preferredTypes, setPreferredTypes] = useState<PropertyType[]>(['villa']);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [neighborhoods, setNeighborhoods] = useState('');
  const [budgetMin, setBudgetMin] = useState<number | ''>('');
  const [budgetMax, setBudgetMax] = useState<number | ''>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Submission result state
  const [submittedClient, setSubmittedClient] = useState<Client | null>(null);
  const [matchedList, setMatchedList] = useState<{ property: Property; score: number }[]>([]);

  if (!isOpen) return null;

  const togglePropertyType = (typeVal: PropertyType) => {
    if (preferredTypes.includes(typeVal)) {
      if (preferredTypes.length > 1) {
        setPreferredTypes(preferredTypes.filter(t => t !== typeVal));
      }
    } else {
      setPreferredTypes([...preferredTypes, typeVal]);
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleSmartParsed = (data: ParsedClientData) => {
    if (data.name) setName(data.name);
    if (data.phone) setPhone(data.phone);
    if (data.email) setEmail(data.email);
    if (data.role) setRole(data.role);
    if (data.preferredPurpose && data.preferredPurpose !== 'any') {
      setPreferredPurpose(data.preferredPurpose);
    }
    if (data.preferredTypes && data.preferredTypes.length > 0) {
      setPreferredTypes(data.preferredTypes);
    }
    if (data.preferredCities && data.preferredCities.length > 0) {
      setCity(data.preferredCities[0]);
    }
    if (data.preferredNeighborhoods && data.preferredNeighborhoods.length > 0) {
      setNeighborhoods(data.preferredNeighborhoods.join('، '));
    }
    if (data.budgetMin !== undefined && data.budgetMin !== '') {
      setBudgetMin(data.budgetMin);
    }
    if (data.budgetMax !== undefined && data.budgetMax !== '') {
      setBudgetMax(data.budgetMax);
    }
    if (data.notes) {
      setNotes((prev) => (prev ? `${prev}\n\n${data.notes}` : data.notes));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || phone.trim() === '+9665') {
      alert('يرجى كتابة الاسم الكريم ورقم الجوال للتواصل');
      return;
    }

    const min = budgetMin !== '' ? Number(budgetMin) : 0;
    const max = budgetMax !== '' ? Number(budgetMax) : 0;

    const fullNotes = [
      notes.trim(),
      selectedFeatures.length > 0 ? `المميزات المطلوبة: ${selectedFeatures.join('، ')}` : '',
      '[طلب مقدم عبر بوابة العملاء الذاتية]'
    ].filter(Boolean).join('\n');

    const newClient = onSubmitRequest({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      role,
      budgetMin: min,
      budgetMax: max > 0 ? max : (min > 0 ? min * 1.5 : 3000000),
      preferredTypes,
      preferredPurpose,
      preferredCities: [city],
      preferredNeighborhoods: neighborhoods.trim() 
        ? neighborhoods.split(/[،,]+/).map(s => s.trim()).filter(Boolean) 
        : undefined,
      status: 'active',
      notes: fullNotes,
    });

    // Compute matches
    const matches = properties
      .filter(p => p.status === 'available')
      .map(p => ({
        property: p,
        score: calculateMatch(p, newClient).score,
      }))
      .filter(item => item.score >= 50)
      .sort((a, b) => b.score - a.score);

    setSubmittedClient(newClient);
    setMatchedList(matches);
  };

  const resetForm = () => {
    setSubmittedClient(null);
    setMatchedList([]);
    setName('');
    setPhone('+9665');
    setEmail('');
    setRole('buyer');
    setPreferredPurpose('sale');
    setPreferredTypes(['villa']);
    setCity(DEFAULT_CITY);
    setNeighborhoods('');
    setBudgetMin('');
    setBudgetMax('');
    setSelectedFeatures([]);
    setNotes('');
  };

  const agencyWhatsapp = '966509988771';
  const whatsappMessage = encodeURIComponent(
    `مرحباً، قمت بتسجيل طلبي العقاري عبر بوابتكم باسم: ${submittedClient?.name}، رقم الطلب: ${submittedClient?.id}، نوع الطلب: ${preferredPurpose === 'sale' ? 'شراء' : 'إيجار'} ${preferredTypes.join(' أو ')} في مدينة ${city}. أرجو تزويدي بالعروض المناسبة.`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">بوابة العملاء | تقديم طلب عقاري</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  خدمة فورية
                </span>
              </div>
              <p className="text-xs text-slate-300">
                حدد مواصفاتك وخياراتك العقارية وسيتم مطابقتها مع عروضنا والتواصل معك فوراً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Form OR Success Result */}
        {submittedClient ? (
          <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Success Banner */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                تم استلام وتوثيق طلبك العقاري بنجاح يا أستاذ {submittedClient.name}!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">
                تم تسجيل طلبك في نظامنا تحت المعرف: <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-emerald-300">{submittedClient.id}</span>
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-white block text-sm">ملخص طلبك وخياراتك:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">الغرض:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{submittedClient.preferredPurpose === 'sale' ? 'شراء عقار' : 'استئجار عقار'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">الخيارات المفضلة:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {submittedClient.preferredTypes.map(t => PROPERTY_TYPES.find(p => p.value === t)?.label || t).join('، ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">المدينة:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{city}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">الميزانية:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {submittedClient.budgetMin ? formatCurrency(submittedClient.budgetMin) : 'غير محدد'} إلى {formatCurrency(submittedClient.budgetMax)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">رقم التواصل:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white" dir="ltr">{submittedClient.phone}</span>
                </div>
              </div>
            </div>

            {/* Matched Properties Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    عقارات مقترحة متوفرة فوراً تطابق طلبك ({matchedList.length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">نتائج فورية من النظام</span>
              </div>

              {matchedList.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xs text-slate-500 dark:text-slate-400">
                  لا توجد عروض مطابقة مباشرة في هذه اللحظة، سيقوم فريقنا بالبحث والتواصل معك فور توفر عقار مناسب!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchedList.slice(0, 4).map(({ property, score }) => (
                    <div
                      key={property.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            مطابقة {score}%
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{property.referenceCode}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 mb-1">
                          {property.title}
                        </h5>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{property.city}، {property.neighborhood}</span>
                        </div>
                        <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">
                          {formatCurrency(property.price)}
                        </div>
                      </div>

                      {property.googleMapsUrl && (
                        <a
                          href={typeof property.googleMapsUrl === 'string' && property.googleMapsUrl.startsWith('http') ? property.googleMapsUrl : `https://maps.google.com/?q=${encodeURIComponent(property.googleMapsUrl || '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-semibold inline-flex items-center gap-1 mb-1.5"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>الموقع على خرائط Google 🗺️</span>
                        </a>
                      )}

                      {onViewProperty && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onViewProperty(property);
                          }}
                          className="w-full py-1 text-center bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors"
                        >
                          معاينة تفاصيل العقار
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct WhatsApp Contact Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href={`https://wa.me/${agencyWhatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>متابعة وتأكيد الطلب عبر واتساب المكتب</span>
              </a>

              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors"
              >
                تقديم طلب آخر
              </button>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Smart WhatsApp Text Parser */}
            <SmartWhatsAppClientParser onParsed={handleSmartParsed} />

            {/* Step 1: Client Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                بياناتك الشخصية ومعلومات الاتصال
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الكريم *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الجوال للتواصل *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966500000000"
                      className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Purpose & Property Type Choices */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                نوع الطلب وخيارات العقار المطلوبة
              </h3>

              {/* Purpose */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreferredPurpose('sale');
                    setRole('buyer');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    preferredPurpose === 'sale'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  شراء عقار (تملك)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreferredPurpose('rent');
                    setRole('tenant');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    preferredPurpose === 'rent'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  استئجار عقار (إيجار)
                </button>
              </div>

              {/* Multiple Property Types Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  خيارات نوع العقار (يمكنك اختيار أكثر من نوع):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PROPERTY_TYPES.map(type => {
                    const isSelected = preferredTypes.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => togglePropertyType(type.value)}
                        className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all text-center ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-500 font-bold shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Location & Budget */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                الموقع المفضل والميزانية المقدرة
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    المدينة المفضلة *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
                  >
                    {SAUDI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      الأحياء المفضلة (اختياري)
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">
                      {city === 'جدة' ? 'أحياء جدة' : `أحياء ${city}`}
                    </span>
                  </div>
                  <input
                    type="text"
                    list="request-neighborhoods-list"
                    value={neighborhoods}
                    onChange={(e) => setNeighborhoods(e.target.value)}
                    placeholder={city === 'جدة' ? 'مثال: حي الشاطئ، حي الروضة، أبحر الشمالية' : 'اسم الحي'}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <datalist id="request-neighborhoods-list">
                    {(CITY_NEIGHBORHOODS[city] || JEDDAH_NEIGHBORHOODS).map((nh) => (
                      <option key={nh} value={nh} />
                    ))}
                  </datalist>
                  {/* Quick neighborhood suggestions */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(CITY_NEIGHBORHOODS[city] || JEDDAH_NEIGHBORHOODS).slice(0, 5).map((quickNh) => (
                      <button
                        key={quickNh}
                        type="button"
                        onClick={() => {
                          const current = neighborhoods ? neighborhoods.split(/[,،]+/).map(s => s.trim()).filter(Boolean) : [];
                          if (!current.includes(quickNh)) {
                            setNeighborhoods([...current, quickNh].join('، '));
                          }
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {quickNh.replace('حي ', '')} +
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الحد الأدنى للميزانية (ريال)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 500,000"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الحد الأقصى للميزانية (ريال)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 2,500,000"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Desired Features and Notes */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                مميزات ومواصفات مرغوبة:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_FEATURES.slice(0, 10).map(feat => {
                  const isSelected = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? `✓ ${feat}` : `+ ${feat}`}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات وخيارات خاصة
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي مواصفات إضافية مثل عدد الغرف، المصعد، الواجهة، أو وقت التواصل المفضل..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال الطلب العقاري وعرض النتائج</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
