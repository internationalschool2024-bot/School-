import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  TransportVehicle, 
  TransportStop, 
  Student 
} from '../types';
import { 
  Bus, 
  MapPin, 
  Navigation, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  LocateFixed, 
  Maximize2, 
  Eye, 
  Gauge, 
  Compass,
  CheckCircle,
  Clock,
  Sparkles,
  School
} from 'lucide-react';

interface TransportMapProps {
  vehicle: TransportVehicle;
  selectedStudent?: Student | null;
  onSelectStudentStop?: (studentId: string) => void;
  className?: string;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
}

export const TransportMap: React.FC<TransportMapProps> = ({
  vehicle,
  selectedStudent,
  onSelectStudentStop,
  className = '',
  isSimulating = true,
  onToggleSimulation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around vehicle current location or Damascus center
    const initialLat = vehicle.currentLat || 33.5042;
    const initialLng = vehicle.currentLng || 36.2625;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Tile Layer based on style
    const getTileUrl = (style: 'streets' | 'satellite' | 'terrain') => {
      if (style === 'satellite') {
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layers for stops and markers
    const stopsGroup = L.layerGroup().addTo(map);
    stopsLayerRef.current = stopsGroup;

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const url = mapStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : mapStyle === 'terrain'
      ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTile = L.tileLayer(url, {
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // Update Route Polyline & Stops
  useEffect(() => {
    if (!mapInstanceRef.current || !stopsLayerRef.current) return;

    const map = mapInstanceRef.current;
    const stopsGroup = stopsLayerRef.current;
    stopsGroup.clearLayers();

    // Prepare route coordinates
    const stopCoords: [number, number][] = vehicle.stops.map(s => [s.lat, s.lng]);

    // Draw route line
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    if (stopCoords.length > 1) {
      const polyline = L.polyline(stopCoords, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);
      routePolylineRef.current = polyline;
    }

    // Add Stop Markers
    vehicle.stops.forEach((stop, index) => {
      const isSelected = selectedStudent && stop.studentId === selectedStudent.id;
      const isSchool = stop.type === 'school';
      const isPassed = stop.status === 'passed';
      const isCurrent = stop.status === 'current';

      let bgClass = 'bg-blue-600 text-white';
      if (isSchool) bgClass = 'bg-emerald-600 text-white';
      else if (isPassed) bgClass = 'bg-slate-700 text-slate-100 opacity-90';
      else if (isCurrent) bgClass = 'bg-amber-500 text-white ring-4 ring-amber-300 animate-bounce';
      
      if (isSelected) {
        bgClass = 'bg-rose-600 text-white ring-4 ring-rose-300 scale-125 z-50';
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full ${bgClass} shadow-lg border-2 border-white flex items-center justify-center font-bold text-xs transition-transform transform group-hover:scale-110">
            ${isSchool ? '🏫' : isPassed ? '✓' : index + 1}
          </div>
          <div class="absolute -bottom-6 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap pointer-events-none">
            ${stop.name}
          </div>
        </div>
      `;

      const customDivIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-stop-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customDivIcon }).addTo(stopsGroup);

      marker.on('click', () => {
        if (stop.studentId && onSelectStudentStop) {
          onSelectStudentStop(stop.studentId);
        }
      });

      const popupContent = `
        <div dir="rtl" class="text-right p-1 text-xs">
          <div class="font-bold text-slate-900">${stop.name}</div>
          ${stop.studentName ? `<div class="text-blue-700 font-semibold mt-0.5">الطالب: ${stop.studentName}</div>` : ''}
          <div class="text-slate-500 text-[11px] mt-1">الموعد المقرر: ${stop.time}</div>
          <div class="text-slate-500 text-[10px] mt-0.5">${stop.address || ''}</div>
          <div class="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
            isPassed ? 'bg-slate-100 text-slate-700' : isCurrent ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }">
            ${isPassed ? 'تم المرور والركوب' : isCurrent ? 'المحطة الحالية الآن' : 'في الانتظار'}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
    });

  }, [vehicle, selectedStudent, mapReady]);

  // Update Moving Vehicle Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const lat = vehicle.currentLat;
    const lng = vehicle.currentLng;
    const heading = vehicle.heading || 0;
    const isMoving = vehicle.currentSpeedKmH > 0;

    const vehicleHtml = `
      <div class="relative flex items-center justify-center">
        <!-- Ripple Pulse Wave when moving -->
        ${isMoving ? `
          <div class="absolute w-14 h-14 rounded-full bg-blue-500/25 animate-ping"></div>
          <div class="absolute w-10 h-10 rounded-full bg-blue-500/40 animate-pulse"></div>
        ` : ''}

        <!-- Vehicle Body Marker -->
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl border-2 border-white flex items-center justify-center transition-all duration-500 transform hover:scale-110" style="transform: rotate(${heading}deg);">
          <svg class="w-6 h-6 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path>
            <path d="M15 6v6"></path>
            <path d="M2 12h19.6"></path>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.2 6H4.8C3.8 6 2.9 6.8 2.6 7.8L1.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
            <circle cx="7" cy="18" r="2"></circle>
            <path d="M9 18h5"></path>
            <circle cx="16" cy="18" r="2"></circle>
          </svg>
        </div>

        <!-- Vehicle Badge -->
        <div class="absolute -top-7 px-2.5 py-1 bg-blue-900 text-white text-[10px] font-bold rounded-lg shadow-lg border border-blue-400/50 flex items-center gap-1 whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full ${isMoving ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
          <span>${vehicle.vehicleName}</span>
          <span>•</span>
          <span class="font-mono text-sky-200">${vehicle.currentSpeedKmH} كم/س</span>
        </div>
      </div>
    `;

    const vehicleIcon = L.divIcon({
      html: vehicleHtml,
      className: 'vehicle-live-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (!vehicleMarkerRef.current) {
      const marker = L.marker([lat, lng], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
      vehicleMarkerRef.current = marker;
    } else {
      vehicleMarkerRef.current.setLatLng([lat, lng]);
      vehicleMarkerRef.current.setIcon(vehicleIcon);
    }

  }, [vehicle.currentLat, vehicle.currentLng, vehicle.currentSpeedKmH, vehicle.heading, vehicle.vehicleName]);

  // Recenter helper
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([vehicle.currentLat, vehicle.currentLng], 15, {
      duration: 1.2,
    });
  };

  // Zoom to selected student stop if provided
  const handleZoomToStudent = () => {
    if (!mapInstanceRef.current || !selectedStudent) return;
    const studentStop = vehicle.stops.find(s => s.studentId === selectedStudent.id);
    if (studentStop) {
      mapInstanceRef.current.flyTo([studentStop.lat, studentStop.lng], 16, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 ${className}`}>
      
      {/* 1. Leaflet Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[460px] z-10" 
      />

      {/* 2. Top Floating Telemetry Overlay Bar */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Vehicle Quick Live Info */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-white/15 shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bus className="w-4 h-4" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">{vehicle.vehicleName}</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-300 text-[10px] font-mono border border-blue-400/30">
                {vehicle.plateNumber}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
              <span>{vehicle.currentLocationName}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">{vehicle.status}</span>
            </div>
          </div>
        </div>

        {/* Live Gauges & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Speed & Heading Gauge */}
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl border border-white/15 shadow-xl flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Gauge className="w-4 h-4" />
              <span className="font-mono font-bold">{vehicle.currentSpeedKmH}</span>
              <span className="text-[10px] text-slate-300">كم/س</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-sky-300 text-[11px]">
              <Compass className="w-3.5 h-3.5" />
              <span>{vehicle.heading}°</span>
            </div>
          </div>

          {/* Map Style Switcher */}
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'streets' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              شوارع
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'satellite' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              قمر صناعي
            </button>
          </div>
        </div>

      </div>

      {/* 3. Bottom Floating Action Controls */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Progress along route */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-white/15 shadow-xl max-w-sm w-full">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-200">مسار الرحلة والوصول:</span>
            <span className="text-sky-300 font-bold text-[11px]">{vehicle.progress}% مكتمل</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500" 
              style={{ width: `${vehicle.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{vehicle.estimatedArrivalToSchool || 'وصول متوقع 07:50 ص'}</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {vehicle.stops.filter(s => s.status === 'passed').length} من {vehicle.stops.length} محطات
            </span>
          </div>
        </div>

        {/* Interactive Floating Map Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          
          {selectedStudent && (
            <button
              type="button"
              onClick={handleZoomToStudent}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-xl border border-rose-400/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="تحديد موقع نقطة صعود الطالب"
            >
              <MapPin className="w-4 h-4 text-white" />
              <span>موقع الطالب: {selectedStudent.firstName}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRecenter}
            className="p-2.5 bg-slate-900/90 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold shadow-xl border border-white/15 transition-all cursor-pointer"
            title="إعادة التمركز على موقع الحافلة الحالية"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          {onToggleSimulation && (
            <button
              type="button"
              onClick={onToggleSimulation}
              className={`px-3 py-2 rounded-2xl text-xs font-bold shadow-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSimulating 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/15'
              }`}
              title="تشغيل أو إيقاف المحاكاة الحية لحركة الحافلة"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>توقف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>متابعة حية</span>
                </>
              )}
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
