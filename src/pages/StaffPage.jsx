import { useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import PageLayout from '../components/layout/PageLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TerminalMap from '../components/passenger/TerminalMap';
import { knowledgeBase } from '../data/mockData';

// ─── Sidebar Tabs ───
const sideNavItems = [
  { id: 'tasks', icon: 'checklist', label: 'Мои задачи' },
  { id: 'map', icon: 'map', label: 'Навигатор' },
  { id: 'knowledge', icon: 'menu_book', label: 'База знаний' },
];

const typeIcons = {
  wheelchair: 'accessible',
  escort: 'explore',
  food: 'restaurant',
  sos: 'emergency_share',
};

const typeColors = {
  wheelchair: 'bg-primary-container text-on-primary-container',
  escort: 'bg-secondary-container text-on-secondary-container',
  food: 'bg-tertiary/10 text-tertiary',
  sos: 'bg-error text-on-error',
};

export default function StaffPage() {
  const { requests, staff, acceptRequest, updateRequestStatus } = useStore();
  const [activeTab, setActiveTab] = useState('tasks');
  const currentStaff = staff[0]; // Simulating logged-in staff

  const activeRequests = requests.filter((r) => r.status !== 'completed');
  const myTasks = requests.filter((r) => r.assignedStaff === currentStaff.id);
  const newRequests = requests.filter((r) => r.status === 'new');

  const formatTime = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'Только что';
    return `${mins} мин. назад`;
  };

  // ─── Sidebar Component (inline for tab control) ───
  const SidebarContent = () => (
    <aside className="h-[calc(100vh-5rem)] w-72 fixed left-0 top-20 bg-surface-container-low flex flex-col py-8 pl-4 space-y-2 z-40 hidden lg:flex">
      <div className="mb-8 px-4">
        <h2 className="text-primary font-bold text-sm uppercase tracking-widest">Рабочий терминал</h2>
        <p className="text-outline text-xs mt-1">{currentStaff.name}</p>
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
            {item.id === 'tasks' && myTasks.length > 0 && (
              <span className="ml-auto bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {myTasks.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pr-4 space-y-2 pb-8">
        <Link
          to="/"
          className="w-full flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Завершить смену</span>
        </Link>
      </div>
    </aside>
  );

  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-5rem)]">
        <SidebarContent />

        {/* Main Content */}
        <div className="flex-1 lg:ml-72 p-6 md:p-12 max-w-7xl mx-auto w-full">
          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <p className="text-primary font-bold tracking-widest text-xs uppercase mb-2">Сотрудник службы Assist</p>
                <h1 className="text-4xl font-black text-on-surface tracking-tight">Рабочая панель</h1>
              </div>
              <div className="flex gap-4">
                <div className="bg-surface-container-low px-6 py-3 rounded-xl flex items-center gap-4">
                  <div className="text-right">
                    <p className="label-sm text-on-surface-variant">Мои задачи</p>
                    <p className="text-lg font-bold text-primary">{myTasks.length} акт.</p>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/30" />
                  <div className="text-right">
                    <p className="label-sm text-on-surface-variant">Ожидают в очереди</p>
                    <p className="text-lg font-bold text-tertiary">{newRequests.length} запр.</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-on-surface mb-6">Текущие назначения</h2>
              {/* Show user's active tasks first, then available new tasks */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {activeRequests.map((req) => {
                  const isMine = req.assignedStaff === currentStaff.id;
                  const isAvailable = req.status === 'new';
                  
                  if (!isMine && !isAvailable) return null; // Show only mine or unassigned
                  
                  return (
                    <div
                      key={req.id}
                      className={`rounded-2xl p-8 flex flex-col gap-6 transition-all ${
                        isMine
                          ? 'bg-surface-container-low border-l-4 border-primary'
                          : req.type === 'sos'
                          ? 'bg-error-container shadow-sos border-l-4 border-error'
                          : 'bg-surface-container-lowest shadow-ambient border-l-4 border-transparent hover:border-tertiary shadow-ambient-lg'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${typeColors[req.type] || 'bg-primary-container text-on-primary-container'}`}>
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {typeIcons[req.type] || 'help'}
                            </span>
                          </div>
                          <div>
                            <Badge type={req.status} className="mb-1" />
                            <h3 className="text-2xl font-bold text-on-surface">{req.typeLabel}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-on-surface-variant font-medium">{formatTime(req.createdAt)}</p>
                          <p className={`font-bold ${req.priority === 'A' ? 'text-error' : req.priority === 'B' ? 'text-primary' : 'text-tertiary'}`}>
                            Приоритет {req.priority}
                          </p>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="grid grid-cols-2 gap-y-4 py-6 border-y border-surface-container">
                        <div>
                          <p className="label-sm text-on-surface-variant mb-1">Пассажир</p>
                          <p className="text-lg font-semibold">{req.passenger}</p>
                        </div>
                        <div>
                          <p className="label-sm text-on-surface-variant mb-1">Место встречи</p>
                          <p className="text-lg font-semibold flex items-center gap-1 text-secondary">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            {req.location}
                          </p>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex gap-3">
                        {req.status === 'new' && (
                          <Button
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            onClick={() => acceptRequest(req.id, currentStaff.id)}
                          >
                            Принять запрос
                          </Button>
                        )}
                        {req.status === 'accepted' && req.assignedStaff === currentStaff.id && (
                          <Button
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            onClick={() => updateRequestStatus(req.id, 'in_progress')}
                          >
                            Я на месте (в работу)
                          </Button>
                        )}
                        {req.status === 'in_progress' && req.assignedStaff === currentStaff.id && (
                          <Button
                            variant="secondary"
                            size="lg"
                            className="flex-1"
                            onClick={() => updateRequestStatus(req.id, 'completed')}
                          >
                            Завершить заказ
                          </Button>
                        )}
                        <Button variant="outline" size="lg" onClick={() => setActiveTab('map')}>
                          <span className="material-symbols-outlined mr-2">map</span>
                          Карта
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {activeRequests.filter(r => r.assignedStaff === currentStaff.id || r.status === 'new').length === 0 && (
                  <div className="col-span-2 text-center py-20 bg-surface-container-lowest rounded-2xl shadow-ambient">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '4rem' }}>check_circle</span>
                    <p className="text-2xl font-bold text-on-surface-variant mt-4">Нет активных или новых запросов</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-on-surface">Навигатор по терминалу</h2>
              <TerminalMap />
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6 max-w-4xl">
              <h2 className="text-2xl font-black text-on-surface mb-6">База знаний и регламенты</h2>
              <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-outline">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-on-surface text-lg"
                  placeholder="Поиск по регламентам и контактам..."
                  type="text"
                />
              </div>

              {knowledgeBase.map((item) => (
                <div
                  key={item.id}
                  className={`bg-surface-container-lowest p-6 rounded-xl border-l-4 shadow-ambient hover:shadow-ambient-lg transition-shadow ${
                    item.categoryColor === 'primary' ? 'border-primary' :
                    item.categoryColor === 'secondary' ? 'border-secondary' : 'border-tertiary'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded mb-2 ${
                        item.categoryColor === 'primary' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                        item.categoryColor === 'secondary' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' :
                        'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      }`}>
                        {item.category}
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>
                    <span className={`material-symbols-outlined ${
                      item.categoryColor === 'primary' ? 'text-primary' :
                      item.categoryColor === 'secondary' ? 'text-secondary' : 'text-tertiary'
                    }`}>{item.icon}</span>
                  </div>

                  {item.content && (
                    <p className="text-on-surface-variant mb-4 leading-relaxed">{item.content}</p>
                  )}

                  {item.contacts && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.contacts.map((c) => (
                        <div key={c.code} className="p-3 bg-surface-container-low rounded-lg flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-tertiary">{c.code}</div>
                          <div>
                            <p className="label-sm text-outline">{c.label}</p>
                            <p className="font-bold">{c.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
