import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyType, PropertyPurpose, PropertyStatus, Marketer } from '../types';
import { 
  PROPERTY_TYPES, 
  PROPERTY_PURPOSES, 
  COMMON_FEATURES, 
  IMAGE_PRESETS 
} from '../utils/helpers';
import { 
  DEFAULT_CITY, 
  SAUDI_CITIES, 
  JEDDAH_NEIGHBORHOODS, 
  CITY_NEIGHBORHOODS 
} from '../data/locations';
import { 
  X, 
  Check, 
  Image as ImageIcon, 
  Building, 
  Sparkles, 
  UserCheck, 
  Plus, 
  UploadCloud, 
  Video, 
  Film, 
  Trash2, 
  Star, 
  FileVideo,
  Eye,
  MapPin,
  ExternalLink,
  Compass
} from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: Omit<Property, 'id' | 'createdAt'>, editingId?: string) => void;
  propertyToEdit?: Property | null;
  marketers?: Marketer[];
  onQuickAddMarketer?: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  propertyToEdit,
  marketers = [],
  onQuickAddMarketer,
}) => {
  const [title, setTitle] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [type, setType] = useState<PropertyType>('villa');
  const [purpose, setPurpose] = useState<PropertyPurpose>('sale');
  const [price, setPrice] = useState<number | ''>('');
  const [area, setArea] = useState<number | ''>('');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [neighborhood, setNeighborhood] = useState('');
  const [rooms, setRooms] = useState<number | ''>('');
  const [bathrooms, setBathrooms] = useState<number | ''>('');
  const [floor, setFloor] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('available');
  const [features, setFeatures] = useState<string[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [marketerId, setMarketerId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoName, setVideoName] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [description, setDescription] = useState('');
  const [customFeature, setCustomFeature] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (propertyToEdit) {
      setTitle(propertyToEdit.title);
      setReferenceCode(propertyToEdit.referenceCode);
      setType(propertyToEdit.type);
      setPurpose(propertyToEdit.purpose);
      setPrice(propertyToEdit.price);
      setArea(propertyToEdit.area);
      setCity(propertyToEdit.city);
      setNeighborhood(propertyToEdit.neighborhood);
      setRooms(propertyToEdit.rooms ?? '');
      setBathrooms(propertyToEdit.bathrooms ?? '');
      setFloor(propertyToEdit.floor ?? '');
      setStatus(propertyToEdit.status);
      setFeatures(propertyToEdit.features);
      setOwnerName(propertyToEdit.ownerName);
      setOwnerPhone(propertyToEdit.ownerPhone);
      setMarketerId(propertyToEdit.marketerId || '');
      setImageUrl(propertyToEdit.imageUrl);
      setImages(propertyToEdit.images && propertyToEdit.images.length > 0 ? propertyToEdit.images : [propertyToEdit.imageUrl]);
      setVideoUrl(propertyToEdit.videoUrl || '');
      setVideoName(propertyToEdit.videoName || '');
      setGoogleMapsUrl(propertyToEdit.googleMapsUrl || '');
      setDescription(propertyToEdit.description || '');
    } else {
      setTitle('');
      setReferenceCode(`PROP-${Math.floor(100 + Math.random() * 900)}`);
      setType('villa');
      setPurpose('sale');
      setPrice('');
      setArea('');
      setCity(DEFAULT_CITY);
      setNeighborhood('');
      setRooms('');
      setBathrooms('');
      setFloor('');
      setStatus('available');
      setFeatures(['موقف سيارة', 'مطبخ راكب']);
      setOwnerName('');
      setOwnerPhone('+966');
      setMarketerId('');
      setImageUrl(IMAGE_PRESETS[0].url);
      setImages([]);
      setVideoUrl('');
      setVideoName('');
      setGoogleMapsUrl('');
      setDescription('');
    }
  }, [propertyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter(f => Boolean(f?.type && f.type.startsWith('image/')));
    if (fileArray.length === 0) return;

    const promises = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newImages => {
      setImages(prev => {
        const updated = [...prev, ...newImages];
        if (!imageUrl || IMAGE_PRESETS.some(p => p.url === imageUrl)) {
          setImageUrl(newImages[0]);
        }
        return updated;
      });
      setUploadNotice(`تم إرفاق ${newImages.length} صورة بنجاح 📷`);
      setTimeout(() => setUploadNotice(null), 3000);
    });
  };

  const handleVideoFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file?.type || !file.type.startsWith('video/')) {
      alert('يرجى اختيار ملف فيديو صالح (مثل MP4, MOV, WEBM)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('حجم ملف الفيديو كبير جداً (أكثر من 50 ميغابايت)، يرجى اختيار مقطع فيديو أقصر.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoUrl(e.target?.result as string);
      setVideoName(file.name);
      setUploadNotice(`تم إرفاق فيديو: ${file.name} 🎬`);
      setTimeout(() => setUploadNotice(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (imageUrl === prev[indexToRemove]) {
        setImageUrl(next.length > 0 ? next[0] : IMAGE_PRESETS[0].url);
      }
      return next;
    });
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setVideoName('');
  };

  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter(f => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFeature.trim() && !features.includes(customFeature.trim())) {
      setFeatures([...features, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price === '' || area === '' || !neighborhood.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة (العنوان، السعر، المساحة، والحي)');
      return;
    }

    const assignedMarketer = marketers.find(m => m.id === marketerId);
    const finalCoverImage = imageUrl.trim() || (images.length > 0 ? images[0] : IMAGE_PRESETS[0].url);
    const finalImages = images.length > 0 ? images : [finalCoverImage];

    let parsedLat: number | undefined = propertyToEdit?.latitude;
    let parsedLng: number | undefined = propertyToEdit?.longitude;

    if (googleMapsUrl.trim()) {
      const coordMatch = googleMapsUrl.match(/([0-9]{2}\.[0-9]+)[,\s]+([0-9]{2}\.[0-9]+)/);
      if (coordMatch) {
        parsedLat = parseFloat(coordMatch[1]);
        parsedLng = parseFloat(coordMatch[2]);
      }
    }

    onSave(
      {
        title: title.trim(),
        referenceCode: referenceCode.trim() || `PR-${Date.now().toString().slice(-4)}`,
        type,
        purpose,
        price: Number(price),
        area: Number(area),
        city,
        neighborhood: neighborhood.trim(),
        rooms: rooms !== '' ? Number(rooms) : undefined,
        bathrooms: bathrooms !== '' ? Number(bathrooms) : undefined,
        floor: floor.trim() || undefined,
        status,
        features,
        ownerName: ownerName.trim() || 'مالك العقار',
        ownerPhone: ownerPhone.trim() || '+966500000000',
        marketerId: marketerId || undefined,
        marketerName: assignedMarketer ? assignedMarketer.name : undefined,
        imageUrl: finalCoverImage,
        images: finalImages,
        videoUrl: videoUrl || undefined,
        videoName: videoName || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        latitude: parsedLat,
        longitude: parsedLng,
        description: description.trim(),
      },
      propertyToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                {propertyToEdit ? 'تعديل بيانات العقار' : 'تسجيل عقار جديد في النظام'}
              </h2>
              <p className="text-[11px] text-slate-400">أدخل كافة المواصفات والأسعار والموقع بدقة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[80vh] overflow-y-auto space-y-5 text-right">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              المعلومات الأساسية ونوع العقار
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان العقار التسويقي *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: فيلا مودرن فاخرة مع مسبح ومصعد"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  كود العقار / المرجع
                </label>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="VR-101"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الغرض من العقار *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_PURPOSES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPurpose(p.value)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        purpose === p.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع العقار *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`p-2 text-center rounded-lg border text-xs font-medium transition-all ${
                        type === t.value
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Location and Price */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              الموقع، السعر، والمساحة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المدينة *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
                >
                  {SAUDI_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    الحي *
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400">
                    {city === 'جدة' ? 'اختر من أحياء جدة' : `أحياء ${city}`}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  list="property-neighborhoods-list"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder={city === 'جدة' ? 'مثال: حي الشاطئ، الروضة، أبحر الشمالية' : 'اسم الحي'}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <datalist id="property-neighborhoods-list">
                  {(CITY_NEIGHBORHOODS[city] || JEDDAH_NEIGHBORHOODS).map((nh) => (
                    <option key={nh} value={nh} />
                  ))}
                </datalist>
                {/* Popular neighborhood quick chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(CITY_NEIGHBORHOODS[city] || JEDDAH_NEIGHBORHOODS).slice(0, 6).map((quickNh) => (
                    <button
                      key={quickNh}
                      type="button"
                      onClick={() => setNeighborhood(quickNh)}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                        neighborhood === quickNh
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title={`اختيار ${quickNh}`}
                    >
                      {quickNh.replace('حي ', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  السعر المطلوب (ريال) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="2500000"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المساحة (م²) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={area}
                  onChange={(e) => setArea(e.target.value ? Number(e.target.value) : '')}
                  placeholder="450"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Google Maps Location - Optional */}
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>موقع العقار على خرائط Google (اختياري)</span>
                  <span className="text-[10px] text-slate-400 font-normal font-sans">(رابط أو إحداثيات GPS)</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const url = `https://maps.google.com/?q=${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
                            setGoogleMapsUrl(url);
                            alert('تم تحديد موقعك الحالي بنجاح عبر GPS وحفظ الرابط!');
                          },
                          (err) => {
                            alert('تعذر قراءة الموقع الجغرافي: ' + err.message);
                          }
                        );
                      } else {
                        alert('خاصية تحديد الموقع غير مدعومة');
                      }
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span>تحديد موقعي الحالي GPS</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city + ' ' + (neighborhood || ''))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>فتح خرائط قوقل للبحث</span>
                  </a>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... أو إحداثيات 24.7136, 46.6753"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  dir="ltr"
                />
                {googleMapsUrl && googleMapsUrl.trim() && (
                  <a
                    href={typeof googleMapsUrl === 'string' && googleMapsUrl.startsWith('http') ? googleMapsUrl : `https://maps.google.com/?q=${encodeURIComponent(googleMapsUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>معاينة</span>
                  </a>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                يمكنك لصق رابط المشاركة من خرائط قوقل أو الضغط على فتح الخرائط لاختيار الموقع ونسخ رابطه.
              </p>
            </div>
          </div>

          {/* Section 3: Specs and Features */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              مواصفات العقار والمميزات
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عدد الغرف
                </label>
                <input
                  type="number"
                  min="0"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value ? Number(e.target.value) : '')}
                  placeholder="5"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عدد دورات المياه
                </label>
                <input
                  type="number"
                  min="0"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : '')}
                  placeholder="4"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الدور / الطابق
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="مثال: دور أرضي، الدور الثاني"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Features Tags */}
            <div className="mb-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                المميزات والخدمات المتوفرة
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_FEATURES.map((feature) => {
                  const isSelected = features.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{feature}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  placeholder="إضافة ميزة أخرى مخصصة..."
                  className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg flex-1 outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomFeature}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Owner and Marketer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                بيانات المسوق العقاري والمالك وحالة العرض
              </h3>
              {onQuickAddMarketer && (
                <button
                  type="button"
                  onClick={onQuickAddMarketer}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة مسوق جديد</span>
                </button>
              )}
            </div>

            {/* Marketer Assignment Row */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 mb-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>المسوق العقاري المسؤول عن هذا العرض</span>
                <span className="text-[10px] text-slate-400 font-normal">(اختياري - لتوزيع المهام ومتابعة الصفقات)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <select
                    id="select-property-marketer"
                    value={marketerId}
                    onChange={(e) => setMarketerId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-white"
                  >
                    <option value="">بدون تعيين مسوق محدد (مباشر للمكتب)</option>
                    {marketers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.licenseNumber ? `(فال: ${m.licenseNumber})` : ''} {m.status === 'inactive' ? '- غير نشط' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {marketerId && (
                  <div className="text-[11px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">الجوال:</span>
                    <span className="font-mono text-slate-800 dark:text-white font-medium" dir="ltr">
                      {marketers.find(m => m.id === marketerId)?.phone || ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المالك أو الوكيل
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="أبو راشد التميمي"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  رقم جوال المالك
                </label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="+966501234567"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  حالة العقار
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
                >
                  <option value="available">متاح للعرض</option>
                  <option value="reserved">محجوز مؤقتاً</option>
                  <option value="sold">تم البيع</option>
                  <option value="rented">تم التأجير</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Media Attachments (Images and Video Direct Uploads - Without Links) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                وسائط العقار (إرفاق صور وفيديو من جهازك مباشرة دون روابط)
              </h3>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>أو اختر صور نموذجية جاهزة</span>
              </button>
            </div>

            {uploadNotice && (
              <div className="mb-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">{uploadNotice}</span>
              </div>
            )}

            {showPresets && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg mb-3">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  اختر من الصور النموذجية الجاهزة كصورة رئيسية سريعة:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {IMAGE_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setImageUrl(preset.url);
                        if (!images.includes(preset.url)) {
                          setImages(prev => [preset.url, ...prev]);
                        }
                        setShowPresets(false);
                      }}
                      className="cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all group"
                    >
                      <img src={preset.url} alt={preset.label} className="h-16 w-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="block text-[11px] text-center py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {preset.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Image Upload Zone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>إرفاق صور العقار *</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({images.length > 0 ? `${images.length} صور مضافة` : 'مطلوب صورة واحدة على الأقل'})
                    </span>
                  </label>
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة المزيد من الصور</span>
                    </button>
                  )}
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageFiles(e.target.files)}
                  className="hidden"
                />

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(false);
                    handleImageFiles(e.dataTransfer.files);
                  }}
                  onClick={() => imageInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDraggingImage
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[0.99]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white">
                      اضغط لاختيار الصور من جهازك أو اسحبها وأفلتها هنا
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      يمكنك اختيار عدة صور في وقت واحد (PNG, JPG, WEBP) بدون أي روابط
                    </div>
                  </div>
                </div>

                {/* Preview Grid for Attached Images */}
                {images.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                      الصور المرفقة (اضغط على أي صورة لجعلها صورة الغلاف الرئيسية):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {images.map((img, idx) => {
                        const isPrimary = imageUrl === img;
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-lg overflow-hidden border transition-all group bg-slate-100 dark:bg-slate-800 ${
                              isPrimary
                                ? 'border-blue-600 ring-2 ring-blue-500/30'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`صورة ${idx + 1}`}
                              className="w-full h-20 object-cover cursor-pointer"
                              onClick={() => setImageUrl(img)}
                            />

                            {/* Badges / Controls */}
                            {isPrimary ? (
                              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>الغلاف</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setImageUrl(img)}
                                className="absolute top-1 right-1 bg-black/60 hover:bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                تعيين كغلاف
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-1 left-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded transition-colors"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Upload Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>إرفاق فيديو العقار / الجولة المرئية</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (اختياري - ملف فيديو مباشر من جهازك دون روابط)
                  </span>
                </label>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoFile(e.target.files)}
                  className="hidden"
                />

                {!videoUrl ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(true);
                    }}
                    onDragLeave={() => setIsDraggingVideo(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(false);
                      handleVideoFile(e.dataTransfer.files);
                    }}
                    onClick={() => videoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDraggingVideo
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 scale-[0.99]'
                        : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        اضغط لاختيار فيديو من جهازك أو اسحبه وأفلته هنا
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        يدعم ملفات الفيديو (MP4, MOV, WEBM) لجولة مرئية احترافية
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                          <Film className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100">
                            {videoName || 'فيديو جولة العقار'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            تم الإرفاق بنجاح ومتاح للمعاينة
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        >
                          تغيير الفيديو
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="حذف الفيديو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <video
                      src={videoUrl}
                      controls
                      className="w-full max-h-48 rounded-lg bg-black object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الوصف وملاحظات العرض
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب وصفاً يشمل تفاصيل الواجهات، التشطيبات، والضمانات..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              id="btn-save-property-modal"
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {propertyToEdit ? 'حفظ التعديلات' : 'تسجيل العقار الآن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
