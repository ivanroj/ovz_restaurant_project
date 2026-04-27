import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

export default function TopNav() {
  const location = useLocation();
  const path = location.pathname;
  const staff = useStore((state) => state.staff);
  const currentStaff = staff[0];
  const notifications = useStore((state) => state.notifications);
  const markAllNotificationsRead = useStore((state) => state.markAllNotificationsRead);

  // Profile Dropdown State
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Language Dropdown State
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  // Notifications State
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };

  const getRoleName = () => {
    if (path.includes('passenger')) return 'Пассажир';
    if (path.includes('dispatcher')) return 'Старший диспетчер';
    if (path.includes('admin')) return 'Системный администратор';
    return currentStaff.name;
  };

  const navLinks = [
    { to: '/passenger', label: t('nav.passenger') },
    { to: '/staff', label: t('nav.staff') },
    { to: '/dispatcher', label: t('nav.dispatcher') },
    { to: '/admin', label: t('nav.admin') },
  ];

  return (
    <header className="bg-primary fixed top-0 w-full z-50 shadow-ambient">
      <div className="flex justify-between items-center px-6 h-20 w-full">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-white tracking-tight hover:opacity-90 transition-opacity">
            AeroAssist Pro
          </Link>
          <nav aria-label="Основная навигация" className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-lg font-bold transition-colors ${
                  path === link.to
                    ? 'text-white border-b-2 border-white pb-1'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 relative">
          
          {/* Notifications */}
          <div className="relative z-50" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`p-2 rounded-md transition-all relative active:scale-90 ${notifOpen ? 'bg-white text-primary' : 'text-white hover:bg-blue-800'}`}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error border border-primary rounded-full animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 max-g-[80vw] bg-surface-container-lowest rounded-xl shadow-ambient-lg border border-outline-variant/30 overflow-hidden text-on-surface z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex justify-between items-center">
                  <h3 className="font-bold text-sm">{t('nav.notifications')}</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {t('notifications.markAllRead')}
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_paused</span>
                      <p className="text-sm">{t('notifications.empty')}</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      let message = n.message;
                      // Dynamic translation for flight status
                      if (message === 'flightStatusChange' && n.data) {
                        message = t('notifications.flightStatusChange', { 
                          flight: n.data.flight, 
                          status: t(`passenger.board.status_${n.data.status}`) 
                        });
                      }

                      return (
                        <div key={n.id} className={`p-4 border-b border-surface-container-high hover:bg-surface-container transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                          <div className="flex gap-3">
                            <span className={`material-symbols-outlined text-xl mt-0.5 ${!n.read ? 'text-primary' : 'text-outline'}`}>
                              {n.type === 'error' ? 'error' : 'info'}
                            </span>
                            <div>
                              <p className={`text-sm ${!n.read ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                                {message}
                              </p>
                              <p className="text-xs text-outline mt-1 font-mono">
                                {new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`p-2 rounded-md font-bold text-sm tracking-widest transition-all uppercase ${langOpen ? 'bg-white text-primary' : 'text-white hover:bg-blue-800'}`}
            >
              {i18n.resolvedLanguage || 'RU'}
            </button>

            {langOpen && (
              <div className="absolute right-0 top-12 w-32 bg-surface-container-lowest rounded-xl shadow-ambient-lg border border-outline-variant/30 overflow-hidden text-on-surface z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => changeLanguage('ru')} className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-surface-container transition-colors ${i18n.resolvedLanguage === 'ru' ? 'text-primary' : ''}`}>RU - Ру</button>
                <button onClick={() => changeLanguage('en')} className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-surface-container transition-colors ${i18n.resolvedLanguage === 'en' ? 'text-primary' : ''}`}>EN - Eng</button>
                <button onClick={() => changeLanguage('zh')} className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-surface-container transition-colors ${i18n.resolvedLanguage === 'zh' ? 'text-primary' : ''}`}>ZH - 中文</button>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Профиль"
              className={`p-2 rounded-md transition-all active:scale-90 ${profileOpen ? 'bg-white text-primary' : 'text-white hover:bg-blue-800'}`}
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-64 bg-surface-container-lowest rounded-xl shadow-ambient-lg border border-outline-variant/30 overflow-hidden text-on-surface z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex gap-3 items-center">
                  <img src={currentStaff.avatar} alt="Аватар" className="w-10 h-10 rounded-full object-cover bg-primary-fixed" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{getRoleName()}</p>
                    <p className="text-xs text-on-surface-variant truncate">ID: {currentStaff.id}</p>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-container rounded-lg transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline text-lg">settings</span>
                    Настройки аккаунта
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-container rounded-lg transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline text-lg">help</span>
                    Помощь и поддержка
                  </button>
                </div>
                <div className="p-2 border-t border-surface-container-high">
                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-error hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Выйти
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden ml-2">
            <button
              aria-label="Меню"
              className="p-2 text-white hover:bg-blue-800 rounded-md"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden bg-primary border-t border-blue-800 px-6 py-4 flex flex-wrap gap-4" style={{ display: 'none' }}>
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to} className="text-white font-bold text-base">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
