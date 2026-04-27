// ─── Historical Analytics Data (6 months) ───
// This data simulates accumulated statistics for the advanced analytics module

const months = ['Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар'];
const fullMonths = ['Октябрь', 'Ноябрь', 'Декабрь', 'Январь', 'Февраль', 'Март'];

// ─── Monthly request volume by type ───
export const monthlyRequestVolume = [
  { month: 'Окт', wheelchair: 45, escort: 32, food: 18, sos: 3, total: 98 },
  { month: 'Ноя', wheelchair: 52, escort: 38, food: 22, sos: 5, total: 117 },
  { month: 'Дек', wheelchair: 68, escort: 55, food: 35, sos: 7, total: 165 },
  { month: 'Янв', wheelchair: 61, escort: 48, food: 28, sos: 4, total: 141 },
  { month: 'Фев', wheelchair: 55, escort: 42, food: 25, sos: 6, total: 128 },
  { month: 'Мар', wheelchair: 72, escort: 58, food: 32, sos: 8, total: 170 },
];

// ─── Hourly request distribution (average across all days) ───
export const hourlyDistribution = [
  { hour: '06:00', requests: 3 },
  { hour: '07:00', requests: 8 },
  { hour: '08:00', requests: 15 },
  { hour: '09:00', requests: 22 },
  { hour: '10:00', requests: 28 },
  { hour: '11:00', requests: 25 },
  { hour: '12:00', requests: 18 },
  { hour: '13:00', requests: 16 },
  { hour: '14:00', requests: 20 },
  { hour: '15:00', requests: 26 },
  { hour: '16:00', requests: 30 },
  { hour: '17:00', requests: 27 },
  { hour: '18:00', requests: 22 },
  { hour: '19:00', requests: 15 },
  { hour: '20:00', requests: 10 },
  { hour: '21:00', requests: 6 },
  { hour: '22:00', requests: 3 },
  { hour: '23:00', requests: 1 },
];

// ─── Satisfaction by disability category (ICAO codes) ───
export const satisfactionByCategory = [
  { code: 'WCHR', label: 'Кресло-коляска', avgRating: 4.7, totalReviews: 89, trend: +0.2 },
  { code: 'WCHC', label: 'Полная иммобильность', avgRating: 4.5, totalReviews: 34, trend: +0.1 },
  { code: 'BLND', label: 'Слабовидящие / незрячие', avgRating: 4.8, totalReviews: 52, trend: +0.3 },
  { code: 'DEAF', label: 'Слабослышащие / глухие', avgRating: 4.3, totalReviews: 28, trend: -0.1 },
  { code: 'DPNA', label: 'Интеллектуальные наруш.', avgRating: 4.6, totalReviews: 19, trend: +0.2 },
  { code: 'MAAS', label: 'Другая помощь', avgRating: 4.4, totalReviews: 45, trend: 0 },
];

// ─── Monthly satisfaction trends ───
export const satisfactionTrend = [
  { month: 'Окт', avgRating: 4.2, reviews: 32 },
  { month: 'Ноя', avgRating: 4.3, reviews: 38 },
  { month: 'Дек', avgRating: 4.1, reviews: 51 },
  { month: 'Янв', avgRating: 4.5, reviews: 44 },
  { month: 'Фев', avgRating: 4.6, reviews: 40 },
  { month: 'Мар', avgRating: 4.7, reviews: 62 },
];

// ─── Weekly distribution (day of week patterns) ───
export const weeklyPattern = [
  { day: 'Пн', wheelchair: 12, escort: 8, food: 5, sos: 1 },
  { day: 'Вт', wheelchair: 10, escort: 7, food: 4, sos: 1 },
  { day: 'Ср', wheelchair: 11, escort: 9, food: 6, sos: 1 },
  { day: 'Чт', wheelchair: 14, escort: 10, food: 5, sos: 2 },
  { day: 'Пт', wheelchair: 18, escort: 14, food: 8, sos: 2 },
  { day: 'Сб', wheelchair: 16, escort: 12, food: 7, sos: 1 },
  { day: 'Вс', wheelchair: 15, escort: 11, food: 6, sos: 1 },
];

// ─── Staff performance over months ───
export const staffPerformance = [
  {
    id: 'staff-1', name: 'Маркус Чен',
    monthly: [
      { month: 'Окт', completed: 22, avgTime: 4.1 },
      { month: 'Ноя', completed: 26, avgTime: 3.8 },
      { month: 'Дек', completed: 35, avgTime: 4.5 },
      { month: 'Янв', completed: 30, avgTime: 3.9 },
      { month: 'Фев', completed: 28, avgTime: 3.7 },
      { month: 'Мар', completed: 38, avgTime: 3.5 },
    ],
    satisfaction: 4.8,
  },
  {
    id: 'staff-2', name: 'Елена Родригес',
    monthly: [
      { month: 'Окт', completed: 18, avgTime: 5.2 },
      { month: 'Ноя', completed: 22, avgTime: 4.8 },
      { month: 'Дек', completed: 30, avgTime: 5.0 },
      { month: 'Янв', completed: 25, avgTime: 4.6 },
      { month: 'Фев', completed: 24, avgTime: 4.4 },
      { month: 'Мар', completed: 32, avgTime: 4.2 },
    ],
    satisfaction: 4.5,
  },
  {
    id: 'staff-3', name: 'Джеймс Уилсон',
    monthly: [
      { month: 'Окт', completed: 20, avgTime: 4.8 },
      { month: 'Ноя', completed: 24, avgTime: 4.5 },
      { month: 'Дек', completed: 32, avgTime: 4.9 },
      { month: 'Янв', completed: 28, avgTime: 4.3 },
      { month: 'Фев', completed: 26, avgTime: 4.1 },
      { month: 'Мар', completed: 34, avgTime: 3.8 },
    ],
    satisfaction: 4.6,
  },
  {
    id: 'staff-4', name: 'Сара Дженкинс',
    monthly: [
      { month: 'Окт', completed: 19, avgTime: 3.9 },
      { month: 'Ноя', completed: 23, avgTime: 3.6 },
      { month: 'Дек', completed: 33, avgTime: 4.1 },
      { month: 'Янв', completed: 29, avgTime: 3.7 },
      { month: 'Фев', completed: 27, avgTime: 3.5 },
      { month: 'Мар', completed: 36, avgTime: 3.3 },
    ],
    satisfaction: 4.9,
  },
  {
    id: 'staff-5', name: 'Давид Ким',
    monthly: [
      { month: 'Окт', completed: 16, avgTime: 5.5 },
      { month: 'Ноя', completed: 20, avgTime: 5.1 },
      { month: 'Дек', completed: 28, avgTime: 5.3 },
      { month: 'Янв', completed: 24, avgTime: 4.9 },
      { month: 'Фев', completed: 22, avgTime: 4.7 },
      { month: 'Мар', completed: 30, avgTime: 4.5 },
    ],
    satisfaction: 4.3,
  },
];

// ─── Heatmap: requests per hour per day ───
export const heatmapData = [
  // [dayIndex, hourIndex, value]  day: 0=Mon...6=Sun, hour: 6..23
  [0,6,1],[0,7,3],[0,8,6],[0,9,8],[0,10,10],[0,11,9],[0,12,6],[0,13,5],[0,14,7],[0,15,9],[0,16,11],[0,17,10],[0,18,8],[0,19,5],[0,20,3],[0,21,2],[0,22,1],[0,23,0],
  [1,6,1],[1,7,2],[1,8,5],[1,9,7],[1,10,9],[1,11,8],[1,12,5],[1,13,4],[1,14,6],[1,15,8],[1,16,10],[1,17,9],[1,18,7],[1,19,4],[1,20,3],[1,21,1],[1,22,1],[1,23,0],
  [2,6,1],[2,7,3],[2,8,6],[2,9,9],[2,10,11],[2,11,10],[2,12,7],[2,13,6],[2,14,8],[2,15,10],[2,16,12],[2,17,10],[2,18,8],[2,19,5],[2,20,3],[2,21,2],[2,22,1],[2,23,0],
  [3,6,2],[3,7,4],[3,8,7],[3,9,10],[3,10,13],[3,11,11],[3,12,8],[3,13,7],[3,14,9],[3,15,12],[3,16,14],[3,17,12],[3,18,9],[3,19,6],[3,20,4],[3,21,2],[3,22,1],[3,23,0],
  [4,6,2],[4,7,5],[4,8,9],[4,9,13],[4,10,16],[4,11,14],[4,12,10],[4,13,8],[4,14,11],[4,15,14],[4,16,18],[4,17,15],[4,18,11],[4,19,7],[4,20,5],[4,21,3],[4,22,2],[4,23,1],
  [5,6,2],[5,7,4],[5,8,8],[5,9,11],[5,10,14],[5,11,12],[5,12,9],[5,13,7],[5,14,10],[5,15,13],[5,16,15],[5,17,13],[5,18,10],[5,19,6],[5,20,4],[5,21,2],[5,22,1],[5,23,0],
  [6,6,1],[6,7,3],[6,8,7],[6,9,10],[6,10,12],[6,11,11],[6,12,8],[6,13,6],[6,14,9],[6,15,11],[6,16,13],[6,17,11],[6,18,9],[6,19,6],[6,20,4],[6,21,2],[6,22,1],[6,23,0],
];

// ─── Discovered correlations / AI insights ───
export const aiInsights = [
  {
    id: 'insight-1',
    type: 'correlation',
    icon: 'trending_up',
    severity: 'high',
    title: 'Рост запросов WCHR по пятницам',
    description: 'Обнаружена устойчивая корреляция: количество запросов на инвалидное кресло по пятницам на 42% выше среднего. Рекомендуется увеличить число сотрудников по пятницам.',
    metric: '+42%',
    metricLabel: 'выше нормы',
  },
  {
    id: 'insight-2',
    type: 'pattern',
    icon: 'schedule',
    severity: 'medium',
    title: 'Пиковый час: 16:00–17:00',
    description: 'Максимальная нагрузка наблюдается с 16:00 до 17:00. Среднее время ответа в этот период увеличивается на 35%. Рекомендуется усилить смену.',
    metric: '16:00',
    metricLabel: 'час пик',
  },
  {
    id: 'insight-3',
    type: 'satisfaction',
    icon: 'sentiment_dissatisfied',
    severity: 'high',
    title: 'Снижение оценок категории DEAF',
    description: 'Удовлетворённость пассажиров категории DEAF снизилась на 2.3% за последний квартал. Основные жалобы связаны с недостатком визуальных уведомлений. Рекомендуется внедрить видеосурдопереводчика.',
    metric: '-2.3%',
    metricLabel: 'за квартал',
  },
  {
    id: 'insight-4',
    type: 'efficiency',
    icon: 'speed',
    severity: 'low',
    title: 'Сотрудник месяца: Сара Дженкинс',
    description: 'Сара Дженкинс показала лучшие результаты: среднее время обслуживания 3.3 мин (на 22% ниже среднего), рейтинг 4.9/5.0. Предложена программа наставничества.',
    metric: '4.9',
    metricLabel: 'рейтинг',
  },
  {
    id: 'insight-5',
    type: 'forecast',
    icon: 'auto_graph',
    severity: 'medium',
    title: 'Прогноз: рост на 15% в апреле',
    description: 'На основе исторических данных и расписания рейсов прогнозируется рост числа обращений на 15% в апреле. Рекомендуется заблаговременно расширить штат.',
    metric: '+15%',
    metricLabel: 'прогноз',
  },
];

// ─── Response time distribution (for histogram) ───
export const responseTimeDistribution = [
  { range: '0–2 мин', count: 35, color: '#16a34a' },
  { range: '2–4 мин', count: 48, color: '#22c55e' },
  { range: '4–6 мин', count: 32, color: '#eab308' },
  { range: '6–8 мин', count: 18, color: '#f97316' },
  { range: '8–10 мин', count: 8, color: '#ef4444' },
  { range: '10+ мин', count: 4, color: '#dc2626' },
];

// ─── Terminal zone load ───
export const zoneLoad = [
  { zone: 'Терминал A', requests: 145, staff: 2, avgWait: 3.2 },
  { zone: 'Терминал B', requests: 112, staff: 1, avgWait: 4.8 },
  { zone: 'Терминал C', requests: 78, staff: 1, avgWait: 3.5 },
  { zone: 'Терминал D', requests: 95, staff: 1, avgWait: 4.1 },
  { zone: 'Багаж', requests: 62, staff: 1, avgWait: 5.2 },
  { zone: 'Безопасность', requests: 44, staff: 1, avgWait: 2.8 },
];
