import React from 'react';
import { Client, Property } from '../types';
import { 
  formatCurrency, 
  formatArea, 
  CLIENT_ROLES, 
  CLIENT_STATUSES, 
  PROPERTY_TYPES, 
  calculateMatch 
} from '../utils/helpers';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Home, 
  Wallet, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Building 
} from 'lucide-react';

interface ClientDetailModalProps {
  client: Client | null;
  properties: Property[];
  onClose: () => void;
  onSelectProperty?: (property: Property) => void;
  onScheduleVisit?: (property: Property, client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  properties,
  onClose,
  onSelectProperty,
  onScheduleVisit,
}) => {
  if (!client) return null;

  const roleObj = CLIENT_ROLES.find(r => r.value === client.role);
  const statusObj = CLIENT_STATUSES.find(s => s.value === client.status);

  // Compute matching properties for this client
  const matchedProperties = properties
    .map(prop => ({
      property: prop,
      match: calculateMatch(client, prop),
    }))
    .filter(item => item.match.isMatch)
    .sort((a, b) => b.match.score - a.match.score);

  const cleanPhone = client.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`السلام عليكم أستاذ ${client.name}، بخصوص طلبك العقاري المحدث لدينا`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {client.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">{client.name}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {roleObj?.label}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusObj?.color}`}>
                  {statusObj?.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">تاريخ التسجيل في النظام: {client.createdAt}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5 text-right">
          {/* Contact Row */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono font-medium" dir="ltr">{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{client.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>محادثة واتساب</span>
              </a>
              <a
                href={`tel:${cleanPhone}`}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>اتصال</span>
              </a>
            </div>
          </div>

          {/* Preferences Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>نطاق الميزانية</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                {client.preferredPurpose === 'sale' ? 'شراء وتملك' : client.preferredPurpose === 'rent' ? 'استئجار' : 'شراء أو إيجار'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>العقارات المفضلة</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {client.preferredTypes.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 rounded font-medium">
                    {PROPERTY_TYPES.find(pt => pt.value === t)?.label || t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>المدن والأحياء</span>
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">{client.preferredCities.join('، ')}</div>
              {client.preferredNeighborhoods && client.preferredNeighborhoods.length > 0 && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  الأحياء: {client.preferredNeighborhoods.join('، ')}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1.5">ملاحظات العميل الخاصة</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-100 dark:border-slate-700 leading-relaxed">
                {client.notes}
              </p>
            </div>
          )}

          {/* Matched Properties Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  العقارات المتطابقة مع رغبة وميزانية {client.name} ({matchedProperties.length})
                </h3>
              </div>
            </div>

            {matchedProperties.length > 0 ? (
              <div className="space-y-2.5">
                {matchedProperties.map(({ property, match }) => (
                  <div
                    key={property.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all flex flex-col sm:flex-row items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{property.title}</span>
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                            تطابق {match.score}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {property.city}، {property.neighborhood} • {formatCurrency(property.price)} • {formatArea(property.area)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {onSelectProperty && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectProperty(property);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          معاينة العقار
                        </button>
                      )}

                      {onScheduleVisit && (
                        <button
                          onClick={() => {
                            onClose();
                            onScheduleVisit(property, client);
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
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
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                لا يوجد حالياً أي عقار مسجل يتطابق مع ميزانية أو نوع الطلب لهذا العميل.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
