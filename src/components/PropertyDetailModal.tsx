import React, { useState, useEffect } from 'react';
import { Property, Client } from '../types';
import { 
  formatCurrency, 
  formatArea, 
  PROPERTY_TYPES, 
  PROPERTY_STATUSES, 
  calculateMatch 
} from '../utils/helpers';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  User, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Share2,
  UserCheck,
  Film,
  Play,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { PropertyMapEmbed } from './PropertyMapEmbed';

interface PropertyDetailModalProps {
  property: Property | null;
  clients: Client[];
  onClose: () => void;
  onSelectClient?: (client: Client) => void;
  onScheduleVisit?: (property: Property, client?: Client) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  clients,
  onClose,
  onSelectClient,
  onScheduleVisit,
}) => {
  if (!property) return null;

  const [activeImage, setActiveImage] = useState(property.imageUrl);

  useEffect(() => {
    setActiveImage(property.imageUrl);
  }, [property]);

  const typeObj = PROPERTY_TYPES.find(t => t.value === property.type);
  const statusObj = PROPERTY_STATUSES.find(s => s.value === property.status);

  const allImages = property.images && property.images.length > 0 
    ? property.images 
    : [property.imageUrl];

  // Find all clients that match this property
  const matchedClients = clients
    .map(client => ({
      client,
      match: calculateMatch(client, property)
    }))
    .filter(item => item.match.isMatch)
    .sort((a, b) => b.match.score - a.match.score);

  const cleanPhone = property.ownerPhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`السلام عليكم بخصوص عقاركم المسجل (${property.title} - ${property.referenceCode})`)}`;

  const handleShare = () => {
    const text = `عقار مميز من شركة برق العقارية (BARQ REAL ESTATE):\n${property.title}\nالنوع: ${typeObj?.label}\nالسعر: ${formatCurrency(property.price)}\nالموقع: ${property.city} - ${property.neighborhood}\nالمساحة: ${formatArea(property.area)}`;
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ تفاصيل العقار إلى الحافظة بنجاح');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Hero Header with Property Image */}
        <div className="relative h-60 sm:h-72 bg-slate-900 overflow-hidden">
          <img
            src={activeImage}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/40 to-black/30"></div>

          {/* Close & Share buttons */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded shadow-xs ${
                property.purpose === 'sale' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
              }`}>
                {property.purpose === 'sale' ? 'للبيع' : 'للإيجار'}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded bg-black/60 text-white backdrop-blur-xs">
                Ref: {property.referenceCode}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded ${statusObj?.bg} ${statusObj?.color}`}>
                {statusObj?.label}
              </span>
              {property.videoUrl && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>فيديو متاح</span>
                </span>
              )}
              {allImages.length > 1 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>{allImages.length} صور</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg backdrop-blur-xs transition-colors"
                title="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg backdrop-blur-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom title & price overlay */}
          <div className="absolute bottom-3 right-4 left-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-blue-300 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{property.city}، {property.neighborhood}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {property.title}
              </h2>
            </div>

            <div className="text-right sm:text-left">
              <span className="text-[10px] text-slate-300 block">القيمة المطلوبة</span>
              <div className="text-xl sm:text-2xl font-black text-white leading-none">
                {formatCurrency(property.price)}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5 text-right">
          {/* Multiple Photos Gallery Strip */}
          {allImages.length > 1 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>معرض صور العقار ({allImages.length} صور)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">اضغط على أي صورة لتكبيرها في الأعلى</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === img ? 'border-blue-600 shadow-md ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">المساحة</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{formatArea(property.area)}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">نوع العقار</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{typeObj?.label || property.type}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">الغرف والمجالس</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{property.rooms !== undefined ? `${property.rooms} غرف` : '—'}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">دورات المياه</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{property.bathrooms !== undefined ? `${property.bathrooms} حمام` : '—'}</span>
            </div>
          </div>

          {/* Video Walkthrough Section if present */}
          {property.videoUrl && (
            <div className="p-4 bg-slate-900 rounded-xl text-white shadow-md border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>الجولة المرئية وفيديو العقار</span>
                    </h4>
                    {property.videoName && (
                      <span className="text-[10px] text-slate-400 font-mono block">{property.videoName}</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-xs">
                  <Play className="w-2.5 h-2.5 fill-rose-300" />
                  <span>فيديو مباشر</span>
                </span>
              </div>
              <video
                src={property.videoUrl}
                controls
                playsInline
                className="w-full max-h-72 rounded-lg bg-black object-contain shadow-inner"
              />
            </div>
          )}

          {/* Interactive Google Map Embed */}
          <PropertyMapEmbed property={property} />

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1.5">الوصف والملاحظات</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Features */}
          {property.features.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">المميزات والتجهيزات</h3>
              <div className="flex flex-wrap gap-1.5">
                {property.features.map((feat, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium border border-slate-200 dark:border-slate-700">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Marketer & Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Marketer Card */}
            <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>المسوق العقاري المفوّض:</span>
                </span>
                <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {property.marketerName || 'بدون مسوق محدد (مباشر للمكتب)'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  مفوّض لمتابعة العرض والعملاء وتنسيق المعاينات
                </div>
              </div>
            </div>

            {/* Owner Details */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">مالك العقار / البائع:</span>
                <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{property.ownerName}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5" dir="ltr">{property.ownerPhone}</div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>واتساب المالك</span>
                </a>

                <a
                  href={`tel:${cleanPhone}`}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>اتصال</span>
                </a>
              </div>
            </div>
          </div>

          {/* Matched Clients Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  العملاء المطابقون لهذا العقار ({matchedClients.length})
                </h3>
              </div>
            </div>

            {matchedClients.length > 0 ? (
              <div className="space-y-2">
                {matchedClients.map(({ client, match }) => (
                  <div
                    key={client.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-300 dark:hover:border-blue-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{client.name}</span>
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.2 rounded font-bold">
                          توافق {match.score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        ميزانية العميل: {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onScheduleVisit && (
                        <button
                          onClick={() => {
                            onClose();
                            onScheduleVisit(property, client);
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>تحديد موعد</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                لا يوجد حالياً أي عميل مسجل تتطابق ميزانيته أو متطلباته مع هذا العقار.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
