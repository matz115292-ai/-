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
  Eye, 
  Edit, 
  Trash2, 
  Sparkles,
  Phone,
  MessageSquare
} from 'lucide-react';

interface ClientTableProps {
  clients: Client[];
  properties: Property[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewMatches: (client: Client) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  isAdmin?: boolean;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  properties,
  onView,
  onEdit,
  onDelete,
  onViewMatches,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  isAdmin = true,
}) => {
  const allSelected = clients.length > 0 && selectedIds.length === clients.length;

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
              <th className="p-3">العميل</th>
              <th className="p-3">رقم الهاتف والتواصل</th>
              <th className="p-3">الميزانية المرصودة</th>
              <th className="p-3">العقار والنوع المطلوب</th>
              <th className="p-3">المدن المستهدفة</th>
              <th className="p-3">حالة الطلب</th>
              <th className="p-3">المطابقات</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {clients.map(client => {
              const roleObj = CLIENT_ROLES.find(r => r.value === client.role);
              const statusObj = CLIENT_STATUSES.find(s => s.value === client.status);
              const matchedProps = properties.filter(prop => calculateMatch(client, prop).isMatch);
              const cleanPhone = client.phone.replace(/\D/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`السلام عليكم أستاذ ${client.name}، بخصوص طلبك العقاري`)}`;
              const isSelected = selectedIds.includes(client.id);

              return (
                <tr 
                  key={client.id}
                  className={`transition-colors ${isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'}`}
                >
                  {onToggleSelect && (
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(client.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Client Name & Role */}
                  <td className="p-3">
                    <div 
                      onClick={() => onView(client)}
                      className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {client.name}
                    </div>
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-medium inline-block mt-0.5">
                      {roleObj?.label}
                    </span>
                  </td>

                  {/* Phone & Instant Contact */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-700 dark:text-slate-300" dir="ltr">{client.phone}</span>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-1"
                        title="واتساب"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1"
                        title="اتصال"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {client.preferredPurpose === 'sale' ? 'شراء' : client.preferredPurpose === 'rent' ? 'إيجار' : 'شراء أو إيجار'}
                    </div>
                  </td>

                  {/* Preferred Types */}
                  <td className="p-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[160px] inline-block">
                      {client.preferredTypes.map(t => PROPERTY_TYPES.find(pt => pt.value === t)?.label || t).join('، ') || 'أي نوع'}
                    </span>
                  </td>

                  {/* Cities */}
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <span className="truncate max-w-[140px] inline-block">
                      {client.preferredCities.join('، ')}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-3 whitespace-nowrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusObj?.color}`}>
                      {statusObj?.label}
                    </span>
                  </td>

                  {/* Matches */}
                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={() => onViewMatches(client)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        matchedProps.length > 0
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{matchedProps.length} عقارات</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(client)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors"
                        title="عرض الملف"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
