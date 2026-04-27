import { useState, useRef, useEffect } from 'react';
import {
  monthlyRequestVolume,
  satisfactionByCategory,
  satisfactionTrend,
  weeklyPattern,
  staffPerformance,
  hourlyDistribution,
  responseTimeDistribution,
  zoneLoad,
} from '../../data/analyticsData';

const API_KEY_STORAGE = 'aeroassist_openrouter_key';
const DEFAULT_API_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-coder:free',
];

// Build a context summary from real analytics data
function buildAnalyticsContext() {
  const totalRequests = monthlyRequestVolume.reduce((s, m) => s + m.total, 0);
  const avgRating = (satisfactionTrend.reduce((s, m) => s + m.avgRating, 0) / satisfactionTrend.length).toFixed(2);
  const peakHour = hourlyDistribution.reduce((max, h) => h.requests > max.requests ? h : max, hourlyDistribution[0]);

  return `
## Данные об операциях аэропорта (система AeroAssist Pro — помощь пассажирам с ОВЗ)

### Общая статистика за 6 месяцев (Окт–Мар):
- Всего запросов помощи: ${totalRequests}
- Средний рейтинг удовлетворённости: ${avgRating}/5.0
- Час пик нагрузки: ${peakHour.hour} (${peakHour.requests} запросов)

### Помесячный объём запросов:
${monthlyRequestVolume.map(m => `- ${m.month}: кресло=${m.wheelchair}, сопровожд.=${m.escort}, питание=${m.food}, SOS=${m.sos}, итого=${m.total}`).join('\n')}

### Удовлетворённость по категориям ОВЗ (коды ICAO):
${satisfactionByCategory.map(c => `- ${c.code} (${c.label}): рейтинг ${c.avgRating}/5.0, ${c.totalReviews} отзывов, тренд ${c.trend > 0 ? '+' : ''}${c.trend}`).join('\n')}

### Тренд рейтинга по месяцам:
${satisfactionTrend.map(m => `- ${m.month}: ${m.avgRating} (${m.reviews} отзывов)`).join('\n')}

### Нагрузка по дням недели:
${weeklyPattern.map(d => `- ${d.day}: кресло=${d.wheelchair}, сопровожд.=${d.escort}, питание=${d.food}, SOS=${d.sos}`).join('\n')}

### Производительность сотрудников (последний месяц — Март):
${staffPerformance.map(s => {
    const last = s.monthly[s.monthly.length - 1];
    return `- ${s.name}: выполнено ${last.completed} запросов, среднее время ${last.avgTime} мин, рейтинг ${s.satisfaction}/5.0`;
  }).join('\n')}

### Время ответа (распределение):
${responseTimeDistribution.map(r => `- ${r.range}: ${r.count} запросов`).join('\n')}

### Нагрузка по зонам терминала:
${zoneLoad.map(z => `- ${z.zone}: ${z.requests} запросов, ${z.staff} сотрудников, среднее ожидание ${z.avgWait} мин`).join('\n')}
`.trim();
}

const SYSTEM_PROMPT = `Ты — ИИ-аналитик системы AeroAssist Pro, которая помогает пассажирам с ОВЗ (ограниченными возможностями здоровья) в аэропорту. 
Твоя задача — анализировать операционные данные и давать конкретные, практичные рекомендации по улучшению качества обслуживания.
Отвечай на русском языке. Будь конкретным — используй цифры из предоставленных данных. 
Структурируй ответ: используй заголовки, списки, выделяй самое важное.
Если даёшь рекомендации — обосновывай их данными.`;

const QUICK_PROMPTS = [
  {
    icon: 'auto_awesome',
    label: 'Общий анализ',
    prompt: 'Проведи общий анализ операционных данных. Выяви ключевые тренды, проблемные зоны и точки роста. Дай 3-5 конкретных рекомендаций.',
  },
  {
    icon: 'schedule',
    label: 'Оптимизация смен',
    prompt: 'На основе данных о нагрузке по часам и дням недели, предложи оптимальное расписание смен сотрудников. Укажи, в какие дни и часы нужно больше персонала.',
  },
  {
    icon: 'sentiment_dissatisfied',
    label: 'Проблемы качества',
    prompt: 'Проанализируй удовлетворённость пассажиров по категориям ОВЗ. Какие категории имеют самый низкий рейтинг? Что может быть причиной? Предложи меры по улучшению.',
  },
  {
    icon: 'group',
    label: 'Оценка персонала',
    prompt: 'Оцени производительность каждого сотрудника. Кто лучший, кто отстаёт? Какие конкретные действия повысят эффективность команды?',
  },
  {
    icon: 'trending_up',
    label: 'Прогноз нагрузки',
    prompt: 'На основе тренда за 6 месяцев спрогнози нагрузку на следующий квартал. Какие ресурсы нужно подготовить?',
  },
];

export default function AiAssistant() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || DEFAULT_API_KEY);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);
  const textareaRef = useRef(null);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
    setShowKeyInput(false);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendToAI = async (prompt) => {
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    const analyticsContext = buildAnalyticsContext();
    const userMessage = { role: 'user', content: prompt, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setUserPrompt('');
    setIsLoading(true);
    setError(null);

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Вот актуальные данные нашей системы:\n\n${analyticsContext}` },
      // Include previous messages for context (last 6 messages)
      ...messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: prompt },
    ];

    let lastError = null;

    // Try each model with fallback
    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'AeroAssist Pro',
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData.error?.message || `${response.status}`;
          // If rate-limited or not found, try next model
          if (response.status === 429 || response.status === 404) {
            console.warn(`Model ${model} unavailable: ${errMsg}, trying next...`);
            lastError = errMsg;
            continue;
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          lastError = 'Пустой ответ от модели';
          continue;
        }

        const usedModel = data.model || model;
        const assistantMessage = {
          role: 'assistant',
          content,
          timestamp: Date.now(),
          tokens: data.usage?.total_tokens,
          model: usedModel.replace(':free', '').split('/').pop(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        return; // success — stop trying models
      } catch (err) {
        console.warn(`Model ${model} error:`, err.message);
        lastError = err.message;
        continue;
      }
    }

    // All models failed
    console.error('All models failed:', lastError);
    setError(`Все модели временно недоступны. Последняя ошибка: ${lastError}`);
    setMessages(prev => prev.slice(0, -1));
    setIsLoading(false);
    return;
  };

  // Ensure loading is cleared on success too
  const sendToAIWrapped = async (prompt) => {
    try {
      await sendToAI(prompt);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userPrompt.trim() || isLoading) return;
    sendToAIWrapped(userPrompt.trim());
  };

  const clearHistory = () => {
    setMessages([]);
    setError(null);
  };

  // Simple markdown-to-HTML renderer
  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Headers
      .replace(/^### (.+)$/gm, '<h4 class="font-bold text-on-surface mt-4 mb-2 text-base">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="font-bold text-on-surface mt-5 mb-2 text-lg">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="font-black text-on-surface mt-6 mb-3 text-xl">$1</h2>')
      // Lists
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm leading-relaxed">$2</li>')
      // Code inline
      .replace(/`(.+?)`/g, '<code class="bg-surface-container-high px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p class="text-sm leading-relaxed text-on-surface-variant mb-2">')
      // Single newlines
      .replace(/\n/g, '<br/>');

    return `<p class="text-sm leading-relaxed text-on-surface-variant mb-2">${html}</p>`;
  };

  return (
    <div className="space-y-6">
      {/* API Key Setup Banner */}
      {!apiKey && (
        <div className="bg-gradient-to-br from-tertiary/10 to-tertiary-fixed/30 rounded-2xl p-6 border border-tertiary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary">key</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-on-surface mb-1">Требуется API-ключ OpenRouter</h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Для работы ИИ-ассистента необходим API-ключ OpenRouter (бесплатный доступ к DeepSeek). Получите его на{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">
                  openrouter.ai
                </a>
              </p>
              <button
                onClick={() => setShowKeyInput(true)}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                Ввести API-ключ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Input Modal */}
      {showKeyInput && (
        <div className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowKeyInput(false)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">key</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">API-ключ OpenRouter</h3>
                <p className="text-xs text-on-surface-variant">Ключ хранится только в вашем браузере</p>
              </div>
            </div>
            <input
              type="password"
              placeholder="sk-or-v1-..."
              defaultValue={apiKey}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm mb-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveApiKey(e.target.value.trim());
              }}
              id="deepseek-api-key-input"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const input = document.getElementById('deepseek-api-key-input');
                  saveApiKey(input.value.trim());
                }}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowKeyInput(false)}
                className="px-4 py-3 bg-surface-container-high text-on-surface-variant rounded-xl font-bold text-sm hover:bg-surface-variant transition-colors"
              >
                Отмена
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">lock</span>
              Ключ хранится локально в localStorage и никуда не отправляется кроме API OpenRouter
            </p>
          </div>
        </div>
      )}

      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-lg">ИИ-ассистент</h3>
            <p className="text-xs text-on-surface-variant">DeepSeek via OpenRouter • Анализ операционных данных</p>
          </div>
        </div>
        <div className="flex gap-2">
          {apiKey && (
            <button
              onClick={() => setShowKeyInput(true)}
              className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-variant transition-colors text-on-surface-variant"
              title="Изменить API-ключ"
            >
              <span className="material-symbols-outlined text-lg">key</span>
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-variant transition-colors text-on-surface-variant"
              title="Очистить историю"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompt Buttons */}
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">Быстрые запросы</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              onClick={() => sendToAIWrapped(qp.prompt)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-sm font-medium text-on-surface hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-ambient"
            >
              <span className="material-symbols-outlined text-lg">{qp.icon}</span>
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={responseRef}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-ambient overflow-y-auto"
        style={{ maxHeight: '500px', minHeight: messages.length > 0 || isLoading ? '300px' : '120px' }}
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant/40 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              neurology
            </span>
            <p className="text-on-surface-variant font-medium mb-1">Задайте вопрос или выберите быстрый запрос</p>
            <p className="text-xs text-outline">ИИ получит актуальные данные вашей системы для анализа</p>
          </div>
        )}

        <div className="p-5 space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-surface-container-low rounded-bl-md'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <div
                    className="prose-sm"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                )}
                {(msg.tokens || msg.model) && (
                  <p className="text-[9px] text-on-surface-variant/50 mt-2 text-right">
                    {msg.model && <span>{msg.model}</span>}
                    {msg.tokens && <span> • {msg.tokens} tokens</span>}
                  </p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-tertiary/15 flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-tertiary text-sm">person</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-white text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div className="bg-surface-container-low rounded-2xl rounded-bl-md px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-on-surface-variant">Анализирую данные...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error text-sm">error</span>
              </div>
              <div className="bg-error/5 border border-error/20 rounded-2xl rounded-bl-md px-5 py-4 max-w-[85%]">
                <p className="text-sm font-bold text-error mb-1">Ошибка</p>
                <p className="text-xs text-on-surface-variant">{error}</p>
                {error.includes('401') && (
                  <button
                    onClick={() => setShowKeyInput(true)}
                    className="mt-2 text-xs text-primary font-bold underline"
                  >
                    Обновить API-ключ
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Задайте вопрос об операционных данных..."
              rows={2}
              disabled={isLoading}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-5 py-4 pr-14 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 placeholder:text-outline"
            />
            <button
              type="submit"
              disabled={!userPrompt.trim() || isLoading}
              className="absolute right-3 bottom-3 w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-outline mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[10px]">info</span>
          ИИ анализирует реальные данные системы AeroAssist Pro • Enter для отправки, Shift+Enter для новой строки
        </p>
      </form>
    </div>
  );
}
