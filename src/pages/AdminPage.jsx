import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import PageLayout from '../components/layout/PageLayout';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import TerminalMap from '../components/passenger/TerminalMap';
import AdvancedAnalytics from '../components/admin/AdvancedAnalytics';

const typeIcons = {
  wheelchair: 'accessible',
  escort: 'explore',
  food: 'restaurant',
  sos: 'emergency_share',
};

const sideNavItems = [
  { id: 'dashboard', icon: 'dashboard', label: 'Дашборд' },
  { id: 'requests', icon: 'pending_actions', label: 'Запросы' },
  { id: 'staffing', icon: 'group', label: 'Персонал' },
  { id: 'map', icon: 'map', label: 'Карта терминала' },
  { id: 'reports', icon: 'assessment', label: 'Отчёты' },
];

export default function AdminPage() {
  const {
    requests, staff, feedback, addFeedback, getAverageRating,
    addRequest, updateRequestStatus, assignRequest,
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '', passenger: '' });

  // Modals
  const [newRequestModal, setNewRequestModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [addStaffModal, setAddStaffModal] = useState(false);
  const [requestDetailModal, setRequestDetailModal] = useState(null);
  const [exportNotification, setExportNotification] = useState(false);

  // Filters
  const [periodFilter, setPeriodFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchActive, setSearchActive] = useState(false);

  // New request form
  const [newReqForm, setNewReqForm] = useState({
    type: 'wheelchair', location: '', passenger: '', notes: '', priority: 'B',
  });

  // New staff form
  const [newStaffForm, setNewStaffForm] = useState({
    name: '', role: 'Помощник', zone: 'Терминал A',
  });

  // Live ticker
  const [tickerTime, setTickerTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTickerTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const completedRequests = requests.filter((r) => r.status === 'completed');
  const newRequests = requests.filter((r) => r.status === 'new');
  const inProgressRequests = requests.filter((r) => r.status === 'in_progress' || r.status === 'accepted');
  const totalRequests = requests.length;
  const activeStaff = staff.filter((s) => s.status !== 'offline').length;
  const availableStaff = staff.filter((s) => s.status === 'available');
  const avgRating = getAverageRating();

  const formatTimer = (ts) => {
    const secs = Math.floor((tickerTime - ts) / 1000);
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainSecs).padStart(2, '0')}`;
  };

  // Avg response time
  const avgResponseTime = (() => {
    const accepted = requests.filter(r => r.status !== 'new' && r.createdAt);
    if (accepted.length === 0) return '04:12';
    const avgSecs = accepted.reduce((sum, r) => sum + Math.min(600, (Date.now() - r.createdAt) / 1000), 0) / accepted.length;
    const mins = Math.floor(avgSecs / 60);
    const secs = Math.floor(avgSecs % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  })();

  // Filtered requests for history table
  const getFilteredRequests = () => {
    let filtered = [...requests];

    if (periodFilter !== 'all') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      if (periodFilter === '7days') filtered = filtered.filter(r => now - r.createdAt < 7 * dayMs);
      if (periodFilter === '30days') filtered = filtered.filter(r => now - r.createdAt < 30 * dayMs);
    }

    if (staffFilter !== 'all') {
      filtered = filtered.filter(r => r.assignedStaff === staffFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.type === categoryFilter);
    }

    return filtered;
  };

  const filteredRequests = searchActive ? getFilteredRequests() : requests;

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Дата', 'Пассажир', 'Сотрудник', 'Категория', 'Статус', 'Приоритет', 'Локация'];
    const statusLabels = { new: 'Новый', accepted: 'Принят', in_progress: 'В работе', completed: 'Завершён' };
    const rows = filteredRequests.map(req => {
      const assignee = staff.find(s => s.id === req.assignedStaff);
      const date = new Date(req.createdAt).toLocaleString('ru-RU');
      return [date, req.passenger, assignee?.name || '—', req.typeLabel, statusLabels[req.status] || req.status, req.priority, req.location];
    });
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aeroassist_requests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNotification(true);
    setTimeout(() => setExportNotification(false), 3000);
  };

  const handleFeedback = (e) => {
    e.preventDefault();
    if (feedbackForm.rating === 0) return;
    addFeedback({
      passenger: feedbackForm.passenger || 'Анонимный пассажир',
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
    });
    setFeedbackForm({ rating: 0, comment: '', passenger: '' });
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

  const handleAddStaff = (e) => {
    e.preventDefault();
    // Add staff via store (we'll add the action)
    const addStaff = useStore.getState().addStaff;
    if (addStaff) {
      addStaff({
        name: newStaffForm.name,
        role: newStaffForm.role,
        zone: newStaffForm.zone,
      });
    }
    setNewStaffForm({ name: '', role: 'Помощник', zone: 'Терминал A' });
    setAddStaffModal(false);
  };

  const handleSearch = () => {
    setSearchActive(true);
  };

  const handleResetFilters = () => {
    setPeriodFilter('all');
    setStaffFilter('all');
    setCategoryFilter('all');
    setSearchActive(false);
  };

  // ─── Sidebar Component ───
  const SidebarContent = () => (
    <aside className="h-[calc(100vh-5rem)] w-72 fixed left-0 top-20 bg-surface-container-low flex flex-col py-8 pl-4 space-y-2 z-40 hidden lg:flex">
      <div className="mb-8 px-4">
        <h2 className="text-primary font-bold text-sm uppercase tracking-widest">Консоль администратора</h2>
        <p className="text-outline text-xs mt-1">Операции Терминала А</p>
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
      {/* Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Metric 1: Total Requests */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="label-sm text-outline">Запросов всего</span>
            <span className="text-primary material-symbols-outlined">trending_up</span>
          </div>
          <div className="text-4xl font-black text-on-surface mb-4">{totalRequests}</div>
          <div className="h-16 w-full flex items-end gap-1">
            {[40, 60, 50, 45, 80, 70, 100].map((h, i) => (
              <div key={i} className={`${i === 6 ? 'bg-primary-container' : 'bg-primary-fixed'} w-full rounded-t-sm`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Metric 2: Avg Response Time */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
          <div className="flex justify-between items-start mb-4">
            <span className="label-sm text-outline">Среднее время ответа</span>
            <span className="text-tertiary material-symbols-outlined">timer</span>
          </div>
          <div className="text-4xl font-black text-on-surface mb-2">{avgResponseTime} <span className="text-lg font-medium text-on-surface-variant">мин</span></div>
          <p className="text-sm text-on-surface-variant flex items-center gap-1">
            <span className="text-green-600 font-bold">-12%</span> vs прошлая неделя
          </p>
        </div>

        {/* Metric 3: Active Staff */}
        <div className="bg-primary p-8 rounded-xl shadow-ambient-lg text-white">
          <div className="flex justify-between items-start mb-4">
            <span className="label-sm text-blue-200">Активный персонал</span>
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
          <div className="text-4xl font-black mb-4">{activeStaff}</div>
          <div className="flex -space-x-2">
            {staff.slice(0, 3).map((s) => (
              <div key={s.id} className="h-8 w-8 rounded-full border-2 border-primary bg-surface-container-high overflow-hidden">
                <img alt={s.name} src={s.avatar} className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="h-8 w-8 rounded-full border-2 border-primary bg-primary-container flex items-center justify-center text-[10px] font-bold">
              +{Math.max(0, activeStaff - 3)}
            </div>
          </div>
        </div>
      </section>

      {/* Historical Requests */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-on-surface mb-2">История запросов</h2>
            <p className="text-on-surface-variant">Фильтрация и экспорт данных о помощи пассажирам.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-surface-variant transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">download</span>
            Экспорт CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-wrap gap-4 items-end mb-6">
          <div className="flex-1 min-w-[180px]">
            <label className="block label-sm text-outline mb-1 ml-1">Период</label>
            <select
              className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary p-3"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="all">Все время</option>
              <option value="7days">Последние 7 дней</option>
              <option value="30days">Последние 30 дней</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block label-sm text-outline mb-1 ml-1">Сотрудник</label>
            <select
              className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary p-3"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="all">Все сотрудники</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block label-sm text-outline mb-1 ml-1">Категория</label>
            <select
              className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary p-3"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Все категории</option>
              <option value="wheelchair">Кресло</option>
              <option value="escort">Сопровождение</option>
              <option value="food">Питание</option>
              <option value="sos">SOS</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-primary text-white p-3 rounded-lg hover:bg-primary/90 active:scale-95 transition-all"
              title="Применить фильтры"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            {searchActive && (
              <button
                onClick={handleResetFilters}
                className="bg-surface-container-high text-on-surface-variant p-3 rounded-lg hover:bg-surface-variant active:scale-95 transition-all"
                title="Сбросить фильтры"
              >
                <span className="material-symbols-outlined">filter_alt_off</span>
              </button>
            )}
          </div>
        </div>

        {/* Search results indicator */}
        {searchActive && (
          <div className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-lg">filter_list</span>
            Найдено: <span className="font-bold text-on-surface">{filteredRequests.length}</span> запросов
            <button onClick={handleResetFilters} className="ml-2 text-primary hover:underline text-xs font-bold">Сбросить</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-4 label-sm text-outline">Дата и время</th>
                <th className="px-6 py-4 label-sm text-outline">Пассажир</th>
                <th className="px-6 py-4 label-sm text-outline">Сотрудник</th>
                <th className="px-6 py-4 label-sm text-outline">Категория</th>
                <th className="px-6 py-4 label-sm text-outline">Статус</th>
                <th className="px-6 py-4 label-sm text-outline">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, i) => {
                const assignee = staff.find((s) => s.id === req.assignedStaff);
                const date = new Date(req.createdAt).toLocaleString('ru-RU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <tr
                    key={req.id}
                    className={`${i % 2 === 1 ? 'bg-surface-container-low' : ''} hover:bg-surface transition-colors cursor-pointer`}
                    onClick={() => setRequestDetailModal(req)}
                  >
                    <td className="px-6 py-4 font-medium text-sm">{date}</td>
                    <td className="px-6 py-4 font-bold text-sm">{req.passenger}</td>
                    <td className="px-6 py-4 text-sm">{assignee?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <Badge type={req.type} label={req.typeLabel} />
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={req.status} />
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {req.status === 'new' && availableStaff.length > 0 && (
                          <button
                            onClick={() => assignRequest(req.id, availableStaff[0].id)}
                            className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/80 transition-colors"
                          >
                            Назн.
                          </button>
                        )}
                        {req.status === 'accepted' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'in_progress')}
                            className="px-3 py-1 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-secondary/80 transition-colors"
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
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">search_off</span>
                    Нет запросов, соответствующих фильтрам
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Staff Management & Feedback */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Staff Management */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-on-surface">Управление персоналом</h2>
            <button
              onClick={() => setAddStaffModal(true)}
              className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Добавить
            </button>
          </div>
          <div className="space-y-4">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden">
                    <img alt={s.name} src={s.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-on-surface-variant">{s.role} • {s.zone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.status === 'available' ? 'bg-green-500' : 'bg-primary'}`} />
                  <span className="text-xs font-bold text-on-surface-variant">{s.status === 'available' ? 'Доступен' : 'Занят'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Module */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-on-surface">Отзывы пассажиров</h2>

          {/* Average Rating */}
          <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined" style={{ fontSize: '5rem' }}>verified_user</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Средний рейтинг</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{avgRating}</span>
              <span className="text-primary-fixed-dim text-sm mb-1">из 5.0 ({feedback.length} отзывов)</span>
            </div>
          </div>

          {/* Submit Feedback */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">rate_review</span>
              Новый отзыв
            </h3>
            <form onSubmit={handleFeedback} className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">Имя пассажира</label>
                <input
                  className="w-full p-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Имя пассажира..."
                  value={feedbackForm.passenger}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, passenger: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">Оценка качества</label>
                <StarRating value={feedbackForm.rating} onChange={(v) => setFeedbackForm({ ...feedbackForm, rating: v })} />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">Комментарий</label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary"
                  placeholder="Опишите впечатления от обслуживания..."
                  rows="3"
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Отправить отзыв
              </Button>
            </form>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {feedback.map((fb) => (
              <div key={fb.id} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">{fb.passenger}</p>
                    <p className="text-xs text-on-surface-variant">{fb.date} {fb.staffName && `• Сотрудник: ${fb.staffName}`}</p>
                  </div>
                  <StarRating value={fb.rating} readOnly size="text-xl" />
                </div>
                <p className="text-on-surface-variant">{fb.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  // ─── Requests View ───
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
          { label: 'В работе', count: requests.filter(r => r.status === 'in_progress').length, color: 'bg-primary text-white', icon: 'engineering' },
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
        {requests.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 block">check_circle</span>
            Нет активных запросов
          </div>
        )}
      </div>
    </div>
  );

  // ─── Staffing View ───
  const StaffingView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-on-surface">Управление персоналом</h2>
        <button
          onClick={() => setAddStaffModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Добавить сотрудника
        </button>
      </div>

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
                  <p className="text-sm text-on-surface-variant">{s.role}</p>
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
    const byType = requests.reduce((acc, r) => {
      acc[r.typeLabel] = (acc[r.typeLabel] || 0) + 1;
      return acc;
    }, {});
    const byPriority = {
      A: requests.filter(r => r.priority === 'A').length,
      B: requests.filter(r => r.priority === 'B').length,
      C: requests.filter(r => r.priority === 'C').length,
    };

    const handleExportReport = () => {
      const reportData = {
        date: new Date().toISOString(),
        totalRequests,
        completedRequests: completedRequests.length,
        avgResponseTime,
        avgRating,
        byType,
        byPriority,
        staffStats: staff.map(s => ({
          name: s.name,
          active: requests.filter(r => r.assignedStaff === s.id && r.status !== 'completed').length,
          completed: requests.filter(r => r.assignedStaff === s.id && r.status === 'completed').length,
        })),
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aeroassist_report_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-on-surface">Отчёты и аналитика</h2>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Скачать отчёт
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
            <span className="material-symbols-outlined text-primary mb-2 block">assignment</span>
            <p className="text-3xl font-black text-on-surface">{totalRequests}</p>
            <p className="text-xs text-on-surface-variant font-medium">Всего запросов</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
            <span className="material-symbols-outlined text-green-600 mb-2 block">check_circle</span>
            <p className="text-3xl font-black text-on-surface">{completedRequests.length}</p>
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

        {/* Staff Performance */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h3 className="font-bold text-lg mb-4">Производительность сотрудников</h3>
          <div className="space-y-3">
            {staff.map(s => {
              const cmpltd = requests.filter(r => r.assignedStaff === s.id && r.status === 'completed').length;
              const active = requests.filter(r => r.assignedStaff === s.id && r.status !== 'completed').length;
              const total = cmpltd + active;
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 bg-surface-container-low rounded-xl">
                  <img className="w-8 h-8 rounded-full object-cover" alt={s.name} src={s.avatar} />
                  <span className="text-sm font-bold flex-1">{s.name}</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-primary font-bold">{active} акт.</span>
                    <span className="text-green-600 font-bold">{cmpltd} зав.</span>
                  </div>
                  <div className="w-24 bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: total > 0 ? `${(cmpltd / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
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
      case 'reports': return <AdvancedAnalytics />;
      default: return <DashboardView />;
    }
  };

  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-5rem)]">
        <SidebarContent />

        {/* Main Content */}
        <div className="flex-1 lg:ml-72 p-6 md:p-12 max-w-7xl mx-auto overflow-y-auto">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2">Панель администратора</h1>
            <p className="text-on-surface-variant text-lg">Мониторинг производительности и управление персоналом.</p>
          </header>

          {renderView()}
        </div>
      </div>

      {/* ── Export notification ── */}
      {exportNotification && (
        <div className="fixed bottom-8 right-8 z-[300] bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold">CSV файл скачан успешно!</span>
        </div>
      )}

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

      {/* Add Staff Modal */}
      <Modal isOpen={addStaffModal} onClose={() => setAddStaffModal(false)} title="Добавить сотрудника">
        <form onSubmit={handleAddStaff} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2">ФИО сотрудника</label>
            <input
              className="w-full p-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Введите ФИО..."
              value={newStaffForm.name}
              onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Должность</label>
            <select
              className="w-full p-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary"
              value={newStaffForm.role}
              onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
            >
              <option value="Помощник">Помощник</option>
              <option value="Оператор">Оператор</option>
              <option value="Координатор">Координатор</option>
              <option value="Старший сотрудник">Старший сотрудник</option>
              <option value="Специалист по доступности">Специалист по доступности</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Зона</label>
            <select
              className="w-full p-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary"
              value={newStaffForm.zone}
              onChange={(e) => setNewStaffForm({ ...newStaffForm, zone: e.target.value })}
            >
              <option value="Терминал A">Терминал A</option>
              <option value="Терминал B">Терминал B</option>
              <option value="Терминал C">Терминал C</option>
              <option value="Терминал D">Терминал D</option>
              <option value="Зона выдачи багажа">Зона выдачи багажа</option>
              <option value="Зона безопасности">Зона безопасности</option>
              <option value="Главный зал">Главный зал</option>
            </select>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            <span className="material-symbols-outlined text-lg">person_add</span>
            ДОБАВИТЬ СОТРУДНИКА
          </Button>
        </form>
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
              <p className="font-bold">Чат с техподдержкой</p>
              <p className="text-sm text-on-surface-variant">Время ответа ~2 мин</p>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">description</span>
            <div>
              <p className="font-bold">База знаний</p>
              <p className="text-sm text-on-surface-variant">Инструкции и руководства</p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">Версия системы: AeroAssist Pro v2.1.0 • Обновлено 31.03.2026</p>
        </div>
      </Modal>

      {/* Logout Confirm */}
      <Modal isOpen={logoutConfirm} onClose={() => setLogoutConfirm(false)} title="Выход из системы">
        <div className="space-y-5">
          <p className="text-on-surface-variant">
            Вы уверены, что хотите выйти из консоли администратора? Все незавершённые данные будут сохранены.
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
