export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-surface-container-high mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8">
        <div className="flex flex-col gap-1 mb-4 md:mb-0">
          <span className="font-bold text-primary">AeroAssist Pro</span>
          <p className="text-sm text-outline">© 2026 AeroAssist Pro — Система «Architectural Wayfinder»</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6" aria-label="Ссылки подвала">
          <a href="#" className="text-sm text-outline hover:text-primary underline transition-colors">Экстренный протокол</a>
          <a href="#" className="text-sm text-outline hover:text-primary underline transition-colors">Связаться с диспетчером</a>
          <a href="#" className="text-sm text-outline hover:text-primary underline transition-colors">Политика конфиденциальности</a>
          <a href="#" className="text-sm text-outline hover:text-primary underline transition-colors">Условия использования</a>
        </nav>
      </div>
    </footer>
  );
}
