// Source: Google Maps Platform Code Assist
import React, { useState, useMemo, useCallback } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Property, PropertyType, PropertyPurpose } from '../types';
import { formatCurrency, formatArea, PROPERTY_TYPES } from '../utils/helpers';
import { GoogleMapsWrapper } from './GoogleMapsWrapper';
import { 
  MapPin, 
  Layers, 
  Search, 
  Filter, 
  ExternalLink, 
  Eye, 
  Building, 
  Home, 
  Sparkles,
  Compass,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';

interface PropertiesMapViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

const SAUDI_CITIES = [
  { name: 'جدة', lat: 21.5433, lng: 39.1728, zoom: 12 },
  { name: 'الكل', lat: 21.5433, lng: 39.1728, zoom: 7 },
  { name: 'مكة المكرمة', lat: 21.3891, lng: 39.8579, zoom: 12 },
  { name: 'الرياض', lat: 24.7136, lng: 46.6753, zoom: 11 },
  { name: 'الخبر / الدمام', lat: 26.3040, lng: 50.2084, zoom: 12 },
  { name: 'المدينة المنورة', lat: 24.5247, lng: 39.5692, zoom: 12 },
];

const MapController: React.FC<{ targetLocation: { lat: number; lng: number; zoom?: number } | null }> = ({ targetLocation }) => {
  const map = useMap();

  React.useEffect(() => {
    if (map && targetLocation) {
      map.panTo({ lat: targetLocation.lat, lng: targetLocation.lng });
      if (targetLocation.zoom) {
        map.setZoom(targetLocation.zoom);
      }
    }
  }, [map, targetLocation]);

  return null;
};

export const PropertiesMapView: React.FC<PropertiesMapViewProps> = ({
  properties,
  onSelectProperty,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('جدة');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>({
    lat: 21.5433,
    lng: 39.1728,
    zoom: 12,
  });

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // City filter
      if (selectedCity !== 'الكل' && !p.city.includes(selectedCity) && !selectedCity.includes(p.city)) {
        return false;
      }
      // Purpose filter
      if (selectedPurpose !== 'all' && p.purpose !== selectedPurpose) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && p.type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchRef = p.referenceCode.toLowerCase().includes(query);
        const matchNeigh = p.neighborhood.toLowerCase().includes(query);
        if (!matchTitle && !matchRef && !matchNeigh) return false;
      }
      return true;
    });
  }, [properties, selectedCity, selectedPurpose, selectedType, searchQuery]);

  // Properties with coordinates
  const propertiesWithCoords = useMemo(() => {
    return filteredProperties.map((p) => {
      // If coordinates are explicitly provided
      if (p.latitude && p.longitude) {
        return { ...p, lat: p.latitude, lng: p.longitude };
      }
      // Parse from googleMapsUrl if present (?q=lat,lng)
      if (p.googleMapsUrl) {
        const match = p.googleMapsUrl.match(/q=([0-9.]+),([0-9.]+)/);
        if (match) {
          return { ...p, lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }
      }
      // Fallback coordinate by city
      if (p.city.includes('الرياض')) {
        return { ...p, lat: 24.7136 + (Math.random() - 0.5) * 0.08, lng: 46.6753 + (Math.random() - 0.5) * 0.08 };
      }
      if (p.city.includes('جدة')) {
        return { ...p, lat: 21.5433 + (Math.random() - 0.5) * 0.08, lng: 39.1728 + (Math.random() - 0.5) * 0.08 };
      }
      if (p.city.includes('الخبر') || p.city.includes('الدمام')) {
        return { ...p, lat: 26.3040 + (Math.random() - 0.5) * 0.08, lng: 50.2084 + (Math.random() - 0.5) * 0.08 };
      }
      return { ...p, lat: 21.5433, lng: 39.1728 };
    });
  }, [filteredProperties]);

  const handleCityChange = (city: typeof SAUDI_CITIES[0]) => {
    setSelectedCity(city.name);
    setTargetLocation({ lat: city.lat, lng: city.lng, zoom: city.zoom });
  };

  const handlePropertyCardClick = (p: typeof propertiesWithCoords[0]) => {
    setActiveProperty(p);
    setTargetLocation({ lat: p.lat, lng: p.lng, zoom: 15 });
  };

  // Color generator for pins based on type
  const getPinColor = (type: PropertyType) => {
    switch (type) {
      case 'villa':
        return { bg: '#059669', border: '#047857', glyph: '#ffffff' }; // emerald
      case 'apartment':
        return { bg: '#2563eb', border: '#1d4ed8', glyph: '#ffffff' }; // blue
      case 'land':
        return { bg: '#d97706', border: '#b45309', glyph: '#ffffff' }; // amber
      case 'office':
      case 'commercial':
      case 'building':
        return { bg: '#7c3aed', border: '#6d28d9', glyph: '#ffffff' }; // purple
      default:
        return { bg: '#475569', border: '#334155', glyph: '#ffffff' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">خريطة العقارات التفاعلية</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              استكشف جميع العروض والمخططات العقارية في مختلف المدن والأحياء مباشرة على خرائط Google
            </p>
          </div>

          {/* City quick buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>المدن:</span>
            </span>
            {SAUDI_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleCityChange(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCity === city.name
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالحي، الكود، أو العنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-right text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Purpose */}
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-right text-slate-900 dark:text-white"
          >
            <option value="all">كل الأغراض (بيع وإيجار)</option>
            <option value="sale">للبيع فقط</option>
            <option value="rent">للإيجار فقط</option>
          </select>

          {/* Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-right text-slate-900 dark:text-white"
          >
            <option value="all">جميع أنواع العقارات</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Stats Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-300">
            <span className="font-medium">العقارات المعروضة:</span>
            <span className="font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[11px]">
              {propertiesWithCoords.length} عقار
            </span>
          </div>
        </div>
      </div>

      {/* Map + Side Listing Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left/Main Map Canvas (8 cols on large screen) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 shadow-xs overflow-hidden flex flex-col">
          <div className="relative w-full h-[580px] rounded-xl overflow-hidden">
            <GoogleMapsWrapper fallbackTitle="خريطة العقارات المعتمدة">
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={{ lat: 24.7136, lng: 46.6753 }}
                defaultZoom={11}
                gestureHandling="greedy"
                disableDefaultUI={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                <MapController targetLocation={targetLocation} />

                {/* Advanced Markers */}
                {propertiesWithCoords.map((property) => {
                  const pinTheme = getPinColor(property.type);
                  const isSelected = activeProperty?.id === property.id;

                  return (
                    <AdvancedMarker
                      key={property.id}
                      position={{ lat: property.lat, lng: property.lng }}
                      title={`${property.referenceCode} - ${property.title}`}
                      onClick={() => setActiveProperty(property)}
                    >
                      <Pin
                        background={isSelected ? '#dc2626' : pinTheme.bg}
                        borderColor={isSelected ? '#991b1b' : pinTheme.border}
                        glyphColor={pinTheme.glyph}
                        scale={isSelected ? 1.3 : 1.1}
                      />
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow for Active Property */}
                {activeProperty && (
                  <InfoWindow
                    position={{
                      lat: (activeProperty as any).lat || activeProperty.latitude || 24.7136,
                      lng: (activeProperty as any).lng || activeProperty.longitude || 46.6753,
                    }}
                    onCloseClick={() => setActiveProperty(null)}
                    maxWidth={290}
                  >
                    <div className="p-1 text-right font-sans" dir="rtl">
                      {/* Image */}
                      <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2">
                        <img
                          src={activeProperty.imageUrl}
                          alt={activeProperty.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {activeProperty.referenceCode}
                        </span>
                        <span
                          className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            activeProperty.purpose === 'sale'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {activeProperty.purpose === 'sale' ? 'للبيع' : 'للإيجار'}
                        </span>
                      </div>

                      {/* Info */}
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">
                        {activeProperty.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{activeProperty.city}، {activeProperty.neighborhood}</span>
                      </p>

                      <div className="flex items-center justify-between py-1.5 border-t border-slate-100 mb-2">
                        <span className="text-[10px] text-slate-400">السعر:</span>
                        <span className="text-xs font-black text-blue-700">
                          {formatCurrency(activeProperty.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectProperty(activeProperty)}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة التفاصيل</span>
                        </button>
                        {activeProperty.googleMapsUrl && (
                          <a
                            href={activeProperty.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="فتح في Google Maps الأصلي"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </GoogleMapsWrapper>
          </div>
        </div>

        {/* Right Side Listing (4 cols on large screen) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              قائمة العقارات بالخريطة ({propertiesWithCoords.length})
            </span>
            <span className="text-[10px] text-slate-400">انقر على عقار للتركيز عليه</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
            {propertiesWithCoords.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Building className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">لا توجد عقارات مطابقة لمعايير البحث الحالية</p>
              </div>
            ) : (
              propertiesWithCoords.map((property) => {
                const isSelected = activeProperty?.id === property.id;
                return (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyCardClick(property)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-right flex gap-3 ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                        {property.referenceCode}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-1.5 py-0.5 rounded">
                            {PROPERTY_TYPES.find((t) => t.value === property.type)?.label || property.type}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              property.purpose === 'sale'
                                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70'
                                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70'
                            }`}
                          >
                            {property.purpose === 'sale' ? 'بيع' : 'إيجار'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {property.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {property.city} • {property.neighborhood}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(property.price)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProperty(property);
                          }}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-0.5"
                        >
                          <span>عرض</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
