import React from 'react';
import { Client, Property } from '../types';
import { 
  formatCurrency, 
  CLIENT_ROLES, 
  CLIENT_STATUSES, 
  PROPERTY_TYPES, 
  calculateMatch 
} from '../utils/helpers';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Home, 
  Sparkles, 
  Eye, 
  Edit, 
  Trash2, 
  Wallet
} from 'lucide-react';

interface ClientCardProps {
  client: Client;
  properties: Property[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewMatches: (client: Client) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isAdmin?: boolean;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  properties,
  onView,
  onEdit,
  onDelete,
  onViewMatches,
  isSelected = false,
  onToggleSelect,
  isAdmin = true,
}) => {
  const roleObj = CLIENT_ROLES.find(r => r.value === client.role);
  const statusObj = CLIENT_STATUSES.find(s => s.value === client.status);

  // Compute how many properties match this client
  const matchedProps = properties.filter(prop => {
    const match = calculateMatch(client, prop);
    return match.isMatch;
  });

  const cleanPhone = client.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`السلام عليكم أستاذ ${client.name}، بخصوص طلبك العقاري`)}`;

  return (
    <div 
      id={`client-card-${client.id}`}
      className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-150 p-4 flex flex-col justify-between group text-right ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Top bar: Name & Status badges */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-start gap-2">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                title="تحديد هذا العميل"
              />
            )}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h3 
                  onClick={() => onView(client)}
                  className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {client.name}
                </h3>
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                  {roleObj?.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">التسجيل: {client.createdAt}</p>
            </div>
          </div>

          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusObj?.color}`}>
            {statusObj?.label}
          </span>
        </div>

        {/* Contact actions */}
        <div className="flex items-center gap-2 py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-lg border border-slate-100 dark:border-slate-800 mb-3 text-xs">
          <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]" dir="ltr">{client.phone}</span>
          <div className="mr-auto flex items-center gap-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded transition-colors"
              title="محادثة واتساب"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
            <a
              href={`tel:${cleanPhone}`}
              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="اتصال مباشر"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Preferences & Budget */}
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-3">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">الميزانية:</span>
            <span className="font-bold text-slate-900 dark:text-white text-[11px]">
              {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">النوع:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px] truncate">
              {client.preferredTypes.map(t => PROPERTY_TYPES.find(pt => pt.value === t)?.label || t).join(' أو ') || 'أي نوع'}
              {' '}({client.preferredPurpose === 'sale' ? 'شراء' : client.preferredPurpose === 'rent' ? 'إيجار' : 'الكل'})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">المدينة:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px] truncate">
              {client.preferredCities.join('، ')}
            </span>
          </div>
        </div>

        {/* Client Notes snippet */}
        {client.notes && (
          <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-3 italic">
            "{client.notes}"
          </div>
        )}
      </div>

      {/* Footer & Matches */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={() => onViewMatches(client)}
            className={`w-full text-xs font-semibold py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              matchedProps.length > 0
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {matchedProps.length > 0
                ? `مطابقة ${matchedProps.length} عقارات`
                : 'لا توجد عقارات مطابقة'}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onView(client)}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>الملف الكامل</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(client)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="تعديل"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(client.id)}
              className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
              title="حذف هذا العميل"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
