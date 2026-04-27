import { Link, useLocation } from 'react-router-dom';

const sideNavItems = [
  { to: '', icon: 'dashboard', label: 'Дашборд' },
  { to: '/requests', icon: 'pending_actions', label: 'Запросы' },
  { to: '/staffing', icon: 'group', label: 'Персонал' },
  { to: '/map', icon: 'map', label: 'Карта терминала' },
  { to: '/reports', icon: 'assessment', label: 'Отчёты' },
];

export default function SideNav({ basePath = '/admin', title = 'Консоль администратора', subtitle = 'Терминал A' }) {
  const location = useLocation();

  return (
    <aside className="h-[calc(100vh-5rem)] w-72 fixed left-0 top-20 bg-surface-container-low flex flex-col py-8 pl-4 space-y-2 z-40 hidden lg:flex">
      <div className="mb-8 px-4">
        <h2 className="text-primary font-bold text-sm uppercase tracking-widest">{title}</h2>
        <p className="text-outline text-xs mt-1">{subtitle}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {sideNavItems.map((item) => {
          const fullPath = basePath + item.to;
          const isActive = location.pathname === fullPath || (item.to === '' && location.pathname === basePath);
          return (
            <Link
              key={item.label}
              to={fullPath}
              className={`flex items-center gap-3 py-3 px-4 rounded-l-xl transition-all duration-200 ${
                isActive
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pr-4 space-y-2 pb-8">
        <button className="w-full bg-primary text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-ambient hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm">
          <span className="material-symbols-outlined text-lg">add</span>
          Новый запрос
        </button>
        <Link to="/" className="flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">help</span>
          <span className="font-medium">Поддержка</span>
        </Link>
        <Link to="/" className="flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:text-error transition-colors">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Выход</span>
        </Link>
      </div>
    </aside>
  );
}
