import React, { useState } from 'react';
import { Appointment, Property, Client, AppointmentType, AppointmentStatus } from '../types';
import { 
  Calendar, 
  Clock, 
  Building, 
  User, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  Phone,
  CalendarDays, 
  FileCheck,
  X,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface VisitsViewProps {
  appointments: Appointment[];
  properties: Property[];
  clients: Client[];
  onAddAppointment: (app: Omit<Appointment, 'id'>) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
}

export const VisitsView: React.FC<VisitsViewProps> = ({
  appointments,
  properties,
  clients,
  onAddAppointment,
  onUpdateStatus,
  onDeleteAppointment,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [type, setType] = useState<AppointmentType>('visit');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('04:30 م');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedPropertyId || !date) {
      setFormError('يرجى اختيار العميل والعقار وتاريخ الموعد');
      return;
    }
    setFormError(null);

    onAddAppointment({
      clientId: selectedClientId,
      propertyId: selectedPropertyId,
      type,
      date,
      time,
      status: 'pending',
      notes: notes.trim(),
    });

    setShowModal(false);
    setNotes('');
  };

  const TYPE_LABELS: Record<AppointmentType, { label: string; icon: any; color: string }> = {
    visit: { label: 'معاينة ميدانية', icon: Building, color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
    call: { label: 'متابعة هاتفية', icon: Phone, color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' },
    meeting: { label: 'اجتماع بالمكتب', icon: User, color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' },
    deal: { label: 'توقيع العقد', icon: FileCheck, color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
  };

  const STATUS_LABELS: Record<AppointmentStatus, { label: string; color: string }> = {
    pending: { label: 'قيد الانتظار', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    completed: { label: 'تمت بنجاح', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    cancelled: { label: 'ملغاة', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">جدولة المعاينات ومواعيد العملاء</h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">سجل وتابع مواعيد زيارات العقارات وجلسات التفاوض مع العملاء والملاك</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>جدولة موعد / معاينة جديدة</span>
        </button>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((app) => {
            const client = clients.find(c => c.id === app.clientId);
            const property = properties.find(p => p.id === app.propertyId);
            const typeInfo = TYPE_LABELS[app.type] || TYPE_LABELS.visit;
            const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS.pending;

            const clientPhone = client?.phone.replace(/\D/g, '') || '';
            const reminderUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(`تذكير بموعد ${typeInfo.label} لعقار (${property?.title || ''}) بتاريخ ${app.date} في تمام الساعة ${app.time}. هل الموعد مناسب لك؟`)}`;

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-800 dark:text-slate-200 py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{app.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{app.time}</span>
                    </div>
                  </div>

                  {/* Parties Info */}
                  <div className="space-y-1.5 mb-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">العميل:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{client?.name || 'عميل غير مسجل'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">العقار:</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {property?.title || 'عقار غير مسجل'}
                      </span>
                    </div>

                    {property && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 dark:text-slate-500">الموقع:</span>
                        <span className="text-slate-600 dark:text-slate-300">{property.city} - {property.neighborhood}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 italic mb-3">
                      "{app.notes}"
                    </div>
                  )}
                </div>

                {/* Bottom actions */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {app.status !== 'completed' && (
                      <button
                        onClick={() => onUpdateStatus(app.id, 'completed')}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md transition-colors flex items-center gap-1"
                        title="تحديد كمكتمل"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تمت المعاينة</span>
                      </button>
                    )}

                    {app.status === 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(app.id, 'cancelled')}
                        className="px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                        title="إلغاء الموعد"
                      >
                        إلغاء
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteAppointment(app.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                      title="حذف الموعد"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {clientPhone && (
                    <a
                      href={reminderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>تذكير بالواتساب</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">لا توجد مواعيد مجدولة حالياً</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
            يمكنك جدولة معاينة جديدة أو ربطها مباشرة من تبويب "المطابقة الذكية"
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            + جدولة موعد جديد
          </button>
        </div>
      )}

      {/* Modal for adding appointment */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 dark:bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">جدولة موعد أو معاينة جديدة</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-right">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">العميل المستهدف *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">العقار موضوع الزيارة *</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.city} - {formatCurrency(p.price)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">نوع الموعد</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AppointmentType)}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="visit">معاينة ميدانية للعقار</option>
                    <option value="call">اتصال هاتفي ومتابعة</option>
                    <option value="meeting">اجتماع بالمكتب</option>
                    <option value="deal">توقيع العقد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">وقت الموعد</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="مثال: 05:00 م"
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">تاريخ الموعد *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ملاحظات إضافية للموعد</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: العميل يريد الاطلاع على صك العقار والتحقق من موقف السيارات..."
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none h-20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  حفظ وتأكيد الموعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
