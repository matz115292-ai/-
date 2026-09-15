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
  Eye, 
  Edit, 
  Trash2, 
  Users,
  MapPin
} from 'lucide-react';

interface PropertyTableProps {
  properties: Property[];
  clients: Client[];
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Property['status']) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  isAdmin?: boolean;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  clients,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  isAdmin = true,
}) => {
  const allSelected = properties.length > 0 && selectedIds.length === properties.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold sticky top-0">
            <tr>
              {onToggleSelect && (
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    title="تحديد الكل"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-3">العقار والمعرف</th>
              <th className="p-3">الموقع والحي</th>
              <th className="p-3">السعر والغرض</th>
              <th className="p-3">المساحة والمواصفات</th>
              <th className="p-3">النوع</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">المطابقات</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {properties.map(property => {
              const typeObj = PROPERTY_TYPES.find(t => t.value === property.type);
              const statusObj = PROPERTY_STATUSES.find(s => s.value === property.status);
              const matchedClients = clients.filter(client => calculateMatch(client, property).isMatch);
              const isSelected = selectedIds.includes(property.id);

              return (
                <tr 
                  key={property.id}
                  className={`transition-colors ${isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'}`}
                >
                  {onToggleSelect && (
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(property.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Property Title & Image */}
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <div 
                          onClick={() => onView(property)}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate max-w-[200px]"
                        >
                          {property.title}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5 flex-wrap">
                          <span>Ref: {property.referenceCode}</span>
                          {property.marketerName && (
                            <span className="text-[10px] font-sans font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 px-1.5 py-0.2 rounded">
                              مسوق: {property.marketerName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <span>{property.city}</span>
                      {property.googleMapsUrl && (
                        <a
                          href={typeof property.googleMapsUrl === 'string' && property.googleMapsUrl.startsWith('http') ? property.googleMapsUrl : `https://maps.google.com/?q=${encodeURIComponent(property.googleMapsUrl || '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 inline-flex items-center"
                          title="عرض في خرائط Google"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">{property.neighborhood}</div>
                  </td>

                  {/* Price & Purpose */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(property.price)}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {property.purpose === 'sale' ? 'بيع' : 'إيجار سنوي'}
                    </div>
                  </td>

                  {/* Area & Rooms */}
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <div>{formatArea(property.area)}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      {property.rooms !== undefined ? `${property.rooms} غرف` : '—'} • {property.bathrooms !== undefined ? `${property.bathrooms} حمام` : '—'}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      property.type === 'commercial' || property.type === 'office'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    }`}>
                      {typeObj?.label || property.type}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-3 whitespace-nowrap">
                    <select
                      value={property.status}
                      onChange={(e) => onStatusChange(property.id, e.target.value as Property['status'])}
                      className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="available">متاح</option>
                      <option value="reserved">محجوز</option>
                      <option value="sold">تم البيع</option>
                      <option value="rented">تم التأجير</option>
                    </select>
                  </td>

                  {/* Matches */}
                  <td className="p-3 whitespace-nowrap">
                    {matchedClients.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        <span>{matchedClients.length} عميل</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(property)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(property)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(property.id)}
                        className="p-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                        title="حذف هذا العقار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
