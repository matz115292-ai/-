// Source: Google Maps Platform Code Assist
import React from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Property } from '../types';
import { GoogleMapsWrapper } from './GoogleMapsWrapper';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface PropertyMapEmbedProps {
  property: Property;
}

export const PropertyMapEmbed: React.FC<PropertyMapEmbedProps> = ({ property }) => {
  // Determine coordinates
  let lat = property.latitude;
  let lng = property.longitude;

  if ((!lat || !lng) && property.googleMapsUrl) {
    const match = property.googleMapsUrl.match(/q=([0-9.]+),([0-9.]+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    }
  }

  // Fallback defaults for major cities if not yet set
  if (!lat || !lng) {
    if (property.city.includes('الرياض')) {
      lat = 24.7136;
      lng = 46.6753;
    } else if (property.city.includes('جدة')) {
      lat = 21.5433;
      lng = 39.1728;
    } else if (property.city.includes('الخبر') || property.city.includes('الدمام')) {
      lat = 26.3040;
      lng = 50.2084;
    } else {
      lat = 21.5433;
      lng = 39.1728;
    }
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const mapsUrl = property.googleMapsUrl || `https://maps.google.com/?q=${lat},${lng}`;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-right">
      {/* Header */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">موقع العقار على خريطة Google</h4>
            <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors shadow-xs"
          >
            <Navigation className="w-3 h-3" />
            <span>الاتجاهات</span>
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>فتح بالخرائط</span>
          </a>
        </div>
      </div>

      {/* Embedded Map Canvas */}
      <div className="w-full h-56 relative">
        <GoogleMapsWrapper fallbackTitle="موقع العقار على الخريطة">
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat, lng }}
            defaultZoom={14}
            gestureHandling="cooperative"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            <AdvancedMarker position={{ lat, lng }} title={property.title}>
              <Pin background="#dc2626" borderColor="#991b1b" glyphColor="#ffffff" scale={1.2} />
            </AdvancedMarker>
          </Map>
        </GoogleMapsWrapper>
      </div>
    </div>
  );
};
