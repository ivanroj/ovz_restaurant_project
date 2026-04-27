import { useState, useEffect, useRef } from 'react';

// ─── Terminal Layout: Zones with coordinates ───
const terminalZones = [
  // Main entrance
  { id: 'entrance', label: 'Главный вход', icon: 'door_front', x: 500, y: 580, w: 120, h: 40, type: 'entrance', color: '#0f3a9f' },
  
  // Registration
  { id: 'reg-a', label: 'Регистрация A (1–10)', icon: 'how_to_reg', x: 180, y: 460, w: 140, h: 50, type: 'registration', color: '#3154b8' },
  { id: 'reg-b', label: 'Регистрация B (11–20)', icon: 'how_to_reg', x: 400, y: 460, w: 140, h: 50, type: 'registration', color: '#3154b8' },
  { id: 'reg-c', label: 'Регистрация C (21–30)', icon: 'how_to_reg', x: 620, y: 460, w: 140, h: 50, type: 'registration', color: '#3154b8' },
  { id: 'self-reg', label: 'Самостоятельная регистрация', icon: 'self_improvement', x: 830, y: 460, w: 130, h: 50, type: 'registration', color: '#3154b8' },

  // Security
  { id: 'security-a', label: 'Безопасность — Терминал A', icon: 'security', x: 200, y: 360, w: 160, h: 40, type: 'security', color: '#693600' },
  { id: 'security-b', label: 'Безопасность — Терминал B', icon: 'security', x: 520, y: 360, w: 160, h: 40, type: 'security', color: '#693600' },
  { id: 'passport', label: 'Паспортный контроль', icon: 'badge', x: 780, y: 360, w: 140, h: 40, type: 'security', color: '#693600' },

  // Terminal A gates (left wing)
  { id: 'gate-a1', label: 'Гейт A1', icon: 'flight_takeoff', x: 60, y: 120, w: 70, h: 50, type: 'gate', color: '#0f3a9f' },
  { id: 'gate-a5', label: 'Гейт A5', icon: 'flight_takeoff', x: 60, y: 190, w: 70, h: 50, type: 'gate', color: '#0f3a9f' },
  { id: 'gate-a9', label: 'Гейт A9', icon: 'flight_takeoff', x: 60, y: 260, w: 70, h: 50, type: 'gate', color: '#0f3a9f' },
  { id: 'gate-a12', label: 'Гейт A12', icon: 'flight_takeoff', x: 160, y: 120, w: 70, h: 50, type: 'gate', color: '#0f3a9f' },

  // Terminal B gates (center-left)
  { id: 'gate-b4', label: 'Гейт B4', icon: 'flight_takeoff', x: 300, y: 120, w: 70, h: 50, type: 'gate', color: '#0453cd' },
  { id: 'gate-b8', label: 'Гейт B8', icon: 'flight_takeoff', x: 300, y: 190, w: 70, h: 50, type: 'gate', color: '#0453cd' },
  { id: 'gate-b12', label: 'Гейт B12', icon: 'flight_takeoff', x: 400, y: 120, w: 70, h: 50, type: 'gate', color: '#0453cd' },

  // Terminal C gates (center-right)
  { id: 'gate-c3', label: 'Гейт C3', icon: 'flight_takeoff', x: 540, y: 120, w: 70, h: 50, type: 'gate', color: '#356ee7' },
  { id: 'gate-c8', label: 'Гейт C8', icon: 'flight_takeoff', x: 540, y: 190, w: 70, h: 50, type: 'gate', color: '#356ee7' },

  // Terminal D gates (right wing)
  { id: 'gate-d2', label: 'Гейт D2', icon: 'flight_takeoff', x: 740, y: 120, w: 70, h: 50, type: 'gate', color: '#153ea3' },
  { id: 'gate-d6', label: 'Гейт D6', icon: 'flight_takeoff', x: 840, y: 120, w: 70, h: 50, type: 'gate', color: '#153ea3' },

  // Facilities
  { id: 'wc-1', label: 'Туалет 1 этаж (A)', icon: 'wc', x: 140, y: 300, w: 60, h: 40, type: 'facility', color: '#434654' },
  { id: 'wc-2', label: 'Туалет 2 этаж (A)', icon: 'wc', x: 340, y: 260, w: 60, h: 40, type: 'facility', color: '#434654' },
  { id: 'wc-b', label: 'Туалет Терминал B', icon: 'wc', x: 540, y: 260, w: 60, h: 40, type: 'facility', color: '#434654' },
  { id: 'wc-acc', label: 'Туалет для маломобильных', icon: 'accessible', x: 740, y: 260, w: 80, h: 40, type: 'facility', color: '#434654' },

  // Services
  { id: 'medical', label: 'Медицинский пункт', icon: 'local_hospital', x: 900, y: 300, w: 90, h: 40, type: 'service', color: '#ba1a1a' },
  { id: 'info', label: 'Информационная стойка', icon: 'info', x: 500, y: 530, w: 100, h: 35, type: 'service', color: '#0f3a9f' },
  { id: 'mother-child', label: 'Комната матери и ребёнка', icon: 'child_care', x: 900, y: 200, w: 90, h: 40, type: 'service', color: '#8b4a00' },

  // Restaurants
  { id: 'rest-skyline', label: 'SkyLine Deli', icon: 'restaurant', x: 260, y: 300, w: 70, h: 40, type: 'restaurant', color: '#693600' },
  { id: 'rest-bistro', label: 'Bistro Jet', icon: 'restaurant', x: 460, y: 300, w: 70, h: 40, type: 'restaurant', color: '#693600' },
  { id: 'rest-terminal', label: 'Terminal Bites', icon: 'restaurant', x: 660, y: 300, w: 80, h: 40, type: 'restaurant', color: '#693600' },

  // Lounges
  { id: 'lounge-a', label: 'Лаунж A (бизнес)', icon: 'airline_seat_flat', x: 160, y: 190, w: 80, h: 40, type: 'lounge', color: '#0f3a9f' },
  { id: 'lounge-b', label: 'Лаунж B (общий)', icon: 'airline_seat_recline_normal', x: 400, y: 190, w: 80, h: 40, type: 'lounge', color: '#0453cd' },

  // Baggage
  { id: 'baggage-1', label: 'Выдача багажа (Ленты 1–4)', icon: 'luggage', x: 250, y: 530, w: 130, h: 40, type: 'baggage', color: '#434654' },
  { id: 'baggage-2', label: 'Выдача багажа (Ленты 5–8)', icon: 'luggage', x: 700, y: 530, w: 130, h: 40, type: 'baggage', color: '#434654' },

  // Parking
  { id: 'parking', label: 'Парковка', icon: 'local_parking', x: 500, y: 630, w: 100, h: 35, type: 'parking', color: '#434654' },
];

// ─── Waypoint graph for pathfinding ───
// Each node connects to nearby nodes forming walkable corridors
const waypointGraph = {
  // Entrance area
  'entrance': ['info', 'baggage-1', 'baggage-2', 'parking'],
  'parking': ['entrance'],
  'info': ['entrance', 'reg-a', 'reg-b', 'reg-c', 'self-reg', 'baggage-1', 'baggage-2'],

  // Registration
  'reg-a': ['info', 'reg-b', 'security-a', 'baggage-1'],
  'reg-b': ['info', 'reg-a', 'reg-c', 'security-a', 'security-b'],
  'reg-c': ['info', 'reg-b', 'self-reg', 'security-b', 'passport'],
  'self-reg': ['info', 'reg-c', 'passport', 'baggage-2'],

  // Baggage
  'baggage-1': ['entrance', 'info', 'reg-a'],
  'baggage-2': ['entrance', 'info', 'self-reg'],

  // Security
  'security-a': ['reg-a', 'reg-b', 'wc-1', 'rest-skyline', 'gate-a1', 'gate-a5', 'gate-a9', 'gate-a12', 'lounge-a', 'wc-2'],
  'security-b': ['reg-b', 'reg-c', 'rest-bistro', 'rest-terminal', 'wc-b', 'gate-b4', 'gate-b8', 'gate-b12', 'gate-c3', 'gate-c8', 'lounge-b'],
  'passport': ['reg-c', 'self-reg', 'gate-d2', 'gate-d6', 'wc-acc', 'medical', 'mother-child'],

  // Facilities
  'wc-1': ['security-a', 'rest-skyline'],
  'wc-2': ['security-a', 'rest-skyline', 'lounge-a'],
  'wc-b': ['security-b', 'rest-bistro'],
  'wc-acc': ['passport', 'medical'],
  'medical': ['passport', 'wc-acc', 'mother-child'],
  'mother-child': ['passport', 'medical'],

  // Restaurants
  'rest-skyline': ['security-a', 'wc-1', 'wc-2'],
  'rest-bistro': ['security-b', 'wc-b', 'rest-terminal'],
  'rest-terminal': ['security-b', 'rest-bistro'],

  // Lounges
  'lounge-a': ['security-a', 'gate-a12', 'wc-2'],
  'lounge-b': ['security-b', 'gate-b12', 'gate-b4'],

  // Gates — Terminal A
  'gate-a1': ['security-a', 'gate-a5', 'gate-a12'],
  'gate-a5': ['security-a', 'gate-a1', 'gate-a9'],
  'gate-a9': ['security-a', 'gate-a5'],
  'gate-a12': ['security-a', 'gate-a1', 'lounge-a'],

  // Gates — Terminal B
  'gate-b4': ['security-b', 'gate-b8', 'lounge-b'],
  'gate-b8': ['security-b', 'gate-b4', 'gate-b12'],
  'gate-b12': ['security-b', 'gate-b8', 'lounge-b'],

  // Gates — Terminal C
  'gate-c3': ['security-b', 'gate-c8'],
  'gate-c8': ['security-b', 'gate-c3'],

  // Gates — Terminal D
  'gate-d2': ['passport', 'gate-d6'],
  'gate-d6': ['passport', 'gate-d2'],
};

// BFS pathfinding
function findPath(startId, endId) {
  if (startId === endId) return [startId];
  const visited = new Set();
  const queue = [[startId]];
  visited.add(startId);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    const neighbors = waypointGraph[current] || [];

    for (const neighbor of neighbors) {
      if (neighbor === endId) return [...path, neighbor];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null; // No path
}

// Get zone center coordinates
function getZoneCenter(zone) {
  return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
}

// Compute route polyline
function computeRoutePoints(pathIds) {
  return pathIds
    .map(id => terminalZones.find(z => z.id === id))
    .filter(Boolean)
    .map(z => getZoneCenter(z));
}

// ─── Type legend labels ───
const typeLabels = {
  gate: 'Гейты',
  registration: 'Регистрация',
  security: 'Контроль',
  facility: 'Удобства',
  service: 'Сервисы',
  restaurant: 'Рестораны',
  lounge: 'Лаунж-зоны',
  baggage: 'Багаж',
  entrance: 'Вход',
  parking: 'Парковка',
};

const typeFilterIcons = {
  gate: 'flight_takeoff',
  registration: 'how_to_reg',
  security: 'security',
  facility: 'wc',
  service: 'info',
  restaurant: 'restaurant',
  lounge: 'airline_seat_flat',
  baggage: 'luggage',
  entrance: 'door_front',
  parking: 'local_parking',
};


export default function TerminalMap({ onSelectLocation, initialFrom, initialTo }) {
  const svgRef = useRef(null);
  const [selectedFrom, setSelectedFrom] = useState(initialFrom || null);
  const [selectedTo, setSelectedTo] = useState(initialTo || null);
  const [routePath, setRoutePath] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [selectionMode, setSelectionMode] = useState('from'); // 'from' | 'to'
  const [activeFilters, setActiveFilters] = useState(new Set(['gate', 'registration', 'security', 'facility', 'service', 'restaurant', 'lounge', 'baggage', 'entrance', 'parking']));
  const [showLegend, setShowLegend] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animRef = useRef(null);

  // Update from parent
  useEffect(() => {
    if (initialFrom) setSelectedFrom(initialFrom);
    if (initialTo) setSelectedTo(initialTo);
  }, [initialFrom, initialTo]);

  // Build route when both are selected
  useEffect(() => {
    if (selectedFrom && selectedTo) {
      const pathIds = findPath(selectedFrom, selectedTo);
      if (pathIds) {
        const points = computeRoutePoints(pathIds);
        setRoutePath(points);

        // Estimate walk time (~1 min per zone transition, ~60m per segment)
        const segments = pathIds.length - 1;
        const distanceM = segments * 60;
        const walkMins = Math.max(1, Math.ceil(segments * 0.8));
        setRouteInfo({
          pathIds,
          segments,
          distance: distanceM,
          walkTime: walkMins,
          fromLabel: terminalZones.find(z => z.id === selectedFrom)?.label,
          toLabel: terminalZones.find(z => z.id === selectedTo)?.label,
        });

        // Animate
        setAnimationProgress(0);
        if (animRef.current) cancelAnimationFrame(animRef.current);
        let start = null;
        const duration = 1500; // 1.5s
        const animate = (ts) => {
          if (!start) start = ts;
          const elapsed = ts - start;
          const progress = Math.min(elapsed / duration, 1);
          setAnimationProgress(progress);
          if (progress < 1) animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRoutePath(null);
        setRouteInfo(null);
      }
    } else {
      setRoutePath(null);
      setRouteInfo(null);
    }

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [selectedFrom, selectedTo]);

  const handleZoneClick = (zone) => {
    if (selectionMode === 'from') {
      setSelectedFrom(zone.id);
      setSelectionMode('to');
    } else {
      if (zone.id !== selectedFrom) {
        setSelectedTo(zone.id);
      }
    }
    if (onSelectLocation) onSelectLocation(zone.label);
  };

  const handleReset = () => {
    setSelectedFrom(null);
    setSelectedTo(null);
    setRoutePath(null);
    setRouteInfo(null);
    setSelectionMode('from');
    setAnimationProgress(0);
  };

  const handleSwap = () => {
    const tmpFrom = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(tmpFrom);
  };

  const toggleFilter = (type) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Generate animated dash offset for route
  const routePathStr = routePath
    ? routePath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  // Total route length for animation
  const totalLength = routePath
    ? routePath.reduce((sum, p, i) => {
        if (i === 0) return 0;
        const prev = routePath[i - 1];
        return sum + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
      }, 0)
    : 0;

  const visibleLength = totalLength * animationProgress;
  const hiddenLength = totalLength - visibleLength;

  // Moving dot position
  const movingDot = routePath && animationProgress > 0 ? (() => {
    const targetDist = totalLength * Math.min(animationProgress, 1);
    let accumulated = 0;
    for (let i = 1; i < routePath.length; i++) {
      const prev = routePath[i - 1];
      const curr = routePath[i];
      const segLen = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
      if (accumulated + segLen >= targetDist) {
        const t = (targetDist - accumulated) / segLen;
        return { x: prev.x + (curr.x - prev.x) * t, y: prev.y + (curr.y - prev.y) * t };
      }
      accumulated += segLen;
    }
    return routePath[routePath.length - 1];
  })() : null;

  return (
    <div className="space-y-6">
      {/* Route Builder Controls */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
        <h3 className="text-xl font-black text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">route</span>
          Построение маршрута
        </h3>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          {/* From */}
          <div className="flex-1">
            <label className="label-sm text-outline mb-1 block">Откуда</label>
            <div
              className={`p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                selectionMode === 'from'
                  ? 'bg-primary text-white shadow-ambient ring-2 ring-primary ring-offset-2'
                  : selectedFrom
                  ? 'bg-primary-fixed text-on-primary-fixed-variant'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
              onClick={() => setSelectionMode('from')}
            >
              <span className="material-symbols-outlined">my_location</span>
              <span className="font-bold text-sm truncate">
                {selectedFrom
                  ? terminalZones.find(z => z.id === selectedFrom)?.label
                  : 'Нажмите на карте'}
              </span>
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            className="self-center p-3 hover:bg-surface-container-high rounded-full transition-all hover:rotate-180 duration-300"
            aria-label="Поменять местами"
          >
            <span className="material-symbols-outlined text-primary">swap_horiz</span>
          </button>

          {/* To */}
          <div className="flex-1">
            <label className="label-sm text-outline mb-1 block">Куда</label>
            <div
              className={`p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                selectionMode === 'to'
                  ? 'bg-tertiary text-white shadow-ambient ring-2 ring-tertiary ring-offset-2'
                  : selectedTo
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
              onClick={() => setSelectionMode('to')}
            >
              <span className="material-symbols-outlined">flag</span>
              <span className="font-bold text-sm truncate">
                {selectedTo
                  ? terminalZones.find(z => z.id === selectedTo)?.label
                  : 'Нажмите на карте'}
              </span>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-4 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-xl hover:bg-surface-variant transition-colors text-sm"
          >
            Сбросить
          </button>
        </div>

        {/* Route Info */}
        {routeInfo && (
          <div className="mt-6 bg-primary-fixed rounded-xl p-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_walk</span>
              <div>
                <p className="text-2xl font-black text-on-primary-fixed">~{routeInfo.walkTime} мин</p>
                <p className="text-xs text-on-primary-fixed-variant">Пешком</p>
              </div>
            </div>
            <div className="w-px h-10 bg-outline-variant/30 hidden md:block" />
            <div>
              <p className="text-lg font-bold text-on-primary-fixed">~{routeInfo.distance} м</p>
              <p className="text-xs text-on-primary-fixed-variant">Расстояние</p>
            </div>
            <div className="w-px h-10 bg-outline-variant/30 hidden md:block" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-medium text-on-primary-fixed-variant">
                {routeInfo.fromLabel}
              </p>
              <div className="flex items-center gap-2 my-1">
                {routeInfo.pathIds.map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === routeInfo.pathIds.length - 1 ? 'bg-tertiary' : 'bg-outline-variant'}`} />
                ))}
              </div>
              <p className="text-sm font-medium text-on-primary-fixed-variant">
                {routeInfo.toLabel}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeLabels).map(([type, label]) => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilters.has(type)
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-high text-on-surface-variant opacity-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{typeFilterIcons[type]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* SVG Map */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient-lg overflow-hidden relative">
        <svg
          ref={svgRef}
          viewBox="0 0 1020 680"
          className="w-full h-auto"
          style={{ minHeight: '400px' }}
        >
          {/* Background */}
          <rect x="0" y="0" width="1020" height="680" fill="#f3f3f6" />

          {/* Terminal building outline */}
          <rect x="40" y="90" width="940" height="440" rx="20" fill="#eeeef0" stroke="#c3c6d6" strokeWidth="2" />

          {/* Terminal wings */}
          {/* Wing A */}
          <rect x="40" y="90" width="220" height="250" rx="12" fill="#e8e8ea" />
          <text x="150" y="112" textAnchor="middle" className="label-sm" fill="#737685" fontSize="10" fontWeight="800">ТЕРМИНАЛ A</text>

          {/* Wing B */}
          <rect x="280" y="90" width="220" height="250" rx="12" fill="#e8e8ea" />
          <text x="390" y="112" textAnchor="middle" className="label-sm" fill="#737685" fontSize="10" fontWeight="800">ТЕРМИНАЛ B</text>

          {/* Wing C */}
          <rect x="520" y="90" width="170" height="200" rx="12" fill="#e8e8ea" />
          <text x="605" y="112" textAnchor="middle" className="label-sm" fill="#737685" fontSize="10" fontWeight="800">ТЕРМИНАЛ C</text>

          {/* Wing D */}
          <rect x="720" y="90" width="230" height="200" rx="12" fill="#e8e8ea" />
          <text x="835" y="112" textAnchor="middle" className="label-sm" fill="#737685" fontSize="10" fontWeight="800">ТЕРМИНАЛ D</text>

          {/* Corridor */}
          <rect x="40" y="340" width="940" height="80" rx="8" fill="#dadadc" opacity="0.5" />
          <text x="510" y="390" textAnchor="middle" fill="#737685" fontSize="9" fontWeight="700">═══════ ГЛАВНЫЙ КОРИДОР ═══════</text>

          {/* Registration area */}
          <rect x="100" y="435" width="850" height="90" rx="12" fill="#dce1ff" opacity="0.3" />
          <text x="510" y="500" textAnchor="middle" fill="#0f3a9f" fontSize="9" fontWeight="700" opacity="0.5">ЗОНА РЕГИСТРАЦИИ</text>

          {/* Arrivals area */}
          <rect x="100" y="515" width="850" height="70" rx="12" fill="#ffdcc3" opacity="0.2" />

          {/* Route path (animated) */}
          {routePath && routePath.length > 1 && (
            <g>
              {/* Route shadow */}
              <path
                d={routePathStr}
                fill="none"
                stroke="rgba(15, 58, 159, 0.15)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Route line - full (background) */}
              <path
                d={routePathStr}
                fill="none"
                stroke="#c3c6d6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
              />
              {/* Route line - animated */}
              <path
                d={routePathStr}
                fill="none"
                stroke="#0f3a9f"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${visibleLength} ${hiddenLength}`}
              />
              {/* Moving dot */}
              {movingDot && (
                <g>
                  <circle cx={movingDot.x} cy={movingDot.y} r="16" fill="#0f3a9f" opacity="0.15">
                    <animate attributeName="r" values="12;20;12" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={movingDot.x} cy={movingDot.y} r="6" fill="#0f3a9f" stroke="white" strokeWidth="2" />
                </g>
              )}
            </g>
          )}

          {/* Zone rectangles */}
          {terminalZones
            .filter(zone => activeFilters.has(zone.type))
            .map((zone) => {
              const isFrom = selectedFrom === zone.id;
              const isTo = selectedTo === zone.id;
              const isOnRoute = routeInfo?.pathIds?.includes(zone.id);
              const isHovered = hoveredZone === zone.id;

              return (
                <g
                  key={zone.id}
                  className="cursor-pointer"
                  onClick={() => handleZoneClick(zone)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  style={{ transition: 'transform 150ms' }}
                >
                  {/* Selection glow */}
                  {(isFrom || isTo) && (
                    <rect
                      x={zone.x - 4}
                      y={zone.y - 4}
                      width={zone.w + 8}
                      height={zone.h + 8}
                      rx="10"
                      fill="none"
                      stroke={isFrom ? '#0f3a9f' : '#693600'}
                      strokeWidth="3"
                      opacity="0.8"
                    >
                      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                    </rect>
                  )}

                  {/* Zone rect */}
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.w}
                    height={zone.h}
                    rx="6"
                    fill={isFrom ? '#0f3a9f' : isTo ? '#693600' : isHovered ? '#dce1ff' : isOnRoute ? '#b5c4ff' : 'white'}
                    stroke={isHovered ? '#0f3a9f' : isOnRoute ? '#3154b8' : '#c3c6d6'}
                    strokeWidth={isHovered || isOnRoute ? 2 : 1}
                    opacity={isFrom || isTo ? 1 : 0.95}
                  />

                  {/* Zone label */}
                  <text
                    x={zone.x + zone.w / 2}
                    y={zone.y + zone.h / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={zone.w < 80 ? '7' : '8'}
                    fontWeight="700"
                    fill={isFrom || isTo ? 'white' : '#1a1c1e'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {zone.label.length > 18 ? zone.label.slice(0, 16) + '…' : zone.label}
                  </text>

                  {/* Start/End markers */}
                  {isFrom && (
                    <g>
                      <circle cx={zone.x + zone.w / 2} cy={zone.y - 12} r="8" fill="#0f3a9f" stroke="white" strokeWidth="2" />
                      <text x={zone.x + zone.w / 2} y={zone.y - 9} textAnchor="middle" fontSize="8" fill="white" fontWeight="900">A</text>
                    </g>
                  )}
                  {isTo && (
                    <g>
                      <circle cx={zone.x + zone.w / 2} cy={zone.y - 12} r="8" fill="#693600" stroke="white" strokeWidth="2" />
                      <text x={zone.x + zone.w / 2} y={zone.y - 9} textAnchor="middle" fontSize="8" fill="white" fontWeight="900">B</text>
                    </g>
                  )}

                  {/* Hover tooltip */}
                  {isHovered && !isFrom && !isTo && (
                    <g>
                      <rect
                        x={zone.x + zone.w / 2 - 70}
                        y={zone.y - 38}
                        width="140"
                        height="26"
                        rx="6"
                        fill="#1a1c1e"
                        opacity="0.9"
                      />
                      <text
                        x={zone.x + zone.w / 2}
                        y={zone.y - 22}
                        textAnchor="middle"
                        fontSize="9"
                        fill="white"
                        fontWeight="600"
                      >
                        {selectionMode === 'from' ? '📍 Указать как старт' : '🏁 Указать как цель'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
        </svg>

        {/* Map instruction overlay */}
        {!selectedFrom && !selectedTo && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full shadow-ambient flex items-center gap-3 border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary">touch_app</span>
            <span className="text-sm font-bold text-on-surface">Нажмите на любую зону, чтобы выбрать начальную точку</span>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="bg-surface-container-low rounded-xl p-4">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant mb-3"
          >
            <span className="material-symbols-outlined text-sm">info</span>
            Легенда карты
          </button>
          <div className="flex flex-wrap gap-4">
            {Object.entries(typeLabels).map(([type, label]) => {
              const zone = terminalZones.find(z => z.type === type);
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: zone?.color || '#737685' }} />
                  <span className="text-xs text-on-surface-variant">{label}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded bg-primary" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #0f3a9f 0, #0f3a9f 4px, transparent 4px, transparent 8px)' }} />
              <span className="text-xs text-on-surface-variant">Маршрут</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
