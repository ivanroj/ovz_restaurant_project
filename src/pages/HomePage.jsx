import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { useTranslation } from 'react-i18next';

// Function to get translated roles later inside the component
const getRoles = (t) => [
  { to: '/passenger', icon: 'person', label: t('roles.passenger'), desc: t('roles.passengerDesc'), color: 'bg-primary-container text-on-primary-container' },
  { to: '/staff', icon: 'badge', label: t('roles.staff'), desc: t('roles.staffDesc'), color: 'bg-secondary-container text-on-secondary-container' },
  { to: '/dispatcher', icon: 'hub', label: t('roles.dispatcher'), desc: t('roles.dispatcherDesc'), color: 'bg-tertiary-container text-on-tertiary-container' },
  { to: '/admin', icon: 'admin_panel_settings', label: t('roles.admin'), desc: t('roles.adminDesc'), color: 'bg-primary text-on-primary' },
];

export default function HomePage() {
  const { t } = useTranslation();
  const roles = getRoles(t);

  return (
    <PageLayout>
      <div className="flex-grow px-4 md:px-12 py-16 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <section className="mb-20 text-center">
          <div className="mb-8">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '4rem', fontVariationSettings: "'FILL' 1" }}>
              flight_takeoff
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tight mb-6">
            AeroAssist Pro
          </h1>
          <p className="text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>
          <p className="text-lg text-outline mt-4 max-w-xl mx-auto">
            {t('home.instruction')}
          </p>
        </section>

        {/* Role Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roles.map((role) => (
            <Link
              key={role.to}
              to={role.to}
              className={`group flex flex-col items-center justify-center p-10 ${role.color} rounded-2xl shadow-ambient hover:shadow-ambient-lg border-4 border-transparent hover:border-white/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 min-h-[220px]`}
            >
              <span className="material-symbols-outlined mb-4" style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1" }}>
                {role.icon}
              </span>
              <span className="text-3xl font-black uppercase tracking-wide mb-3">{role.label}</span>
              <span className="text-base opacity-80 text-center font-medium">{role.desc}</span>
            </Link>
          ))}
        </section>

        {/* Features */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: 'accessibility_new', title: t('home.featWcagTitle'), desc: t('home.featWcagDesc') },
            { icon: 'sync', title: t('home.featRealtimeTitle'), desc: t('home.featRealtimeDesc') },
            { icon: 'restaurant', title: t('home.featServiceTitle'), desc: t('home.featServiceDesc') },
          ].map((feat) => (
            <div key={feat.title} className="bg-surface-container-lowest p-8 rounded-2xl shadow-ambient text-center">
              <span className="material-symbols-outlined text-primary mb-4" style={{ fontSize: '2.5rem' }}>{feat.icon}</span>
              <h3 className="font-black text-lg mb-2">{feat.title}</h3>
              <p className="text-on-surface-variant">{feat.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}
