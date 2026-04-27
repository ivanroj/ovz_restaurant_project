import { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TerminalMap from '../components/passenger/TerminalMap';
import LiveFlightBoard from '../components/ui/LiveFlightBoard';

// ─── Airport Locations (presets for dropdowns) ───
const airportLocations = [
  { group: 'Гейты', items: [
    'Гейт A1', 'Гейт A5', 'Гейт A9', 'Гейт A12',
    'Гейт B4', 'Гейт B8', 'Гейт B12',
    'Гейт C3', 'Гейт C8',
    'Гейт D2', 'Гейт D6',
  ]},
  { group: 'Зоны регистрации', items: [
    'Стойки регистрации 1–10 (Терминал A)',
    'Стойки регистрации 11–20 (Терминал B)',
    'Стойки регистрации 21–30 (Терминал C)',
    'Стойки самостоятельной регистрации',
  ]},
  { group: 'Зоны контроля', items: [
    'Зона безопасности — Терминал A',
    'Зона безопасности — Терминал B',
    'Паспортный контроль (вылет)',
    'Паспортный контроль (прилёт)',
  ]},
  { group: 'Зоны прилёта / вылета', items: [
    'Зона прилёта — Терминал A',
    'Зона прилёта — Терминал B',
    'Зона прилёта — Терминал D',
    'Зона высадки 1',
    'Зона высадки 2',
    'Зона высадки 3',
    'Зона высадки 4',
  ]},
  { group: 'Удобства', items: [
    'Туалет — 1 этаж (Терминал A)',
    'Туалет — 2 этаж (Терминал A)',
    'Туалет — Терминал B',
    'Туалет для маломобильных — 1 этаж',
    'Комната матери и ребёнка',
    'Медицинский пункт',
  ]},
  { group: 'Прочее', items: [
    'Зона выдачи багажа — Лента 1–4',
    'Зона выдачи багажа — Лента 5–8',
    'Лаунж A (бизнес)',
    'Лаунж B (общий)',
    'Информационная стойка',
    'Парковка — Уровень 1',
    'Парковка — Уровень 2',
    'Вход — Главный',
  ]},
];

// Flatten for quick filtering
const allLocations = airportLocations.flatMap(g => g.items);

// ─── Additional Info presets ───
const additionalInfoPresets = [
  { icon: 'visibility_off', label: 'Слабое зрение / Незрячий', value: 'Слабое зрение / Незрячий пассажир' },
  { icon: 'hearing_disabled', label: 'Слабый слух / Глухой', value: 'Нарушение слуха / Глухой пассажир' },
  { icon: 'accessible', label: 'Ограниченная мобильность', value: 'Ограниченная мобильность, необходимо кресло-коляска' },
  { icon: 'elderly', label: 'Пожилой пассажир', value: 'Пожилой пассажир, нужна помощь при передвижении' },
  { icon: 'child_care', label: 'С ребёнком / коляской', value: 'Пассажир с ребёнком / детской коляской' },
  { icon: 'pets', label: 'Собака-проводник', value: 'Пассажир с собакой-проводником' },
  { icon: 'translate', label: 'Языковой барьер', value: 'Языковой барьер, требуется переводчик' },
  { icon: 'psychology', label: 'Когнитивные особенности', value: 'Когнитивные особенности, нужна простая навигация' },
];

// ─── Zone Cards ───
const getZones = (t) => [
  { icon: 'how_to_reg', label: t('passenger.zones.registration'), targetId: 'section-forms', location: 'Стойки регистрации 1–10 (Терминал A)', description: t('passenger.zones.registrationDesc') },
  { icon: 'security', label: t('passenger.zones.security'), targetId: 'section-forms', location: 'Зона безопасности — Терминал A', description: t('passenger.zones.securityDesc') },
  { icon: 'flight_takeoff', label: t('passenger.zones.gates'), targetId: 'section-forms', location: 'Гейт A12', description: t('passenger.zones.gatesDesc') },
  { icon: 'wc', label: t('passenger.zones.wc'), targetId: 'section-forms', location: 'Туалет для маломобильных — 1 этаж', description: t('passenger.zones.wcDesc') },
];

// ─── Location Picker Component ───
function LocationPicker({ id, value, onChange, placeholder = 'Выберите или введите...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef(null);

  const handleSelect = (loc) => {
    onChange(loc);
    setIsOpen(false);
    setFilter('');
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setFilter(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const filteredGroups = airportLocations
    .map(g => ({
      ...g,
      items: g.items.filter(item =>
        item.toLowerCase().includes((filter || value || '').toLowerCase())
      )
    }))
    .filter(g => g.items.length > 0);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            id={id}
            className="w-full p-5 text-lg bg-surface-container-low border-none rounded-lg focus:ring-4 focus:ring-tertiary pr-12"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            autoComplete="off"
            required
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
            aria-label="Показать список зон"
          >
            <span className="material-symbols-outlined" style={{ transition: 'transform 200ms', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-ambient-lg max-h-72 overflow-y-auto border border-outline-variant/20"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-outline mb-1 block">search_off</span>
              <p className="text-sm">Ничего не найдено. Введите вручную.</p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.group}>
                <div className="px-4 py-2 bg-surface-container-high">
                  <span className="label-sm text-outline">{group.group}</span>
                </div>
                {group.items.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={`w-full text-left px-6 py-3 text-sm hover:bg-primary-fixed transition-colors flex items-center gap-3 ${value === item ? 'bg-primary-fixed text-on-primary-fixed-variant font-bold' : 'text-on-surface'}`}
                    onClick={() => handleSelect(item)}
                  >
                    <span className="material-symbols-outlined text-base text-outline">location_on</span>
                    {item}
                    {value === item && <span className="material-symbols-outlined text-primary ml-auto text-sm">check</span>}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setFilter(''); }} />
      )}
    </div>
  );
}

// ─── Additional Info Picker Component ───
function AdditionalInfoPicker({ id, value, onChange }) {
  const [showPresets, setShowPresets] = useState(false);

  const togglePreset = (presetValue) => {
    // If already contains this preset, don't add again
    if (value.includes(presetValue)) {
      const newVal = value.replace(presetValue, '').replace(/\n{2,}/g, '\n').trim();
      onChange(newVal);
    } else {
      const newVal = value ? value + '\n' + presetValue : presetValue;
      onChange(newVal);
    }
  };

  return (
    <div>
      {/* Quick presets */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-base">{showPresets ? 'expand_less' : 'add_circle'}</span>
          {showPresets ? 'Скрыть подсказки' : 'Выбрать из списка'}
        </button>
      </div>

      {showPresets && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {additionalInfoPresets.map((preset) => {
            const isActive = value.includes(preset.value);
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => togglePreset(preset.value)}
                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-lg" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {preset.icon}
                </span>
                <span className="font-medium">{preset.label}</span>
                {isActive && (
                  <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Free text */}
      <textarea
        id={id}
        className="w-full p-5 text-lg bg-surface-container-low border-none rounded-lg focus:ring-4 focus:ring-tertiary"
        placeholder="Или опишите особенности своими словами..."
        rows="3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}


export default function PassengerPage() {
  const { flights, restaurants, addRequest, addFoodOrder, addSOSAlert } = useStore();
  const { t } = useTranslation();
  const [wheelchairForm, setWheelchairForm] = useState({ location: '', type: 'manual', notes: '' });
  const [escortForm, setEscortForm] = useState({ location: '', notes: '' });
  const [showMenu, setShowMenu] = useState(null);
  const [cart, setCart] = useState([]);
  const [foodGate, setFoodGate] = useState('');
  const [sosModal, setSosModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeZone, setActiveZone] = useState(null);
  const [zoneModal, setZoneModal] = useState(null);
  const [mapRouteFrom, setMapRouteFrom] = useState(null);
  const [mapRouteTo, setMapRouteTo] = useState(null);

  const formsRef = useRef(null);
  const mapRef = useRef(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleZoneClick = (zone) => {
    setActiveZone(zone.label);
    setZoneModal(zone);
  };

  const handleZoneAction = (zone, action) => {
    setZoneModal(null);
    if (action === 'wheelchair') {
      setWheelchairForm({ ...wheelchairForm, location: zone.location });
      setTimeout(() => {
        formsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (action === 'escort') {
      setEscortForm({ ...escortForm, location: zone.location });
      setTimeout(() => {
        formsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (action === 'navigate') {
      // Map zone labels to TerminalMap zone IDs
      const zoneIdMap = {
        'РЕГИСТРАЦИЯ': 'reg-a',
        'БЕЗОПАСНОСТЬ': 'security-a',
        'ВЫХОД': 'gate-a12',
        'ТУАЛЕТЫ': 'wc-1',
      };
      setMapRouteFrom('entrance');
      setMapRouteTo(zoneIdMap[zone.label] || 'entrance');
      setTimeout(() => {
        mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleWheelchair = (e) => {
    e.preventDefault();
    addRequest({
      type: 'wheelchair',
      typeLabel: 'Инвалидное кресло',
      location: wheelchairForm.location,
      notes: [
        wheelchairForm.type === 'electric' ? 'Электрическое кресло' : 'Механическое кресло',
        wheelchairForm.notes,
      ].filter(Boolean).join('. '),
      priority: 'A',
    });
    setWheelchairForm({ location: '', type: 'manual', notes: '' });
    showSuccess('✅ Запрос на кресло отправлен! Ожидайте сотрудника.');
  };

  const handleEscort = (e) => {
    e.preventDefault();
    addRequest({
      type: 'escort',
      typeLabel: 'Сопровождение',
      location: escortForm.location,
      notes: escortForm.notes,
      priority: 'B',
    });
    setEscortForm({ location: '', notes: '' });
    showSuccess('✅ Запрос на сопровождение отправлен!');
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const handleFoodOrder = () => {
    if (cart.length === 0 || !foodGate) return;
    addFoodOrder({
      restaurant: showMenu.name,
      items: cart,
      gate: foodGate,
    });
    setCart([]);
    setFoodGate('');
    setShowMenu(null);
    showSuccess('✅ Заказ питания оформлен! Доставка в течение 20 минут.');
  };

  const handleSOS = () => {
    addSOSAlert({ location: 'Терминал — местоположение не определено', message: 'Экстренный вызов помощи' });
    setSosModal(false);
    showSuccess('🚨 SOS-вызов отправлен! Помощь уже в пути.');
  };

  return (
    <PageLayout>
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-surface-container-lowest shadow-ambient-lg rounded-2xl px-8 py-4 text-lg font-bold text-on-surface border border-outline-variant/20 animate-pulse">
          {successMsg}
        </div>
      )}

      <div className="px-4 md:px-12 py-8 max-w-7xl mx-auto w-full">
        {/* Page Title */}
        <section className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-primary mb-4 tracking-tight">
            {t('nav.passenger')}
          </h1>
          <p className="text-2xl text-on-surface-variant font-medium">
            {t('passenger.greeting')}
          </p>
        </section>

        {/* Zone Navigation Cards */}
        <section aria-label="Навигация по аэропорту" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          {getZones(t).map((zone) => (
            <button
              key={zone.label}
              onClick={() => handleZoneClick(zone)}
              className={`group flex flex-col items-center justify-center p-6 md:p-8 rounded-xl shadow-ambient border-4 transition-all h-40 md:h-64 active:scale-95 ${
                activeZone === zone.label
                  ? 'bg-primary text-white border-tertiary scale-[1.02]'
                  : 'bg-primary-container text-on-primary-container border-transparent hover:border-tertiary'
              }`}
            >
              <span className="material-symbols-outlined mb-3 md:mb-4" style={{ fontSize: '2.5rem' }}>
                {zone.icon}
              </span>
              <span className="text-lg md:text-2xl font-bold uppercase tracking-wide text-center">
                {zone.label}
              </span>
              <span className={`text-xs mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${activeZone === zone.label ? 'opacity-100' : ''}`}>
                {t('passenger.clickHelp')}
              </span>
            </button>
          ))}
        </section>

        {/* Terminal Map */}
        <section ref={mapRef} aria-label="Карта терминала" className="mb-16 bg-surface-container-low rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">map</span>
            {t('passenger.mapTitle')}
          </h2>
          <TerminalMap
            initialFrom={mapRouteFrom}
            initialTo={mapRouteTo}
            onSelectLocation={(label) => {
              // Optionally auto-fill forms when clicking zones on the map
            }}
          />
        </section>

        {/* Flight Board */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">flight</span>
            {t('passenger.flightBoardTitle')}
          </h2>
          <LiveFlightBoard isDispatcher={false} />
        </section>

        {/* Forms Section */}
        <div ref={formsRef} id="section-forms" className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Wheelchair Form */}
          <section aria-labelledby="wheelchair-title" className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-ambient border-l-8 border-primary">
            <h2 id="wheelchair-title" className="text-3xl md:text-4xl font-black text-primary mb-8 flex items-center gap-4">
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>accessible</span>
              Заказать кресло
            </h2>
            <form onSubmit={handleWheelchair} className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-3 text-on-surface" htmlFor="wc-location">
                  Текущее местоположение / Гейт
                </label>
                <LocationPicker
                  id="wc-location"
                  value={wheelchairForm.location}
                  onChange={(val) => setWheelchairForm({ ...wheelchairForm, location: val })}
                  placeholder="Выберите зону или введите вручную..."
                />
              </div>
              <div>
                <label className="block text-lg font-bold mb-4 text-on-surface">Тип помощи</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'manual', label: 'Механическое кресло', icon: 'accessible' },
                    { value: 'electric', label: 'Электрическое кресло', icon: 'electric_moped' },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-4 p-5 rounded-lg cursor-pointer transition-all ${wheelchairForm.type === opt.value ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-primary-container/30'}`}>
                      <input
                        type="radio"
                        name="assist"
                        value={opt.value}
                        checked={wheelchairForm.type === opt.value}
                        onChange={(e) => setWheelchairForm({ ...wheelchairForm, type: e.target.value })}
                        className="w-6 h-6 text-primary focus:ring-tertiary"
                      />
                      <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                      <span className="text-xl font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-lg font-bold mb-3 text-on-surface">
                  Дополнительная информация
                </label>
                <AdditionalInfoPicker
                  id="wc-notes"
                  value={wheelchairForm.notes}
                  onChange={(val) => setWheelchairForm({ ...wheelchairForm, notes: val })}
                />
              </div>
              <Button type="submit" variant="primary" size="xl" className="w-full">
                ЗАПРОСИТЬ
              </Button>
            </form>
          </section>

          {/* Escort Form */}
          <section aria-labelledby="escort-title" className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-ambient border-l-8 border-secondary">
            <h2 id="escort-title" className="text-3xl md:text-4xl font-black text-secondary mb-8 flex items-center gap-4">
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>supervisor_account</span>
              Вызвать сопровождающего
            </h2>
            <form onSubmit={handleEscort} className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-3 text-on-surface" htmlFor="esc-location">
                  Ваше местоположение
                </label>
                <LocationPicker
                  id="esc-location"
                  value={escortForm.location}
                  onChange={(val) => setEscortForm({ ...escortForm, location: val })}
                  placeholder="Выберите зону или введите вручную..."
                />
              </div>
              <div>
                <label className="block text-lg font-bold mb-3 text-on-surface" htmlFor="esc-notes">
                  Дополнительная информация
                </label>
                <AdditionalInfoPicker
                  id="esc-notes"
                  value={escortForm.notes}
                  onChange={(val) => setEscortForm({ ...escortForm, notes: val })}
                />
              </div>
              <Button type="submit" variant="primary" size="xl" className="w-full bg-gradient-to-br from-secondary to-secondary-container">
                ВЫЗВАТЬ
              </Button>
            </form>
          </section>
        </div>

        {/* Food Ordering */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">restaurant</span>
            Заказ питания к гейту
          </h2>
          <div className="bg-tertiary-fixed rounded-xl p-6 mb-6 flex items-start gap-4">
            <span className="material-symbols-outlined text-tertiary">info</span>
            <p className="text-lg font-medium text-on-tertiary-fixed">
              Доставка блюд осуществляется непосредственно к вашему гейту или месту ожидания в течение 20 минут.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <button
                key={rest.id}
                onClick={() => setShowMenu(rest)}
                className="p-8 bg-surface-container-lowest rounded-xl text-left hover:bg-tertiary-fixed transition-colors shadow-ambient hover:shadow-ambient-lg active:scale-[0.98] group"
              >
                <span className="text-2xl font-black block mb-2 group-hover:text-tertiary transition-colors">{rest.name}</span>
                <span className="text-lg text-on-surface-variant">{rest.description}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Zone Action Modal */}
      <Modal isOpen={!!zoneModal} onClose={() => setZoneModal(null)} title={zoneModal?.label || ''}>
        {zoneModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-primary-fixed p-6 rounded-xl">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '3rem' }}>
                {zoneModal.icon}
              </span>
              <div>
                <p className="text-xl font-bold text-on-primary-fixed">{zoneModal.label}</p>
                <p className="text-on-primary-fixed-variant">{zoneModal.description}</p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="label-sm text-outline mb-1">Местоположение зоны</p>
              <p className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                {zoneModal.location}
              </p>
            </div>

            <p className="text-on-surface-variant">Что вы хотите сделать?</p>

            <div className="space-y-3">
              <button
                onClick={() => handleZoneAction(zoneModal, 'navigate')}
                className="w-full p-5 bg-surface-container-low rounded-xl flex items-center gap-4 hover:bg-primary-fixed transition-colors text-left group"
              >
                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">navigation</span>
                <div>
                  <p className="font-bold text-lg">Построить маршрут</p>
                  <p className="text-sm text-on-surface-variant">Показать путь до этой зоны на карте</p>
                </div>
              </button>

              <button
                onClick={() => handleZoneAction(zoneModal, 'wheelchair')}
                className="w-full p-5 bg-surface-container-low rounded-xl flex items-center gap-4 hover:bg-primary-fixed transition-colors text-left group"
              >
                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">accessible</span>
                <div>
                  <p className="font-bold text-lg">Заказать кресло сюда</p>
                  <p className="text-sm text-on-surface-variant">Перейти к форме с заполненным адресом</p>
                </div>
              </button>

              <button
                onClick={() => handleZoneAction(zoneModal, 'escort')}
                className="w-full p-5 bg-surface-container-low rounded-xl flex items-center gap-4 hover:bg-secondary-fixed transition-colors text-left group"
              >
                <span className="material-symbols-outlined text-secondary text-3xl group-hover:scale-110 transition-transform">supervisor_account</span>
                <div>
                  <p className="font-bold text-lg">Вызвать сопровождающего</p>
                  <p className="text-sm text-on-surface-variant">Перейти к форме с заполненным адресом</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Menu Modal */}
      <Modal isOpen={!!showMenu} onClose={() => { setShowMenu(null); setCart([]); }} title={showMenu?.name || ''}>
        {showMenu && (
          <div className="space-y-6">
            <div className="space-y-3">
              {showMenu.menu.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-on-surface-variant">{item.price} ₽</p>
                    </div>
                  </div>
                  <button onClick={() => addToCart(item)} className="bg-primary text-white p-2 rounded-lg hover:bg-primary-container transition-colors">
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="bg-tertiary-fixed rounded-xl p-4">
                <p className="font-bold text-on-tertiary-fixed mb-2">Ваш заказ ({cart.length} поз.):</p>
                {cart.map((item, i) => (
                  <span key={i} className="text-sm text-on-tertiary-fixed-variant">{item.emoji} {item.name}{i < cart.length - 1 ? ', ' : ''}</span>
                ))}
                <p className="font-black text-on-tertiary-fixed mt-2">Итого: {cart.reduce((s, i) => s + i.price, 0)} ₽</p>

                <div className="mt-4">
                  <label className="block text-sm font-bold mb-2 text-on-tertiary-fixed">Доставка к гейту:</label>
                  <LocationPicker
                    id="food-gate"
                    value={foodGate}
                    onChange={setFoodGate}
                    placeholder="Выберите гейт или зону..."
                  />
                </div>

                <Button variant="tertiary" size="lg" className="w-full mt-4" onClick={handleFoodOrder}>
                  ОФОРМИТЬ ЗАКАЗ
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* SOS Modal */}
      <Modal isOpen={sosModal} onClose={() => setSosModal(false)} title="🚨 Экстренная помощь">
        <div className="space-y-6">
          <p className="text-lg text-on-surface-variant">
            Вы уверены, что хотите отправить экстренный вызов помощи? К вам будет направлен ближайший сотрудник.
          </p>
          <div className="flex gap-4">
            <Button variant="error" size="lg" className="flex-1" onClick={handleSOS}>
              ДА, ВЫЗВАТЬ ПОМОЩЬ
            </Button>
            <Button variant="outline" size="lg" onClick={() => setSosModal(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </Modal>

      {/* SOS FAB */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button
          onClick={() => setSosModal(true)}
          aria-label="Экстренный вызов помощи"
          className="bg-error text-white w-28 h-28 md:w-40 md:h-40 rounded-full shadow-sos flex flex-col items-center justify-center border-8 border-white hover:scale-110 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1" }}>
            emergency_share
          </span>
          <span className="text-lg md:text-xl font-black tracking-tight">SOS</span>
        </button>
        <div className="absolute inset-0 rounded-full bg-error/20 animate-pulse-ring pointer-events-none" />
      </div>
    </PageLayout>
  );
}
