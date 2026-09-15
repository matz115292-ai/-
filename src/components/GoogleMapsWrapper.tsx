// Source: Google Maps Platform Code Assist
import React, { PropsWithChildren, ReactNode } from 'react';
import { APIProvider, useApiLoadingStatus, APILoadingStatus } from '@vis.gl/react-google-maps';
import { MapPin, AlertCircle, Key, ExternalLink } from 'lucide-react';

interface GoogleMapsWrapperProps extends PropsWithChildren {
  apiKey?: string;
  fallbackTitle?: string;
}

const InnerWrapper: React.FC<PropsWithChildren<{ apiKey: string }>> = ({ children, apiKey }) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.LOADED) {
    return <>{children}</>;
  }

  if (status === APILoadingStatus.LOADING || status === APILoadingStatus.NOT_LOADED) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 animate-pulse">
          <MapPin className="w-6 h-6 animate-bounce" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">جاري تحميل خرائط Google...</h4>
        <p className="text-xs text-slate-500">يتم تحميل مكتبة الخرائط التفاعلية ومعلومات المواقع</p>
      </div>
    );
  }

  // APILoadingStatus.FAILED or AUTH_FAILURE
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-amber-900 mb-1">تنبيه ترخيص خرائط Google</h4>
      <p className="text-xs text-amber-800 max-w-md mb-4 leading-relaxed">
        حدث تعذر في التحقق من مفتاح Google Maps API. يرجى التأكد من صلاحية المفتاح وتفعيل Maps JavaScript API في Google Cloud Console.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a
          href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Key className="w-3.5 h-3.5" />
          <span>الحصول على Maps Demo Key تجريبي مجاناً</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({
  apiKey,
  children,
  fallbackTitle = 'خرائط Google التفاعلية',
}) => {
  const activeKey = apiKey || ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  if (!activeKey) {
    return (
      <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 shadow-xs">
          <MapPin className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1.5">{fallbackTitle}</h3>
        <p className="text-xs text-slate-500 max-w-md mb-5 leading-relaxed">
          تم إعداد ميزة خرائط Google بنجاح. لتفعيل العرض التفاعلي الحي، يرجى تعيين مفتاح <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_GOOGLE_MAPS_API_KEY</code> في الإعدادات أو استخدام Maps Demo Key المجاني للتجربة المباشرة.
        </p>

        <div className="bg-white border border-slate-200 rounded-xl p-4 max-w-md w-full text-right mb-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>خطوات تفعيل الخريطة السريعة:</span>
          </h4>
          <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>افتح صفحة Maps Demo Key المجانية من Google.</li>
            <li>سجّل الدخول بحساب Google واضغط لتوليد المفتاح التجريبي.</li>
            <li>أضف المتغير <span className="font-mono text-blue-700">VITE_GOOGLE_MAPS_API_KEY</span> في متغيرات البيئة.</li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Key className="w-4 h-4" />
            <span>إنشاء Maps Demo Key تجريبي</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            <span>Google Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={activeKey} libraries={['places', 'marker']}>
      <InnerWrapper apiKey={activeKey}>{children}</InnerWrapper>
    </APIProvider>
  );
};
