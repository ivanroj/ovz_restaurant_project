import { useState } from 'react';
import AiAssistant from './AiAssistant';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

import {
  monthlyRequestVolume,
  hourlyDistribution,
  satisfactionByCategory,
  satisfactionTrend,
  weeklyPattern,
  staffPerformance,
  heatmapData,
  aiInsights,
  responseTimeDistribution,
  zoneLoad,
} from '../../data/analyticsData';

const COLORS = {
  primary: '#0f3a9f',
  secondary: '#0453cd',
  tertiary: '#693600',
  error: '#ba1a1a',
  green: '#16a34a',
  wheelchair: '#0f3a9f',
  escort: '#0453cd',
  food: '#693600',
  sos: '#ba1a1a',
};

const PIE_COLORS = ['#0f3a9f', '#3154b8', '#0453cd', '#356ee7', '#693600', '#8b4a00'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl p-4 shadow-ambient-lg border border-outline-variant/20 text-sm">
      <p className="font-bold text-on-surface mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-on-surface-variant">{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Heatmap Component ───
function HeatmapChart() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const hours = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);
  const maxVal = Math.max(...heatmapData.map(d => d[2]));

  const getColor = (val) => {
    const intensity = val / maxVal;
    if (intensity === 0) return 'rgba(15, 58, 159, 0.03)';
    if (intensity < 0.25) return 'rgba(15, 58, 159, 0.12)';
    if (intensity < 0.5) return 'rgba(15, 58, 159, 0.3)';
    if (intensity < 0.75) return 'rgba(15, 58, 159, 0.55)';
    return 'rgba(15, 58, 159, 0.85)';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* X-axis labels (hours) */}
        <div className="flex ml-12 mb-1">
          {hours.map((h, i) => (
            <div key={i} className="flex-1 text-center text-[9px] font-bold text-on-surface-variant">
              {i % 2 === 0 ? h.slice(0, 2) : ''}
            </div>
          ))}
        </div>

        {days.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <span className="w-10 text-right text-xs font-bold text-on-surface-variant pr-2">{day}</span>
            <div className="flex flex-1 gap-[2px]">
              {hours.map((_, hourIdx) => {
                const entry = heatmapData.find(d => d[0] === dayIdx && d[1] === hourIdx + 6);
                const val = entry ? entry[2] : 0;
                return (
                  <div
                    key={hourIdx}
                    className="flex-1 h-7 rounded-[3px] transition-all hover:scale-110 hover:z-10 cursor-pointer relative group"
                    style={{ backgroundColor: getColor(val) }}
                    title={`${day} ${hours[hourIdx]}: ${val} запросов`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                      <div className="glass-panel px-2 py-1 rounded-lg shadow-lg text-[10px] font-bold whitespace-nowrap border border-outline-variant/20">
                        {val} запр.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-[10px] text-on-surface-variant">Меньше</span>
          {[0.03, 0.12, 0.3, 0.55, 0.85].map((opacity, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-[2px]"
              style={{ backgroundColor: `rgba(15, 58, 159, ${opacity})` }}
            />
          ))}
          <span className="text-[10px] text-on-surface-variant">Больше</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI Insight Card ───
function InsightCard({ insight }) {
  const severityStyles = {
    high: 'border-l-error bg-error/5',
    medium: 'border-l-tertiary bg-tertiary-fixed/30',
    low: 'border-l-green-500 bg-green-50',
  };

  return (
    <div className={`border-l-4 rounded-xl p-5 ${severityStyles[insight.severity]} transition-all hover:shadow-ambient cursor-pointer`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          insight.severity === 'high' ? 'bg-error/10 text-error' :
          insight.severity === 'medium' ? 'bg-tertiary-fixed text-tertiary' :
          'bg-green-100 text-green-700'
        }`}>
          <span className="material-symbols-outlined">{insight.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-bold text-on-surface">{insight.title}</h4>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              insight.severity === 'high' ? 'bg-error/10 text-error' :
              insight.severity === 'medium' ? 'bg-tertiary-fixed text-tertiary' :
              'bg-green-100 text-green-700'
            }`}>
              {insight.type === 'correlation' ? 'КОРРЕЛЯЦИЯ' :
               insight.type === 'pattern' ? 'ПАТТЕРН' :
               insight.type === 'satisfaction' ? 'УДОВЛЕТВОРЁННОСТЬ' :
               insight.type === 'efficiency' ? 'ЭФФЕКТИВНОСТЬ' : 'ПРОГНОЗ'}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">{insight.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-black ${
            insight.severity === 'high' ? 'text-error' :
            insight.severity === 'medium' ? 'text-tertiary' :
            'text-green-600'
          }`}>{insight.metric}</p>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase">{insight.metricLabel}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Analytics Dashboard Component ───
export default function AdvancedAnalytics() {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6m');

  const subTabs = [
    { id: 'overview', label: 'Обзор', icon: 'dashboard' },
    { id: 'requests', label: 'Нагрузка', icon: 'bar_chart' },
    { id: 'satisfaction', label: 'Удовлетворённость', icon: 'sentiment_satisfied' },
    { id: 'staff', label: 'Персонал', icon: 'group' },
    { id: 'insights', label: 'ИИ-инсайты', icon: 'auto_awesome' },
  ];

  // KPI calculations
  const totalRequests = monthlyRequestVolume.reduce((sum, m) => sum + m.total, 0);
  const avgSatisfaction = (satisfactionTrend.reduce((sum, m) => sum + m.avgRating, 0) / satisfactionTrend.length).toFixed(1);
  const totalReviews = satisfactionByCategory.reduce((sum, c) => sum + c.totalReviews, 0);
  const peakHour = hourlyDistribution.reduce((max, h) => h.requests > max.requests ? h : max, hourlyDistribution[0]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            Расширенная аналитика
          </h2>
          <p className="text-on-surface-variant mt-1">Углублённый анализ данных за 6 месяцев • Модуль средней концепции</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-surface-container-low rounded-xl p-1">
            {[
              { id: '1m', label: '1 мес' },
              { id: '3m', label: '3 мес' },
              { id: '6m', label: '6 мес' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  timeRange === t.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="p-2 bg-surface-container-high rounded-xl hover:bg-surface-variant transition-colors" title="Скачать отчёт">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-primary text-white shadow-ambient'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeSubTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient relative overflow-hidden group hover:shadow-ambient-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
              <span className="material-symbols-outlined text-primary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
              <p className="text-3xl font-black text-on-surface">{totalRequests}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Запросов за 6 мес.</p>
              <p className="text-xs text-green-600 font-bold mt-2">↑ 12% рост</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient relative overflow-hidden group hover:shadow-ambient-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
              <span className="material-symbols-outlined text-green-600 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <p className="text-3xl font-black text-on-surface">{avgSatisfaction}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Средний рейтинг</p>
              <p className="text-xs text-green-600 font-bold mt-2">↑ +0.5 за квартал</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient relative overflow-hidden group hover:shadow-ambient-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
              <span className="material-symbols-outlined text-tertiary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <p className="text-3xl font-black text-on-surface">{peakHour.hour}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Час пик</p>
              <p className="text-xs text-tertiary font-bold mt-2">{peakHour.requests} запр./день</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient relative overflow-hidden group hover:shadow-ambient-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
              <span className="material-symbols-outlined text-secondary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>reviews</span>
              <p className="text-3xl font-black text-on-surface">{totalReviews}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Отзывов собрано</p>
              <p className="text-xs text-green-600 font-bold mt-2">267 за последние 6 мес.</p>
            </div>
          </div>

          {/* Main Chart: Request Volume Trend */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Динамика запросов по категориям</h3>
            <p className="text-sm text-on-surface-variant mb-6">Помесячный объём обращений за 6 месяцев</p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyRequestVolume}>
                <defs>
                  <linearGradient id="colorWheelchair" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.wheelchair} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.wheelchair} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEscort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.escort} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.escort} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.food} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.food} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                <Area type="monotone" dataKey="wheelchair" name="Кресло" stroke={COLORS.wheelchair} fillOpacity={1} fill="url(#colorWheelchair)" strokeWidth={2} />
                <Area type="monotone" dataKey="escort" name="Сопровожд." stroke={COLORS.escort} fillOpacity={1} fill="url(#colorEscort)" strokeWidth={2} />
                <Area type="monotone" dataKey="food" name="Питание" stroke={COLORS.food} fillOpacity={1} fill="url(#colorFood)" strokeWidth={2} />
                <Area type="monotone" dataKey="sos" name="SOS" stroke={COLORS.error} fill={COLORS.error} fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Grid: Satisfaction Trend + Top Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Satisfaction Trend */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
              <h3 className="font-bold text-lg mb-1">Тренд удовлетворённости</h3>
              <p className="text-sm text-on-surface-variant mb-6">Средние оценки качества по месяцам</p>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={satisfactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis yAxisId="left" domain={[3.5, 5]} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="right" dataKey="reviews" name="Отзывы" fill={COLORS.primary} fillOpacity={0.15} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="avgRating" name="Рейтинг" stroke={COLORS.green} strokeWidth={3} dot={{ r: 5, fill: COLORS.green }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Top AI Insights */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                ИИ-инсайты
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">Автоматически обнаруженные закономерности</p>
              <div className="space-y-3">
                {aiInsights.slice(0, 3).map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── REQUESTS / LOAD TAB ─── */}
      {activeSubTab === 'requests' && (
        <>
          {/* Hourly Distribution */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Распределение по времени суток</h3>
            <p className="text-sm text-on-surface-variant mb-6">Среднее количество запросов по часам</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fontWeight: 700 }} interval={1} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="requests" name="Запросы" radius={[6, 6, 0, 0]}>
                  {hourlyDistribution.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.requests > 25 ? COLORS.primary : entry.requests > 15 ? '#3154b8' : '#b5c4ff'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Тепловая карта нагрузки</h3>
            <p className="text-sm text-on-surface-variant mb-6">Зависимость числа заявок от дня недели и времени суток</p>
            <HeatmapChart />
          </div>

          {/* Weekly by type + Zone load */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Pattern by Type */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
              <h3 className="font-bold text-lg mb-1">Нагрузка по дням недели</h3>
              <p className="text-sm text-on-surface-variant mb-6">Распределение типов помощи</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  <Bar dataKey="wheelchair" name="Кресло" fill={COLORS.wheelchair} radius={[4, 4, 0, 0]} stackId="stack" />
                  <Bar dataKey="escort" name="Сопровожд." fill={COLORS.escort} stackId="stack" />
                  <Bar dataKey="food" name="Питание" fill={COLORS.food} stackId="stack" />
                  <Bar dataKey="sos" name="SOS" fill={COLORS.error} radius={[4, 4, 0, 0]} stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Response Time Histogram */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
              <h3 className="font-bold text-lg mb-1">Время ответа</h3>
              <p className="text-sm text-on-surface-variant mb-6">Распределение по скорости обработки запросов</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={responseTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Запросы" radius={[6, 6, 0, 0]}>
                    {responseTimeDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zone Load */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-4">Нагрузка по зонам терминала</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {zoneLoad.map(z => (
                <div key={z.zone} className="bg-surface-container-low rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
                  <p className="text-xs font-bold text-on-surface-variant mb-2">{z.zone}</p>
                  <p className="text-2xl font-black text-primary">{z.requests}</p>
                  <p className="text-[10px] text-on-surface-variant">запросов</p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">timer</span>
                    <span className="text-xs font-bold">{z.avgWait} мин</span>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">person</span>
                    <span className="text-xs font-bold">{z.staff} сотр.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── SATISFACTION TAB ─── */}
      {activeSubTab === 'satisfaction' && (
        <>
          {/* Category Satisfaction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {satisfactionByCategory.map(cat => (
              <div key={cat.code} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">{cat.code}</span>
                  <span className={`text-xs font-bold ${cat.trend > 0 ? 'text-green-600' : cat.trend < 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                    {cat.trend > 0 ? '↑' : cat.trend < 0 ? '↓' : '→'} {Math.abs(cat.trend).toFixed(1)}
                  </span>
                </div>
                <h4 className="font-bold text-on-surface mb-3">{cat.label}</h4>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-black text-primary">{cat.avgRating}</span>
                  <span className="text-sm text-on-surface-variant mb-1">/ 5.0</span>
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-lg"
                      style={{
                        fontVariationSettings: "'FILL' 1",
                        color: star <= Math.round(cat.avgRating) ? '#eab308' : '#e2e2e5',
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant">{cat.totalReviews} отзывов</p>
                {/* Mini progress bar */}
                <div className="mt-3 bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(cat.avgRating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Satisfaction Trend Line */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Тренд общей удовлетворённости</h3>
            <p className="text-sm text-on-surface-variant mb-6">Динамика среднего рейтинга за 6 месяцев</p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[3.5, 5]} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  name="Рейтинг"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#fff', stroke: COLORS.primary, strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: COLORS.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart: categories comparison */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Радар качества по категориям</h3>
            <p className="text-sm text-on-surface-variant mb-6">Сравнение удовлетворённости между категориями ОВЗ</p>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={satisfactionByCategory}>
                <PolarGrid stroke="#e2e2e5" />
                <PolarAngleAxis dataKey="code" tick={{ fontSize: 12, fontWeight: 700, fill: '#434654' }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} angle={90} />
                <Radar name="Рейтинг" dataKey="avgRating" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ─── STAFF PERFORMANCE TAB ─── */}
      {activeSubTab === 'staff' && (
        <>
          {/* Staff comparison chart */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Сравнение производительности</h3>
            <p className="text-sm text-on-surface-variant mb-6">Количество выполненных запросов по месяцам</p>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                {staffPerformance.map((s, i) => (
                  <Line
                    key={s.id}
                    data={s.monthly}
                    type="monotone"
                    dataKey="completed"
                    name={s.name.split(' ')[0]}
                    stroke={PIE_COLORS[i % PIE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Staff Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffPerformance.map((s, i) => {
              const totalCompleted = s.monthly.reduce((sum, m) => sum + m.completed, 0);
              const avgTime = (s.monthly.reduce((sum, m) => sum + m.avgTime, 0) / s.monthly.length).toFixed(1);
              const lastMonth = s.monthly[s.monthly.length - 1];
              const prevMonth = s.monthly[s.monthly.length - 2];
              const growth = ((lastMonth.completed - prevMonth.completed) / prevMonth.completed * 100).toFixed(0);
              return (
                <div key={s.id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm`} style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}>
                      {s.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{s.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="material-symbols-outlined text-sm" style={{
                            fontVariationSettings: "'FILL' 1",
                            color: star <= Math.round(s.satisfaction) ? '#eab308' : '#e2e2e5',
                          }}>star</span>
                        ))}
                        <span className="text-xs font-bold text-on-surface-variant ml-1">{s.satisfaction}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-surface-container-low rounded-xl p-3">
                      <p className="text-xl font-black text-primary">{totalCompleted}</p>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase">Выполнено</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-3">
                      <p className="text-xl font-black text-tertiary">{avgTime}</p>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase">Ср. мин</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-3">
                      <p className={`text-xl font-black ${Number(growth) >= 0 ? 'text-green-600' : 'text-error'}`}>
                        {Number(growth) >= 0 ? '+' : ''}{growth}%
                      </p>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase">Рост</p>
                    </div>
                  </div>
                  {/* Sparkline */}
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={60}>
                      <AreaChart data={s.monthly}>
                        <Area type="monotone" dataKey="completed" stroke={PIE_COLORS[i % PIE_COLORS.length]} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.1} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Average Time Trend */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Среднее время обслуживания</h3>
            <p className="text-sm text-on-surface-variant mb-6">Динамика скорости обработки запросов (мин)</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e5" />
                <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[2, 6]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                {staffPerformance.map((s, i) => (
                  <Line
                    key={s.id}
                    data={s.monthly}
                    type="monotone"
                    dataKey="avgTime"
                    name={s.name.split(' ')[0]}
                    stroke={PIE_COLORS[i % PIE_COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray={i > 2 ? '5 5' : '0'}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ─── AI INSIGHTS TAB ─── */}
      {activeSubTab === 'insights' && (
        <>
          {/* Header banner */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <span className="material-symbols-outlined" style={{ fontSize: '12rem' }}>psychology</span>
            </div>
            <h3 className="text-xl font-black mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Модуль ИИ-рекомендаций
            </h3>
            <p className="text-blue-100 max-w-2xl leading-relaxed">
              Нейросеть DeepSeek анализирует операционные данные в реальном времени. Задайте вопрос или
              выберите готовый запрос — ИИ даст рекомендации на основе ваших данных за 6 месяцев.
            </p>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-3xl font-black">{aiInsights.length}</p>
                <p className="text-xs text-blue-200">Инсайтов</p>
              </div>
              <div>
                <p className="text-3xl font-black">{aiInsights.filter(i => i.severity === 'high').length}</p>
                <p className="text-xs text-blue-200">Критических</p>
              </div>
              <div>
                <p className="text-3xl font-black">819</p>
                <p className="text-xs text-blue-200">Точек данных</p>
              </div>
            </div>
          </div>

          {/* ─── DeepSeek AI Assistant ─── */}
          <AiAssistant />

          {/* All Insights */}
          <div className="space-y-4">
            {aiInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {/* Correlation Matrix (simplified) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-1">Матрица корреляций</h3>
            <p className="text-sm text-on-surface-variant mb-6">Взаимосвязь между факторами нагрузки</p>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-sm">
                <thead>
                  <tr>
                    <th className="p-3 text-left label-sm text-outline"></th>
                    <th className="p-3 label-sm text-outline">Рейсы</th>
                    <th className="p-3 label-sm text-outline">День нед.</th>
                    <th className="p-3 label-sm text-outline">Время</th>
                    <th className="p-3 label-sm text-outline">Персонал</th>
                    <th className="p-3 label-sm text-outline">Погода</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'WCHR запросы', vals: [0.87, 0.65, 0.72, -0.34, 0.12] },
                    { label: 'Время ответа', vals: [-0.15, 0.31, 0.68, -0.82, 0.08] },
                    { label: 'Оценки', vals: [0.11, -0.09, -0.45, 0.76, -0.05] },
                    { label: 'SOS вызовы', vals: [0.42, 0.28, 0.55, -0.51, 0.31] },
                  ].map(row => (
                    <tr key={row.label} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 text-left font-bold text-sm">{row.label}</td>
                      {row.vals.map((val, i) => (
                        <td key={i} className="p-3">
                          <span
                            className="inline-block w-12 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: val > 0
                                ? `rgba(15, 58, 159, ${Math.abs(val) * 0.6})`
                                : `rgba(186, 26, 26, ${Math.abs(val) * 0.4})`,
                              color: Math.abs(val) > 0.4 ? 'white' : '#434654',
                            }}
                          >
                            {val.toFixed(2)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              Рекомендации к действию
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Увеличить смену по пятницам на 2 сотрудника', priority: 'Высокий', status: 'pending', icon: 'group_add' },
                { action: 'Внедрить визуальные уведомления для категории DEAF', priority: 'Высокий', status: 'in_progress', icon: 'notifications' },
                { action: 'Запланировать наставничество: Сара → новые сотрудники', priority: 'Средний', status: 'pending', icon: 'school' },
                { action: 'Оптимизировать распределение сотрудников в Терминале B', priority: 'Средний', status: 'done', icon: 'route' },
                { action: 'Подготовить резерв персонала к апрельскому пику', priority: 'Средний', status: 'pending', icon: 'event' },
              ].map((rec, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-primary">{rec.icon}</span>
                  <span className="flex-1 text-sm font-medium">{rec.action}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    rec.priority === 'Высокий' ? 'bg-error/10 text-error' : 'bg-tertiary-fixed text-tertiary'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    rec.status === 'done' ? 'bg-green-100 text-green-800' :
                    rec.status === 'in_progress' ? 'bg-primary-fixed text-primary' :
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {rec.status === 'done' ? '✓ Выполнено' : rec.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
