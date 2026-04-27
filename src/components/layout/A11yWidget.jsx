import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { useTranslation } from 'react-i18next';

export default function A11yWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { a11y, setA11y } = useStore();
  const { t } = useTranslation();

  // Handle Text-To-Speech (Hover to Listen)
  useEffect(() => {
    if (!a11y.textToSpeech) {
      window.speechSynthesis.cancel(); // Stop speaking if disabled
      return;
    }

    const handleMouseOver = (e) => {
      // Check if we hover over text elements
      const target = e.target.closest('p, h1, h2, h3, h4, h5, h6, span, button, a, li, label');
      if (!target) return;

      // Make sure the element actually contains text
      const text = target.innerText || target.textContent;
      if (!text || text.trim().length === 0) return;

      window.speechSynthesis.cancel(); // Stop previous utterance
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = 'ru-RU';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    };

    const handleMouseOut = () => {
      window.speechSynthesis.cancel();
    };

    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseout', handleMouseOut);
      window.speechSynthesis.cancel();
    };
  }, [a11y.textToSpeech]);

  // Handle Global CSS classes
  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('a11y-large-text', a11y.largeText);
    root.classList.toggle('a11y-highlight-links', a11y.highlightLinks);
    root.classList.toggle('a11y-dyslexia', a11y.dyslexiaMode);
    root.classList.toggle('a11y-stop-animations', a11y.stopAnimations);
    root.classList.toggle('a11y-large-cursor', a11y.largeCursor);

    root.classList.remove('a11y-dark-mode', 'a11y-high-contrast');
    if (a11y.themeMode === 'dark') {
      root.classList.add('a11y-dark-mode');
    } else if (a11y.themeMode === 'contrast') {
      root.classList.add('a11y-high-contrast');
    }

  }, [a11y]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const toggleTheme = (mode) => {
    setA11y({ themeMode: mode });
  };

  const a11yOptions = [
    {
      id: 'textToSpeech',
      icon: 'record_voice_over',
      label: t('a11y.tts'),
      description: '', // tts specific desc could go here if added
      active: a11y.textToSpeech,
      action: () => setA11y({ textToSpeech: !a11y.textToSpeech }),
    },
    {
      id: 'largeText',
      icon: 'format_size',
      label: t('a11y.textSize'),
      description: '',
      active: a11y.largeText,
      action: () => setA11y({ largeText: !a11y.largeText }),
    },
    {
      id: 'dyslexiaMode',
      icon: 'spellcheck',
      label: t('a11y.dyslexia'),
      description: '',
      active: a11y.dyslexiaMode,
      action: () => setA11y({ dyslexiaMode: !a11y.dyslexiaMode }),
    },
    {
      id: 'highlightLinks',
      icon: '링크',
      materialIcon: 'link',
      label: t('a11y.highlightLinks'),
      description: '',
      active: a11y.highlightLinks,
      action: () => setA11y({ highlightLinks: !a11y.highlightLinks }),
    },
    {
      id: 'stopAnimations',
      icon: 'motion_photos_paused',
      label: t('a11y.stopAnimations'),
      description: '',
      active: a11y.stopAnimations,
      action: () => setA11y({ stopAnimations: !a11y.stopAnimations }),
    },
    {
      id: 'largeCursor',
      icon: 'ads_click',
      label: t('a11y.largeCursor'),
      description: '',
      active: a11y.largeCursor,
      action: () => setA11y({ largeCursor: !a11y.largeCursor }),
    },
  ];

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[9999]">
        <button
          onClick={toggleOpen}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-ambient-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 accessibility-focus focus:outline-4 focus:outline-offset-4 focus:outline-tertiary"
          aria-label="Настройки доступности"
          title="Настройки доступности (Для людей с ОВЗ)"
        >
          <span className="material-symbols-outlined text-3xl">accessibility_new</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 left-6 z-[9999] w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-ambient-lg border-2 border-primary/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">universal_currency_alt</span>
              <h2 className="text-lg font-black tracking-tight">{t('a11y.widgetTitle')}</h2>
            </div>
            <button
              onClick={toggleOpen}
              className="text-white hover:bg-white/20 p-2 rounded transition-colors"
              aria-label="Закрыть панель доступности"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="overflow-y-auto p-4 space-y-6 flex-1">
            
            {/* Contrast Profiles */}
            <div>
              <h3 className="text-sm font-bold text-outline uppercase tracking-widest mb-3">{t('a11y.display')}</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => toggleTheme('normal')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    a11y.themeMode === 'normal'
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                      : 'border-surface-variant hover:border-outline'
                  }`}
                  aria-pressed={a11y.themeMode === 'normal'}
                >
                  <span className="material-symbols-outlined mb-1">light_mode</span>
                  <span className="text-xs font-bold">{t('a11y.normal')}</span>
                </button>
                <button
                  onClick={() => toggleTheme('dark')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    a11y.themeMode === 'dark'
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                      : 'border-surface-variant hover:border-outline'
                  }`}
                  aria-pressed={a11y.themeMode === 'dark'}
                >
                  <span className="material-symbols-outlined mb-1">dark_mode</span>
                  <span className="text-xs font-bold">{t('a11y.darkTheme')}</span>
                </button>
                <button
                  onClick={() => toggleTheme('contrast')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    a11y.themeMode === 'contrast'
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                      : 'border-surface-variant hover:border-outline'
                  }`}
                  aria-pressed={a11y.themeMode === 'contrast'}
                >
                  <span className="material-symbols-outlined mb-1">contrast</span>
                  <span className="text-xs font-bold">{t('a11y.highContrast')}</span>
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-surface-container-high" />

            {/* Individual Features */}
            <div>
              <h3 className="text-sm font-bold text-outline uppercase tracking-widest mb-3">{t('a11y.presets')}</h3>
              <div className="space-y-2">
                {a11yOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={opt.action}
                    aria-pressed={opt.active}
                    className={`w-full flex items-start gap-4 p-3 rounded-xl border-2 transition-all text-left ${
                      opt.active
                        ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                        : 'border-surface-variant bg-surface hover:border-outline'
                    }`}
                  >
                    <span className={`material-symbols-outlined mt-1 ${opt.active ? 'text-primary' : 'text-outline'}`}>
                      {opt.materialIcon || opt.icon}
                    </span>
                    <div className="flex-1">
                      <p className={`font-bold ${opt.active ? 'text-on-primary-fixed' : 'text-on-surface'}`}>{opt.label}</p>
                      <p className={`text-xs ${opt.active ? 'text-on-primary-fixed-variant' : 'text-on-surface-variant'}`}>
                        {opt.description}
                      </p>
                    </div>
                    {/* Switch Indicator */}
                    <div className={`w-10 h-6 shrink-0 rounded-full p-1 transition-colors mt-1 ${
                      opt.active ? 'bg-primary' : 'bg-surface-variant'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        opt.active ? 'translate-x-4 shadow-sm' : 'translate-x-0'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-surface-container-high" />

            <button
              onClick={() => {
                setA11y({
                  largeText: false,
                  themeMode: 'normal',
                  highlightLinks: false,
                  dyslexiaMode: false,
                  stopAnimations: false,
                  largeCursor: false,
                  textToSpeech: false,
                });
                window.speechSynthesis.cancel();
              }}
              className="w-full py-3 text-center text-error font-bold rounded-xl hover:bg-error-container hover:text-on-error transition-colors"
            >
              {t('a11y.reset')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
