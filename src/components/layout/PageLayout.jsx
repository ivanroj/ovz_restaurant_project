import TopNav from './TopNav';
import SideNav from './SideNav';
import Footer from './Footer';
import A11yWidget from './A11yWidget';

export default function PageLayout({ children, sidebar = false, sidebarProps = {} }) {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      <TopNav />
      {/* Global Accessibility Widget */}
      <A11yWidget />
      <div className="flex flex-1 pt-20">
        {sidebar && <SideNav {...sidebarProps} />}
        <main className={`flex-1 ${sidebar ? 'lg:ml-72' : ''} min-h-[calc(100vh-5rem)]`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
