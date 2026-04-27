import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import PageLayout from '../components/layout/PageLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TerminalMap from '../components/passenger/TerminalMap';
import LiveFlightBoard from '../components/ui/LiveFlightBoard';

const typeIcons = {
  wheelchair: 'accessible',
  escort: 'explore',
  food: 'restaurant',
  sos: 'emergency_share',
};

// ─── Sidebar Tabs ───
const sideNavItems = [
  { id: 'dashboard', icon: 'dashboard', label: 'Дашборд' },
  { id: 'requests', icon: 'pending_actions', label: 'Запросы' },
  { id: 'flights', icon: 'flight', label: 'Авиарейсы' },
  { id: 'staffing', icon: 'group', label: 'Персонал' },
  { id: 'map', icon: 'map', label: 'Карта терминала' },
  { id: 'reports', icon: 'assessment', label: 'Отчёты' },
];

export default function DispatcherPage() {
  const {
    requests, staff, assignRequest, sosAlerts, addRequest,
    updateRequestStatus, acceptRequest,
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [draggedStaff, setDraggedStaff] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapLayer, setMapLayer] = useState('default'); // default, heat, satellite
  const [staffFilter, setStaffFilter] = useState('all'); // all, available, busy
  const [showStaffFilter, setShowStaffFilter] = useState(false);
  const [newRequestModal, setNewRequestModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [requestDetailModal, setRequestDetailModal] = useState(null);
  const [newReqForm, setNewReqForm] = useState({
    type: 'wheelchair', location: '', passenger: '', notes: '', priority: 'B',
  });
  const [tickerTime, setTickerTime] = useState(Date.now());

  // Live ticker
  useEffect(() => {
    const interval = setInterval(() => setTickerTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeRequests = requests.filter((r) => r.status !== 'completed');
  const newRequests = requests.filter((r) => r.status === 'new');
  const inProgressRequests = requests.filter((r) => r.status === 'in_progress');
  const completedRequests = requests.filter((r) => r.status === 'completed');
  const availableStaff = staff.filter((s) => s.status === 'available');

  const filteredStaff = staffFilter === 'all'
    ? staff
    : staff.filter((s) => s.status === staffFilter);

  const formatTimer = (ts) => {
    const secs = Math.floor((tickerTime - ts) / 1000);
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainSecs).padStart(2, '0')}`;
  };

  // KPI calculations
  const avgResponseTime = (() => {
    const accepted = requests.filter(r => r.status !== 'new' && r.createdAt);
    if (accepted.length === 0) return '04:12';
    const avgSecs = accepted.reduce((sum, r) => sum + Math.min(600, (Date.now() - r.createdAt) / 1000), 0) / accepted.length;
    const mins = Math.floor(avgSecs / 60);
    const secs = Math.floor(avgSecs % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  })();

  const handleDragStart = (staffId) => setDraggedStaff(staffId);
  const handleDrop = (requestId) => {
    if (draggedStaff) {
      assignRequest(requestId, draggedStaff);
      setDraggedStaff(null);
    }
  };

  const handleNewRequest = (e) => {
    e.preventDefault();
    const typeLabels = {
      wheelchair: 'Инвалидное кресло',
      escort: 'Сопровождение',
      food: 'Доставка питания',
      sos: 'SOS — Экстренная помощь',
    };
    addRequest({
      type: newReqForm.type,
      typeLabel: typeLabels[newReqForm.type],
      location: newReqForm.location,
      passenger: newReqForm.passenger || 'Пассажир',
      notes: newReqForm.notes,
      priority: newReqForm.priority,
    });
    setNewReqForm({ type: 'wheelchair', location: '', passenger: '', notes: '', priority: 'B' });
    setNewRequestModal(false);
  };

  // ─── Sidebar Component (inline for tab control) ───
  const SidebarContent = () => (
    <aside className="h-[calc(100vh-5rem)] w-72 fixed left-0 top-20 bg-surface-container-low flex flex-col py-8 pl-4 space-y-2 z-40 hidden lg:flex">
      <div className="mb-8 px-4">
        <h2 className="text-primary font-bold text-sm uppercase tracking-widest">Пульт диспетчера</h2>
        <p className="text-outline text-xs mt-1">Терминал A</p>
      </div>

      <nav className="flex-1 space-y-1">
        {sideNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-l-xl transition-all duration-200 text-left ${
              activeTab === item.id
                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.id === 'requests' && newRequests.length > 0 && (
              <span className="ml-auto bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {newRequests.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pr-4 space-y-2 pb-8">
        <button
          onClick={() => setNewRequestModal(true)}
          className="w-full bg-primary text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-ambient hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Новый запрос
        </button>
        <button
          onClick={() => setSupportModal(true)}
          className="w-full flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-medium">Поддержка</span>
        </button>
        <button
          onClick={() => setLogoutConfirm(true)}
          className="w-full flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Выход</span>
        </button>
      </div>
    </aside>
  );

  // ─── Dashboard View ───
  const DashboardView = () => (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Map View */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-2xl overflow-hidden relative min-h-[450px]">
          <div className="absolute top-6 left-6 z-10">
            <div className="glass-panel px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-white/20">
              <span className="w-2 h-2 bg-error rounded-full animate-pulse" />
              <span className="text-sm font-bold text-on-surface">{sosAlerts.length + newRequests.length} алертов высокого приоритета</span>
            </div>
          </div>

          {/* Layer label */}
          <div className="absolute top-6 right-20 z-10">
            <div className="glass-panel px-3 py-1 rounded-lg text-xs font-bold text-on-surface-variant">
              {mapLayer === 'default' ? '📍 Стандарт' : mapLayer === 'heat' ? '🔥 Тепловая' : '🛰️ Спутник'}
            </div>
          </div>

          <div
            className="w-full h-full bg-surface-dim relative group overflow-hidden min-h-[450px]"
            style={{ transform: `scale(${mapZoom})`, transformOrigin: 'center', transition: 'transform 300ms ease' }}
          >
            <img
              className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ${
                mapLayer === 'satellite' ? 'opacity-80 grayscale-0' :
                mapLayer === 'heat' ? 'opacity-70 grayscale-0 hue-rotate-30' :
                'opacity-60 grayscale group-hover:grayscale-0'
              }`}
              alt="Карта терминала"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS__AO_V5A2EDlKAXabFVl3MA7j0q9bcdM-xAnXHWuD9slfk1T7CSPFo0u3GIELmLgJKi9qdYATt1m58LVDkw1ttzO_3v0_2fQhRH0QeEuzMSTVoeM6UetqydswIsc6VVLznHr-D84l2NoFR5iytuSYLPFwX6rjXixzeXqLbNIYAjWbJg3cduNHbcskffHtkx-Ru5TT-udBdPC6TC-gVQLzrCx22vFobGF-jFUo8vOvSCZ4wQ0tumJsdkahoQDMqPRhCK3scE_Fr4"
            />

            {/* Staff markers on map */}
            {staff.map((s, i) => {
              const positions = [
                { top: '25%', left: '33%' },
                { top: '40%', left: '55%' },
                { top: '60%', left: '30%' },
                { top: '35%', left: '70%' },
                { top: '55%', left: '50%' },
              ];
              const pos = positions[i % positions.length];
              return (
                <div
                  key={s.id}
                  className="absolute z-10 group/marker"
                  style={{ top: pos.top, left: pos.left }}
                >
                  {s.status === 'available' && (
                    <div className="absolute -inset-2 bg-green-400/30 rounded-full animate-ping" />
                  )}
                  <div className={`w-5 h-5 rounded-full shadow-lg border-2 border-white cursor-pointer ${
                    s.status === 'available' ? 'bg-green-500' : 'bg-primary'
                  }`} title={`${s.name} — ${s.status === 'available' ? 'Доступен' : 'Занят'} (${s.zone})`} />
                </div>
              );
            })}

            {/* SOS markers */}
            {sosAlerts.map((alert, i) => (
              <div key={alert.id} className="absolute z-10" style={{ bottom: `${30 + i * 10}%`, right: '25%' }}>
                <div className="absolute -inset-4 bg-error/20 rounded-full animate-pulse" />
                <div className="w-5 h-5 bg-error rounded-full shadow-lg border-2 border-white" />
              </div>
            ))}

            {/* New request markers */}
            {newRequests.map((req, i) => (
              <div key={req.id} className="absolute z-10" style={{ top: `${20 + i * 15}%`, left: `${25 + i * 12}%` }}>
                <div className="absolute -inset-3 bg-tertiary/20 rounded-full animate-ping" />
                <div className="w-4 h-4 bg-tertiary rounded-full shadow-lg border-2 border-white" />
              </div>
            ))}
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
            <button
              onClick={() => setMapZoom(z => Math.min(z + 0.15, 2))}
              className="p-3 bg-white rounded-xl shadow-lg hover:bg-surface-container transition-colors active:scale-90"
              title="Увеличить"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button
              onClick={() => setMapZoom(z => Math.max(z - 0.15, 0.5))}
              className="p-3 bg-white rounded-xl shadow-lg hover:bg-surface-container transition-colors active:scale-90"
              title="Уменьшить"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <button
              onClick={() => setMapLayer(l => l === 'default' ? 'heat' : l === 'heat' ? 'satellite' : 'default')}
              className={`p-3 rounded-xl shadow-lg transition-colors active:scale-90 ${
                mapLayer !== 'default' ? 'bg-primary text-white' : 'bg-white hover:bg-surface-container'
              }`}
              title="Слои карты"
            >
              <span className="material-symbols-outlined">layers</span>
            </button>
          </div>
        </section>

        {/* Right Panel */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Staff Availability */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Доступность персонала</h3>
              <button
                onClick={() => setShowStaffFilter(!showStaffFilter)}
                className={`p-1 rounded-lg transition-colors ${showStaffFilter ? 'bg-primary text-white' : 'text-outline hover:bg-surface-container-high'}`}
              >
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
            {showStaffFilter && (
              <div className="flex gap-2 mb-4">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'available', label: 'Свободные' },
                  { id: 'busy', label: 'Занятые' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStaffFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      staffFilter === f.id ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-3">
              {filteredStaff.map((s) => (
                <div
                  key={s.id}
                  draggable={s.status === 'available'}
                  onDragStart={() => handleDragStart(s.id)}
                  className={`p-4 bg-surface-container-low rounded-xl border-l-4 flex justify-between items-center transition-colors ${
                    s.status === 'available'
                      ? 'border-green-500 cursor-grab active:cursor-grabbing hover:bg-surface-container group'
                      : 'border-primary opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                      <img className="w-full h-full object-cover" alt={s.name} src={s.avatar} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{s.name}</p>
                      <p className="label-sm text-on-surface-variant">
                        {s.status === 'available' ? 'Доступен' : 'Занят'} • {s.zone}
                      </p>
                    </div>
                  </div>
                  {s.status === 'available' && (
                    <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">drag_indicator</span>
                  )}
                  {s.status === 'busy' && (
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_ind</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Requests Drop Zone */}
          {newRequests.length > 0 && (
            <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-widest">Неназначенные запросы</h3>
                <Badge type="critical" label="КРИТИЧНО" />
              </div>
              {newRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(req.id)}
                  className="bg-white/40 border-2 border-dashed border-tertiary-container/30 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 mb-3 transition-colors hover:bg-white/60"
                >
                  <span className="material-symbols-outlined text-2xl text-tertiary">back_hand</span>
                  <p className="text-sm font-medium">
                    Перетащите сотрудника для назначения на <span className="font-bold">{req.typeLabel}</span>
                  </p>
                  <p className="text-xs text-on-tertiary-fixed-variant">{req.location}</p>
                  <div className="flex gap-2 mt-2 flex-wrap justify-center">
                    {availableStaff.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => assignRequest(req.id, s.id)}
                        className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-tertiary hover:bg-tertiary hover:text-white transition-colors"
                      >
                        {s.initials}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Request Tracker Table */}
        <section className="col-span-12 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
          <div className="px-8 py-6 flex justify-between items-center bg-surface-container-high/30">
            <h3 className="font-bold text-lg">Трекер активных запросов</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary" /> В работе ({inProgressRequests.length})
              </span>
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-tertiary" /> Ожидает ({newRequests.length})
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 label-sm text-outline">ID / Пассажир</th>
                  <th className="px-8 py-4 label-sm text-outline">Тип помощи</th>
                  <th className="px-8 py-4 label-sm text-outline">Локация</th>
                  <th className="px-8 py-4 label-sm text-outline">Сотрудник</th>
                  <th className="px-8 py-4 label-sm text-outline">Статус</th>
                  <th className="px-8 py-4 label-sm text-outline">Действия</th>
                  <th className="px-8 py-4 label-sm text-outline text-right">Таймер</th>
                </tr>
              </thead>
              <tbody>
                {activeRequests.map((req, i) => {
                  const assignee = staff.find((s) => s.id === req.assignedStaff);
                  const timer = formatTimer(req.createdAt);
                  const mins = Math.floor((tickerTime - req.createdAt) / 60000);
                  return (
                    <tr
                      key={req.id}
                      className={`${i % 2 === 1 ? 'bg-surface-container-low/30' : ''} hover:bg-surface transition-colors cursor-pointer`}
                      onClick={() => setRequestDetailModal(req)}
                    >
                      <td className="px-8 py-5">
                        <p className="font-bold text-on-surface">{req.id.slice(-4)} • {req.passenger}</p>
                        <p className="text-xs text-on-surface-variant">
                          {req.priority === 'A' ? '🔴 Высокий' : req.priority === 'B' ? '🟠 Средний' : '🟢 Обычный'}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">{typeIcons[req.type] || 'help'}</span>
                          <span className="text-sm font-medium">{req.typeLabel}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium">{req.location}</td>
                      <td className="px-8 py-5">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-surface-container-high overflow-hidden">
                              <img className="w-full h-full object-cover" alt={assignee.name} src={assignee.avatar} />
                            </div>
                            <span className="text-sm">{assignee.name.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-outline italic">Поиск...</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <Badge type={req.status} />
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {req.status === 'new' && availableStaff.length > 0 && (
                            <button
                              onClick={() => assignRequest(req.id, availableStaff[0].id)}
                              className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition-colors"
                              title="Назначить"
                            >
                              Назн.
                            </button>
                          )}
                          {req.status === 'accepted' && (
                            <button
                              onClick={() => updateRequestStatus(req.id, 'in_progress')}
                              className="px-3 py-1 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-secondary-container transition-colors"
                            >
                              В работу
                            </button>
                          )}
                          {(req.status === 'in_progress' || req.status === 'accepted') && (
                            <button
                              onClick={() => updateRequestStatus(req.id, 'completed')}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={`px-8 py-5 text-right font-mono font-bold ${mins > 10 ? 'text-error' : 'text-primary'}`}>
                        {timer}
                      </td>
                    </tr>
                  );
                })}
                {activeRequests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl text-outline mb-2 block">check_circle</span>
                      Все запросы обработаны
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );

  // ─── Requests View (detailed list) ───
  const RequestsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-on-surface">Все запросы</h2>
        <button
          onClick={() => setNewRequestModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Новый запрос
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Новые', count: newRequests.length, color: 'bg-tertiary text-white', icon: 'notifications_active' },
          { label: 'Принятые', count: requests.filter(r => r.status === 'accepted').length, color: 'bg-secondary text-white', icon: 'assignment_ind' },
          { label: 'В работе', count: inProgressRequests.length, color: 'bg-primary text-white', icon: 'engineering' },
          { label: 'Завершено', count: completedRequests.length, color: 'bg-green-600 text-white', icon: 'check_circle' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-5 flex items-center gap-4`}>
            <span className="material-symbols-outlined text-3xl opacity-80">{stat.icon}</span>
            <div>
              <p className="text-3xl font-black">{stat.count}</p>
              <p className="text-xs font-medium opacity-80">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All requests */}
      <div className="space-y-3">
        {requests.map((req) => {
          const assignee = staff.find((s) => s.id === req.assignedStaff);
          return (
            <div
              key={req.id}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:shadow-ambient-lg transition-shadow cursor-pointer"
              onClick={() => setRequestDetailModal(req)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  req.type === 'sos' ? 'bg-error/10 text-error' :
                  req.type === 'wheelchair' ? 'bg-primary-fixed text-primary' :
                  req.type === 'food' ? 'bg-tertiary-fixed text-tertiary' :
                  'bg-secondary-fixed text-secondary'
                }`}>
                  <span className="material-symbols-outlined">{typeIcons[req.type] || 'help'}</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">{req.typeLabel}</p>
                  <p className="text-sm text-on-surface-variant">{req.passenger} • {req.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {assignee && (
                  <div className="flex items-center gap-2">
                    <img className="w-6 h-6 rounded-full object-cover" alt={assignee.name} src={assignee.avatar} />
                    <span className="text-xs font-medium">{assignee.name.split(' ')[0]}</span>
                  </div>
                )}
                <Badge type={req.status} />
                <span className="text-sm font-mono font-bold text-on-surface-variant">{formatTimer(req.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Staffing View ───
  const StaffingView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-on-surface">Управление персоналом</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-600 text-white rounded-xl p-5">
          <p className="text-3xl font-black">{availableStaff.length}</p>
          <p className="text-sm opacity-80">Свободных сотрудников</p>
        </div>
        <div className="bg-primary text-white rounded-xl p-5">
          <p className="text-3xl font-black">{staff.filter(s => s.status === 'busy').length}</p>
          <p className="text-sm opacity-80">Занятых сотрудников</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
          <p className="text-3xl font-black text-on-surface">{staff.length}</p>
          <p className="text-sm text-on-surface-variant">Всего в смене</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staff.map((s) => {
          const assignedReqs = requests.filter(r => r.assignedStaff === s.id && r.status !== 'completed');
          const completedCount = requests.filter(r => r.assignedStaff === s.id && r.status === 'completed').length;
          return (
            <div key={s.id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-high">
                  <img className="w-full h-full object-cover" alt={s.name} src={s.avatar} />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold">{s.name}</p>
                  <p className="text-sm text-on-surface-variant">{s.specialization || 'Универсальный помощник'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${s.status === 'available' ? 'bg-green-500' : 'bg-primary'}`} />
                    <span className="text-xs font-bold">{s.status === 'available' ? 'Доступен' : 'Занят'}</span>
                    <span className="text-xs text-on-surface-variant">• {s.zone}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div className="flex-1 bg-surface-container-low rounded-xl p-3">
                  <p className="text-xl font-black text-primary">{assignedReqs.length}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant">Активные</p>
                </div>
                <div className="flex-1 bg-surface-container-low rounded-xl p-3">
                  <p className="text-xl font-black text-green-600">{completedCount}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant">Завершено</p>
                </div>
              </div>
              {assignedReqs.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="label-sm text-outline">Текущие задачи:</p>
                  {assignedReqs.map(req => (
                    <div key={req.id} className="flex items-center gap-2 text-xs bg-surface-container-low px-3 py-2 rounded-lg">
                      <span className="material-symbols-outlined text-sm text-primary">{typeIcons[req.type]}</span>
                      <span className="font-medium">{req.typeLabel}</span>
                      <Badge type={req.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Map View ───
  const MapView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-on-surface">Карта терминала</h2>
      <TerminalMap />
    </div>
  );

  // ─── Reports View ───
  const ReportsView = () => {
    const totalRequests = requests.length;
    const completedCount = completedRequests.length;
    const avgRating = useStore.getState().getAverageRating();
    const byType = requests.reduce((acc, r) => {
      acc[r.typeLabel] = (acc[r.typeLabel] || 0) + 1;
      return acc;
    }, {});
    const byPriority = {
      A: requests.filter(r => r.priority === 'A').length,
      B: requests.filter(r => r.priority === 'B').length,
      C: requests.filter(r => r.priority === 'C').length,
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-on-surface">Отчёты и аналитика</h2>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
            <span className="material-symbols-outlined text-primary mb-2 block">assignment</span>
            <p className="text-3xl font-black text-on-surface">{totalRequests}</p>
            <p className="text-xs text-on-surface-variant font-medium">Всего запросов</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
            <span className="material-symbols-outlined text-green-600 mb-2 block">check_circle</span>
            <p className="text-3xl font-black text-on-surface">{completedCount}</p>
            <p className="text-xs text-on-surface-variant font-medium">Завершено</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
            <span className="material-symbols-outlined text-tertiary mb-2 block">timer</span>
            <p className="text-3xl font-black text-on-surface">{avgResponseTime}</p>
            <p className="text-xs text-on-surface-variant font-medium">Среднее время</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
            <span className="material-symbols-outlined text-secondary mb-2 block">star</span>
            <p className="text-3xl font-black text-on-surface">{avgRating || '—'}</p>
            <p className="text-xs text-on-surface-variant font-medium">Рейтинг</p>
          </div>
        </div>

        {/* By Type */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h3 className="font-bold text-lg mb-4">По типу запроса</h3>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-4">
                <span className="text-sm font-medium w-40">{type}</span>
                <div className="flex-1 bg-surface-container-low rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${Math.max(10, (count / totalRequests) * 100)}%` }}
                  >
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Priority */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h3 className="font-bold text-lg mb-4">По приоритету</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Высокий (A)', count: byPriority.A, color: 'bg-error/10 text-error border-error/20' },
              { label: 'Средний (B)', count: byPriority.B, color: 'bg-tertiary-fixed text-tertiary border-tertiary/20' },
              { label: 'Обычный (C)', count: byPriority.C, color: 'bg-surface-container-low text-on-surface-variant border-outline-variant/20' },
            ].map(p => (
              <div key={p.label} className={`${p.color} border rounded-xl p-5 text-center`}>
                <p className="text-3xl font-black">{p.count}</p>
                <p className="text-xs font-bold mt-1">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent completed */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h3 className="font-bold text-lg mb-4">Последние завершённые</h3>
          {completedRequests.length === 0 ? (
            <p className="text-on-surface-variant text-sm">Нет завершённых запросов</p>
          ) : (
            <div className="space-y-2">
              {completedRequests.slice(0, 5).map(req => {
                const assignee = staff.find(s => s.id === req.assignedStaff);
                return (
                  <div key={req.id} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                    <span className="text-sm font-medium flex-1">{req.typeLabel} — {req.passenger}</span>
                    {assignee && <span className="text-xs text-on-surface-variant">{assignee.name.split(' ')[0]}</span>}
                    <span className="text-xs font-mono text-outline">{formatTimer(req.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'requests': return <RequestsView />;
      case 'staffing': return <StaffingView />;
      case 'map': return <MapView />;
      case 'reports': return <ReportsView />;
      case 'flights': return (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-on-surface">Табло рейсов</h2>
          <LiveFlightBoard isDispatcher={true} />
        </div>
      );
      default: return <DashboardView />;
    }
  };

  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-5rem)]">
        <SidebarContent />

        {/* Main Content */}
        <div className="flex-1 lg:ml-72 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h1 className="text-[1.75rem] font-black text-on-surface tracking-tight mb-2">Панель диспетчера</h1>
              <p className="text-on-surface-variant max-w-xl">
                Управление терминалом в реальном времени. Координация помощи маломобильным пассажирам и мониторинг сотрудников.
              </p>
            </div>
            <div className="flex gap-8 md:gap-12">
              <div className="text-right">
                <p className="label-sm text-outline mb-1">Среднее время ответа</p>
                <p className="text-4xl font-black text-primary">{avgResponseTime} <span className="text-sm font-medium text-on-surface-variant">МИН</span></p>
              </div>
              <div className="text-right">
                <p className="label-sm text-outline mb-1">Активный персонал</p>
                <p className="text-4xl font-black text-primary">{staff.filter(s => s.status !== 'offline').length} <span className="text-sm font-medium text-on-surface-variant">/ {staff.length}</span></p>
              </div>
            </div>
          </header>

          {renderView()}
        </div>
      </div>

      {/* ── Modals ── */}

      {/* New Request Modal */}
      <Modal isOpen={newRequestModal} onClose={() => setNewRequestModal(false)} title="Создать запрос вручную">
        <form onSubmit={handleNewRequest} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2">Тип помощи</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'wheelchair', label: 'Кресло', icon: 'accessible' },
                { id: 'escort', label: 'Сопровождение', icon: 'explore' },
                { id: 'food', label: 'Питание', icon: 'restaurant' },
                { id: 'sos', label: 'SOS', icon: 'emergency_share' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNewReqForm({ ...newReqForm, type: t.id })}
                  className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    newReqForm.type === t.id
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Имя пассажира</label>
            <input
              className="w-full p-3 bg-surface-container-low border-none rounded-lg"
              placeholder="Введите имя..."
              value={newReqForm.passenger}
              onChange={(e) => setNewReqForm({ ...newReqForm, passenger: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Местоположение</label>
            <input
              className="w-full p-3 bg-surface-container-low border-none rounded-lg"
              placeholder="Гейт или зона..."
              value={newReqForm.location}
              onChange={(e) => setNewReqForm({ ...newReqForm, location: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Приоритет</label>
            <div className="flex gap-2">
              {[
                { id: 'A', label: '🔴 Высокий', color: 'bg-error' },
                { id: 'B', label: '🟠 Средний', color: 'bg-tertiary' },
                { id: 'C', label: '🟢 Обычный', color: 'bg-green-600' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setNewReqForm({ ...newReqForm, priority: p.id })}
                  className={`flex-1 p-3 rounded-xl text-center text-sm font-bold transition-all ${
                    newReqForm.priority === p.id
                      ? `${p.color} text-white`
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Примечания</label>
            <textarea
              className="w-full p-3 bg-surface-container-low border-none rounded-lg"
              placeholder="Доп. информация..."
              rows="2"
              value={newReqForm.notes}
              onChange={(e) => setNewReqForm({ ...newReqForm, notes: e.target.value })}
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            СОЗДАТЬ ЗАПРОС
          </Button>
        </form>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        isOpen={!!requestDetailModal}
        onClose={() => setRequestDetailModal(null)}
        title={requestDetailModal ? `${requestDetailModal.typeLabel} — ${requestDetailModal.id.slice(-4)}` : ''}
      >
        {requestDetailModal && (() => {
          const req = requestDetailModal;
          const assignee = staff.find(s => s.id === req.assignedStaff);
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low rounded-xl p-4">
                  <p className="label-sm text-outline mb-1">Пассажир</p>
                  <p className="font-bold">{req.passenger}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4">
                  <p className="label-sm text-outline mb-1">Приоритет</p>
                  <p className="font-bold">{req.priority === 'A' ? '🔴 Высокий' : req.priority === 'B' ? '🟠 Средний' : '🟢 Обычный'}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4">
                  <p className="label-sm text-outline mb-1">Локация</p>
                  <p className="font-bold">{req.location}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4">
                  <p className="label-sm text-outline mb-1">Статус</p>
                  <Badge type={req.status} />
                </div>
              </div>
              {req.notes && (
                <div className="bg-surface-container-low rounded-xl p-4">
                  <p className="label-sm text-outline mb-1">Примечания</p>
                  <p className="text-sm">{req.notes}</p>
                </div>
              )}
              {assignee && (
                <div className="bg-primary-fixed rounded-xl p-4 flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full object-cover" alt={assignee.name} src={assignee.avatar} />
                  <div>
                    <p className="font-bold">{assignee.name}</p>
                    <p className="text-xs text-on-primary-fixed-variant">{assignee.zone}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                {req.status === 'new' && availableStaff.length > 0 && (
                  <Button variant="primary" size="lg" className="flex-1" onClick={() => {
                    assignRequest(req.id, availableStaff[0].id);
                    setRequestDetailModal(null);
                  }}>
                    Назначить сотрудника
                  </Button>
                )}
                {req.status === 'accepted' && (
                  <Button variant="primary" size="lg" className="flex-1" onClick={() => {
                    updateRequestStatus(req.id, 'in_progress');
                    setRequestDetailModal(null);
                  }}>
                    Отправить в работу
                  </Button>
                )}
                {(req.status === 'in_progress' || req.status === 'accepted') && (
                  <Button variant="primary" size="lg" className="flex-1 !bg-green-600" onClick={() => {
                    updateRequestStatus(req.id, 'completed');
                    setRequestDetailModal(null);
                  }}>
                    Завершить
                  </Button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Support Modal */}
      <Modal isOpen={supportModal} onClose={() => setSupportModal(false)} title="Техническая поддержка">
        <div className="space-y-4">
          <div className="bg-primary-fixed rounded-xl p-5 flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl">headset_mic</span>
            <div>
              <p className="font-bold">Горячая линия</p>
              <p className="text-2xl font-black text-primary">+7 (495) 123-45-67</p>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4">
            <span className="material-symbols-outlined text-secondary text-3xl">mail</span>
            <div>
              <p className="font-bold">Email поддержки</p>
              <p className="text-sm text-on-surface-variant">support@aeroassist.pro</p>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4">
            <span className="material-symbols-outlined text-tertiary text-3xl">chat</span>
            <div>
              <p className="font-bold">Чат с администратором</p>
              <p className="text-sm text-on-surface-variant">Время ответа ~2 мин</p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">Версия системы: AeroAssist Pro v2.1.0 • Обновлено 31.03.2026</p>
        </div>
      </Modal>

      {/* Logout Confirm */}
      <Modal isOpen={logoutConfirm} onClose={() => setLogoutConfirm(false)} title="Выход из системы">
        <div className="space-y-5">
          <p className="text-on-surface-variant">
            Вы уверены, что хотите выйти из панели диспетчера? Все незавершённые назначения будут сохранены.
          </p>
          <div className="flex gap-3">
            <Link
              to="/"
              className="flex-1 bg-error text-white py-3 rounded-xl font-bold text-center hover:bg-error/90 transition-colors"
            >
              Да, выйти
            </Link>
            <button
              onClick={() => setLogoutConfirm(false)}
              className="flex-1 bg-surface-container-low py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
