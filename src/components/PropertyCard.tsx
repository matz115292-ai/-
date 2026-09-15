import React from 'react';
import { Property, Client } from '../types';
import { 
  formatCurrency, 
  formatArea, 
  PROPERTY_TYPES, 
  PROPERTY_STATUSES,
  calculateMatch 
} from '../utils/helpers';
import { 
  MapPin, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  Play,
  Image as ImageIcon
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  clients: Client[];
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Property['status']) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isAdmin?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  clients,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isSelected = false,
  onToggleSelect,
  isAdmin = true,
}) => {
  const typeObj = PROPERTY_TYPES.find(t => t.value === property.type);
  const statusObj = PROPERTY_STATUSES.find(s => s.value === property.status);

  // Compute matched clients
  const matchedClients = clients.filter(client => {
    const match = calculateMatch(client, property);
    return match.isMatch;
  });

  return (
    <div 
      id={`property-card-${property.id}`}
      className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-150 flex flex-col overflow-hidden group text-right ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
      }`}
    >
      {/* Thumbnail & Badges */}
      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={property.imageUrl}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Top Badges & Checkbox */}
        <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-white/80 bg-white/95 shadow-sm cursor-pointer"
                title="تحديد هذا العقار"
              />
            )}
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded shadow-xs ${
              property.purpose === 'sale' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
            }`}>
              {property.purpose === 'sale' ? 'للبيع' : 'للإيجار'}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-black/60 text-white backdrop-blur-xs">
              {property.referenceCode}
            </span>
          </div>

          <span className={`px-2 py-0.5 text-[11px] font-bold rounded pointer-events-auto shadow-xs border ${statusObj?.bg} ${statusObj?.color}`}>
            {statusObj?.label}
          </span>
        </div>

        {/* Bottom image overlay: Price */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-end justify-between text-white">
          <div>
            <div className="text-base font-black tracking-tight text-white leading-none">
              {formatCurrency(property.price)}
            </div>
            <span className="text-[10px] text-slate-200 font-medium">
              {property.purpose === 'sale' ? 'سعر البيع المطلوب' : 'الإيجار السنوي'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {property.videoUrl && (
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs">
                <Play className="w-2.5 h-2.5 fill-white" />
                <span>فيديو</span>
              </span>
            )}
            {property.images && property.images.length > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs">
                <ImageIcon className="w-2.5 h-2.5" />
                <span>{property.images.length}</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs text-[11px] font-medium border border-white/20">
              {typeObj?.label || property.type}
            </span>
          </div>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onView(property)}
            className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {property.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-1.5 mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{property.city}، {property.neighborhood}</span>
            </div>
            {property.googleMapsUrl && (
              <a
                href={typeof property.googleMapsUrl === 'string' && property.googleMapsUrl.startsWith('http') ? property.googleMapsUrl : `https://maps.google.com/?q=${encodeURIComponent(property.googleMapsUrl || '')}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 shrink-0 transition-colors"
                title="فتح الموقع في خرائط Google"
              >
                <span>خريطة قوقل 📍</span>
              </a>
            )}
          </div>

          {/* Quick specs grid */}
          <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-slate-50 dark:bg-slate-800/70 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 mb-2.5 text-center">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">المساحة</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatArea(property.area)}</span>
            </div>
            <div className="border-r border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">الغرف</span>
              <span className="font-bold text-slate-900 dark:text-white">{property.rooms !== undefined ? property.rooms : '—'}</span>
            </div>
            <div className="border-r border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">الحمامات</span>
              <span className="font-bold text-slate-900 dark:text-white">{property.bathrooms !== undefined ? property.bathrooms : '—'}</span>
            </div>
          </div>

          {/* Features pills */}
          {property.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {property.features.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium">
                  +{property.features.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Marketer tag if assigned */}
          {property.marketerName && (
            <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-md mb-2">
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">المسوق المسؤول:</span>
              <span className="font-semibold text-blue-700 dark:text-blue-400 truncate">{property.marketerName}</span>
            </div>
          )}

          {/* Matched Clients Badge */}
          {matchedClients.length > 0 ? (
            <div className="flex items-center justify-between text-xs py-1 px-2 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-300 mb-2">
              <div className="flex items-center gap-1 font-medium">
                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>طلبات مطابقة:</span>
              </div>
              <span className="font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded text-[10px]">
                {matchedClients.length} عميل
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 py-1 text-center mb-1">
              لا توجد طلبات مطابقة حالياً
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
          {/* Quick status selector */}
          <select
            id={`select-status-${property.id}`}
            value={property.status}
            onChange={(e) => onStatusChange(property.id, e.target.value as Property['status'])}
            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="available">متاح</option>
            <option value="reserved">محجوز</option>
            <option value="sold">تم البيع</option>
            <option value="rented">تم التأجير</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              id={`btn-view-prop-${property.id}`}
              onClick={() => onView(property)}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors"
              title="عرض التفاصيل الكاملة"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              id={`btn-edit-prop-${property.id}`}
              onClick={() => onEdit(property)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="تعديل العقار"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              id={`btn-delete-prop-${property.id}`}
              onClick={() => onDelete(property.id)}
              className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
              title="حذف هذا العقار"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
