import React from 'react';
import { Property, Client, Appointment } from '../types';
import { formatCurrency, PROPERTY_TYPES, PROPERTY_STATUSES } from '../utils/helpers';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ArrowUpRight, 
  ChevronLeft,
  Phone,
  MessageSquare
} from 'lucide-react';

interface StatsOverviewProps {
  properties: Property[];
  clients: Client[];
  appointments: Appointment[];
  onViewProperty?: (property: Property) => void;
  onViewClient?: (client: Client) => void;
  onNavigateToTab?: (tab: 'properties' | 'clients' | 'matching' | 'appointments' | 'map') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  properties,
  clients,
  appointments,
  onViewProperty,
  onViewClient,
  onNavigateToTab,
}) => {
  const totalProperties = properties.length;
  const availableProps = properties.filter(p => p.status === 'available').length;
  const reservedProps = properties.filter(p => p.status === 'reserved').length;
  const soldOrRentedProps = properties.filter(p => p.status === 'sold' || p.status === 'rented').length;

  const totalValue = properties
    .filter(p => p.purpose === 'sale')
    .reduce((sum, p) => sum + p.price, 0);

  const totalRentValue = properties
    .filter(p => p.purpose === 'rent')
    .reduce((sum, p) => sum + p.price, 0);

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active' || c.status === 'negotiating').length;
  const buyersCount = clients.filter(c => c.role === 'buyer').length;
  const tenantsCount = clients.filter(c => c.role === 'tenant').length;
  const investorsCount = clients.filter(c => c.role === 'investor').length;

  // City breakdown
  const cityCounts: Record<string, number> = {};
  properties.forEach(p => {
    cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
  });

  // Type breakdown
  const typeCounts: Record<string, number> = {};
  properties.forEach(p => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  });

  // Recent 5 properties
  const recentProperties = [...properties].slice(0, 5);
  // Recent 4 clients
  const recentClients = [...clients].slice(0, 4);

  const getStatusIndicator = (status: Property['status']) => {
    switch (status) {
      case 'available':
        return <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5">● متاح</span>;
      case 'reserved':
        return <span className="text-amber-500 text-xs font-semibold flex items-center gap-1.5">● محجوز</span>;
      case 'sold':
        return <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">● مباع</span>;
      case 'rented':
        return <span className="text-blue-600 text-xs font-semibold flex items-center gap-1.5">● مؤجر</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4-Column KPI Row (High Density theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">إجمالي العقارات</div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalProperties}</div>
          <div className="text-emerald-600 dark:text-emerald-400 text-xs mt-2 font-medium">↑ {availableProps} عقار متاح للعرض</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">العملاء النشطون</div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalClients}</div>
          <div className="text-blue-600 dark:text-blue-400 text-xs mt-2 font-medium">• {activeClients} عميل جاد ونشط</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">قيمة محفظة البيع</div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(totalValue)}</div>
          <div className="text-slate-400 dark:text-slate-500 text-xs mt-2">إيجارات سنوية: {formatCurrency(totalRentValue)}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">المواعيد والمعاينات</div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{appointments.length}</div>
          <div className="text-amber-600 dark:text-amber-400 text-xs mt-2 font-medium">
            ⚠ {appointments.filter(a => a.status === 'pending').length} قيد المتابعة اليوم
          </div>
        </div>
      </div>

      {/* Main High Density Data Split: Recent Properties Table + Client Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Properties Table (2 Cols) */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">أحدث العقارات المسجلة</h2>
            {onNavigateToTab && (
              <button 
                onClick={() => onNavigateToTab('properties')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">العقار</th>
                  <th className="p-3 font-semibold">الموقع</th>
                  <th className="p-3 font-semibold">السعر</th>
                  <th className="p-3 font-semibold">النوع</th>
                  <th className="p-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentProperties.map(property => {
                  const typeObj = PROPERTY_TYPES.find(t => t.value === property.type);
                  return (
                    <tr 
                      key={property.id}
                      onClick={() => onViewProperty && onViewProperty(property)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={property.imageUrl}
                          alt={property.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                            {property.title}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            Ref: {property.referenceCode}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {property.city}، {property.neighborhood}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(property.price)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          property.type === 'commercial' || property.type === 'office'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {typeObj?.label || property.type}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {getStatusIndicator(property.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Client Requests (1 Col) */}
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">طلبات العملاء الجدد</h2>
            {onNavigateToTab && (
              <button 
                onClick={() => onNavigateToTab('clients')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="p-4 space-y-3 overflow-y-auto">
            {recentClients.map(client => {
              const cleanPhone = client.phone.replace(/\D/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`السلام عليكم أستاذ ${client.name}، بخصوص طلبك العقاري`)}`;

              return (
                <div 
                  key={client.id}
                  className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-slate-900 dark:text-white">{client.name}</div>
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                      {client.status === 'active' ? 'نشط' : client.status === 'negotiating' ? 'تفاوض' : 'متابعة'}
                    </span>
                  </div>

                  <div className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    طلب: {client.preferredTypes.map(t => PROPERTY_TYPES.find(pt => pt.value === t)?.label || t).join(' أو ')} • {client.preferredCities.join('، ')}
                  </div>

                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono" dir="ltr">
                      {client.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium"
                      >
                        واتساب
                      </a>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <button 
                        onClick={() => onViewClient && onViewClient(client)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
                      >
                        التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Breakdowns section: Types, Distribution & Geographic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Properties Distribution by Type */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>توزيع العقارات حسب النوع</span>
          </h3>

          <div className="space-y-2.5">
            {PROPERTY_TYPES.map(t => {
              const count = typeCounts[t.value] || 0;
              const percent = totalProperties > 0 ? Math.round((count / totalProperties) * 100) : 0;
              return (
                <div key={t.value}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>{t.label}</span>
                    <span className="text-slate-500 dark:text-slate-400">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clients Classification */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>تصنيف رغبات العملاء</span>
          </h3>

          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">راغبو الشراء (مشترين)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{buyersCount}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded">
                  {totalClients > 0 ? Math.round((buyersCount / totalClients) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">راغبو الإيجار (مستأجرين)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{tenantsCount}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 rounded">
                  {totalClients > 0 ? Math.round((tenantsCount / totalClients) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">المستثمرون العقاريون</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{investorsCount}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 rounded">
                  {totalClients > 0 ? Math.round((investorsCount / totalClients) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>التوزيع الجغرافي للمحفظة</span>
            </h3>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('map')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-semibold flex items-center gap-1"
              >
                <span>استكشاف الخريطة 🗺️</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {Object.entries(cityCounts).map(([city, count]) => {
              const countNum = Number(count);
              const percent = totalProperties > 0 ? Math.round((countNum / totalProperties) * 100) : 0;
              return (
                <div key={city}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>{city}</span>
                    <span className="text-slate-500 dark:text-slate-400">{countNum} ({percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-700 dark:bg-slate-600 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
