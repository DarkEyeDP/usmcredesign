import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '@/app/features/theme/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapMarker = {
  mha: string;
  name: string;
  lat: number;
  lng: number;
  rate: number;
  isSelected: boolean;
  isCurrentLocation?: boolean;
};

type Props = {
  markers: MapMarker[];
  minRate: number;
  maxRate: number;
  onSelect: (mha: string) => void;
};

// Low → mid → high: blue (#3b82f6) → lime (#a3e635) → green (#4ade80)
function rateColor(rate: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (rate - min) / (max - min);
  if (t < 0.5) {
    const s = t * 2;
    const r = Math.round(59  + s * (163 - 59));
    const g = Math.round(130 + s * (230 - 130));
    const b = Math.round(246 + s * (53  - 246));
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.5) * 2;
    const r = Math.round(163 + s * (74  - 163));
    const g = Math.round(230 + s * (222 - 230));
    const b = Math.round(53  + s * (128 - 53));
    return `rgb(${r},${g},${b})`;
  }
}

function buildIcon(m: MapMarker, minRate: number, maxRate: number): L.DivIcon {
  if (m.isCurrentLocation) {
    const html = `<svg width="26" height="26" viewBox="-13 -13 26 26" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;display:block">
      <circle r="10" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2" stroke-dasharray="4 3"/>
      <circle r="4" fill="#60a5fa" opacity="0.9"/>
    </svg>`;
    return L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });
  }

  const color = m.isSelected ? '#4ade80' : rateColor(m.rate, minRate, maxRate);
  const r = m.isSelected ? 7 : 5.5;
  const glow = m.isSelected ? `filter:drop-shadow(0 0 8px rgba(74,222,128,0.8))` : '';
  const stroke = m.isSelected ? '#ffffff' : '#000';
  const strokeW = m.isSelected ? 1.5 : 1;
  const size = (r + 6) * 2;
  const half = size / 2;
  const html = `<svg width="${size}" height="${size}" viewBox="${-half} ${-half} ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;display:block">
    ${m.isSelected ? `<circle r="${r + 5}" fill="${color}" opacity="0.2"/>` : ''}
    <circle r="${r}" fill="${color}" stroke="${stroke}" stroke-width="${strokeW}" style="${glow}"/>
  </svg>`;
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [half, half] });
}

// Quadratic bezier arc curving northward between two lat/lng points
function arcPoints(from: [number, number], to: [number, number], n = 60): L.LatLngExpression[] {
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  const dist = Math.sqrt((to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2);
  const bulge = Math.min(dist * 0.28, 9);
  const ctrlLat = midLat + bulge;
  const ctrlLng = midLng;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const mt = 1 - t;
    return [
      mt * mt * from[0] + 2 * mt * t * ctrlLat + t * t * to[0],
      mt * mt * from[1] + 2 * mt * t * ctrlLng + t * t * to[1],
    ] as L.LatLngExpression;
  });
}

export function BAHMap({ markers, minRate, maxRate, onSelect }: Props) {
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);
  const arcRef = useRef<L.Polyline | null>(null);
  const prevSelectedMha = useRef<string | null>(null);
  const prevCurrentMha = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  // eslint-disable-next-line react-hooks/refs
  onSelectRef.current = onSelect;

  const [hovered, setHovered] = useState<MapMarker | null>(null);
  const [scrollHint, setScrollHint] = useState(false);
  const scrollHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showScrollHint = useCallback(() => {
    setScrollHint(true);
    if (scrollHintTimer.current) clearTimeout(scrollHintTimer.current);
    scrollHintTimer.current = setTimeout(() => setScrollHint(false), 1800);
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // Scroll zoom only when Ctrl or Cmd is held; otherwise let the page scroll
    const container = containerRef.current;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        map.setZoom(map.getZoom() + delta);
      } else {
        showScrollHint();
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    const cleanup = () => container.removeEventListener('wheel', onWheel);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    return () => {
      cleanup();
      if (scrollHintTimer.current) clearTimeout(scrollHintTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, [showScrollHint]);

  // Sync markers and arc whenever they change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    leafletMarkersRef.current.forEach((lm) => map.removeLayer(lm));
    leafletMarkersRef.current = [];

    // Remove old arc
    if (arcRef.current) {
      map.removeLayer(arcRef.current);
      arcRef.current = null;
    }

    // Selected renders on top; current location below selected but above others
    const sorted = [...markers].sort((a, b) => {
      const rank = (m: MapMarker) => (m.isSelected ? 2 : m.isCurrentLocation ? 1 : 0);
      return rank(a) - rank(b);
    });

    sorted.forEach((m) => {
      const icon = buildIcon(m, minRate, maxRate);
      const lm = L.marker([m.lat, m.lng], {
        icon,
        zIndexOffset: m.isSelected ? 500 : m.isCurrentLocation ? 300 : 0,
      });

      lm.on('click', () => onSelectRef.current(m.mha));
      lm.on('mouseover', () => setHovered(m));
      lm.on('mouseout', () => setHovered(null));

      lm.addTo(map);
      leafletMarkersRef.current.push(lm);
    });

    // Draw dashed arc between current location and selected destination
    const current = markers.find((m) => m.isCurrentLocation);
    const selected = markers.find((m) => m.isSelected);

    if (current && selected && current.mha !== selected.mha) {
      const pts = arcPoints([current.lat, current.lng], [selected.lat, selected.lng]);
      arcRef.current = L.polyline(pts, {
        color: '#60a5fa',
        weight: 1.5,
        opacity: 0.55,
        dashArray: '7 5',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // Fly logic: fit both in view when arc is active, otherwise fly to selected
    const currentKey = current?.mha ?? null;
    const selectedKey = selected?.mha ?? null;
    const currentChanged = currentKey !== prevCurrentMha.current;
    const selectedChanged = selectedKey !== prevSelectedMha.current;

    if (currentChanged || selectedChanged) {
      prevCurrentMha.current = currentKey;
      prevSelectedMha.current = selectedKey;

      if (current && selected && current.mha !== selected.mha) {
        const bounds = L.latLngBounds(
          [current.lat, current.lng],
          [selected.lat, selected.lng],
        );
        map.flyToBounds(bounds.pad(0.25), { duration: 1.5, maxZoom: 10 });
      } else if (selected) {
        map.flyTo([selected.lat, selected.lng], 8, { duration: 1.2 });
      }
    }
  }, [markers, minRate, maxRate]);

  const currentMarker = markers.find((m) => m.isCurrentLocation);
  const selectedMarker = markers.find((m) => m.isSelected);
  const hasArc = !!(currentMarker && selectedMarker && currentMarker.mha !== selectedMarker.mha);

  return (
    <div
      className="relative w-full min-w-0 select-none overflow-hidden"
      style={{ height: '480px', background: '#05080c', isolation: 'isolate' }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-10 left-4 right-16 z-[1000]">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-gray-500">
          {hasArc && (
            <span className="flex items-center gap-1.5">
              <svg width="22" height="6" viewBox="0 0 22 6">
                <line x1="0" y1="3" x2="22" y2="3" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" />
              </svg>
              ROUTE
            </span>
          )}
          {hasArc && (
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="-6 -6 12 12">
                <circle r="5" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle r="2" fill="#60a5fa" />
              </svg>
              CURRENT
            </span>
          )}
          <span className="ml-auto">LOWER</span>
          <div
            className="h-1 w-16 rounded-sm"
            style={{ background: 'linear-gradient(to right, #3b82f6, #a3e635, #4ade80)' }}
          />
          <span>HIGHER</span>
        </div>
      </div>

      {/* Ctrl+scroll hint */}
      {scrollHint && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] border border-white/20 bg-black/85 px-4 py-2 text-[10px] font-bold tracking-widest text-gray-400 backdrop-blur-sm">
          CTRL + SCROLL TO ZOOM
        </div>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 border border-white/20 bg-black/90 px-4 py-3 shadow-xl backdrop-blur-sm">
          <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-white">
            {hovered.isCurrentLocation && (
              <span className="text-[9px] font-bold tracking-widest text-blue-400 border border-blue-400/40 px-1 py-0.5">CURRENT</span>
            )}
            {hovered.name}
          </div>
          <div className={`text-xl font-black ${isDesert ? 'text-green-700' : 'text-green-400'}`}>
            ${hovered.rate.toLocaleString()}{' '}
            <span className="text-sm font-bold text-green-600">/mo</span>
          </div>
        </div>
      )}
    </div>
  );
}
