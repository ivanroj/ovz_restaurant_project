export const initialFlights = [
  { id: 'SU-1234', airline: 'Аэрофлот', from: 'Москва (SVO)', to: 'Санкт-Петербург (LED)', time: '14:20', gate: 'A12', status: 'boarding', terminal: 'A' },
  { id: 'S7-502', airline: 'S7 Airlines', from: 'Москва (DME)', to: 'Новосибирск (OVB)', time: '15:05', gate: 'B4', status: 'on_time', terminal: 'B' },
  { id: 'DP-6078', airline: 'Победа', from: 'Москва (VKO)', to: 'Сочи (AER)', time: '15:30', gate: 'C8', status: 'delayed', terminal: 'C' },
  { id: 'UT-345', airline: 'ЮТэйр', from: 'Москва (VKO)', to: 'Тюмень (TJM)', time: '16:00', gate: 'A5', status: 'on_time', terminal: 'A' },
  { id: 'SU-2518', airline: 'Аэрофлот', from: 'Стамбул (IST)', to: 'Москва (SVO)', time: '14:45', gate: 'D2', status: 'arrived', terminal: 'D' },
  { id: 'N4-117', airline: 'Nordwind', from: 'Анталья (AYT)', to: 'Москва (SVO)', time: '16:15', gate: 'D6', status: 'on_time', terminal: 'D' },
  { id: 'FV-6630', airline: 'Россия', from: 'Москва (SVO)', to: 'Казань (KZN)', time: '17:00', gate: 'B12', status: 'check_in', terminal: 'B' },
  { id: 'SU-1710', airline: 'Аэрофлот', from: 'Москва (SVO)', to: 'Екатеринбург (SVX)', time: '18:30', gate: 'A9', status: 'on_time', terminal: 'A' },
];

export const initialStaff = [
  { id: 'staff-1', name: 'Маркус Чен', initials: 'МЧ', role: 'Старший сотрудник', zone: 'Гейт A12', status: 'available', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIeHF-k-QTf1gEGbFEMTTBXJZz3g2xfZ22THTlZK9eDAS6D5CN-fR6u-KNvLYxJz1cZcqWqXzexltidE0BaDvKsSoDqRViL41tYfoPd69hE4hhdwmZTWjOZ8r7HsJmQSvonVOI2SElD33iyxi7UdV3Q5E8H-Y6Xop-hjoGoaID9-Hk5N3w-ydjH0FjPcmI9K0cbJFfXFpr0Zf5eJBknLtGE57O6bk3IlV1fWv02aZ9MVnIyLVxu7jht-lfKOCPhSekFXPX7CTtBNI' },
  { id: 'staff-2', name: 'Елена Родригес', initials: 'ЕР', role: 'Оператор', zone: 'Терминал B', status: 'busy', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb2ST_aDMOsz5L-eH_5aJeNHpfApCaJedXtnTI8cctbsZH_3W-TGIltMT5_fGOGxwIWJX4qV_nSkUMFNzgCTTmytU7VN9W1JI7WjBboY7oNzae1X7TclQL52XFiVT77Z62iU1JFjQ3gVgF_NwAFPPqrxOeNa9MRqnwg0h2J9r0rc3trR_8gEkW6PRozikxKZ_XpTQXT9Uh2k2aOf7aDe0IshBA2dwWg6a3ul5wRSV9tXjZULAXRMYzexPX5K9v_tJmYp7tuoPK7Jk' },
  { id: 'staff-3', name: 'Джеймс Уилсон', initials: 'ДУ', role: 'Помощник', zone: 'Зона выдачи багажа', status: 'available', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPhm7kywyDIitwduUUa1YG8CQLAVOGRPF4U2mMFVYo-sLXOk4cSwPeQQsqGShC6A9IHD7iMVZk6ZzlO3U5sIJVmVCs1uhPQtcPxGQo2RGBpi7ll_F0R1P_WIQXzXDJLJ_q7asGh0TViXxC9skFI6qr6EoZKabBKQwLqV9bIPMbQpD_8MrhcJ6faB5J3V74urgCeyGiZfKa78XLJgWxK5MhjbrpCtOH0nf4SypmJCae4RhzDjjKmuuk9ZyV-Mj6EqJ4QnYo_DAp3Vo' },
  { id: 'staff-4', name: 'Сара Дженкинс', initials: 'СД', role: 'Координатор', zone: 'Терминал A', status: 'available', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIHJbV1vv9PHqX23ZrsjY6a5r9VmOkIngW0zs1CTFfeLUCzxeLz98z9o_58p3lCOFQjV1djKkmsUdJLLR-GAqntdQ7ZuVIh9ALTurf42Caa_-L_nsTHukM5-nAAUPlF4czolUjDLnBQ5o4g0yc2fd616e3dJ6gDK30knB6W7lUMfdBQOT1ybUo2VQRwJmjW7mB0QSnSnYDojPnaaoX3_PnHtzj_gHi_0E_ESF7CS8-7bN5-3Kdzm7UBh5rSZMDX7RM8LuPG0xw2sM' },
  { id: 'staff-5', name: 'Давид Ким', initials: 'ДК', role: 'Специалист по доступности', zone: 'Зона безопасности', status: 'busy', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn-xUO3wYxRK_HQSAbtqzssjkgIdEE5Ins49o8EmLoeA74wWkxduur3FTgmTFty88NTohufnyoMktZyro5RJBa9xrz_TjIaEBRJrlox56w9zd_jO-gRPwPOzR_mjyIFxxeFLetngL5CpDAy0qH8Iv9490j0ggQYI2xrNanjmWo_3sYTcYYq6NsQnXLynAm2ixUDcRV1HW3rke6sIv3SKQb2_T0xGmPfdAGrHdgLAVQYuOALmG66W8fjgb-Q__nzng-E86pCVuqffA' },
];

export const initialRestaurants = [
  {
    id: 'rest-1',
    name: 'SkyLine Deli',
    description: 'Свежие сэндвичи и салаты',
    menu: [
      { id: 'm1', name: 'Клубный сэндвич', price: 450, emoji: '🥪' },
      { id: 'm2', name: 'Греческий салат', price: 380, emoji: '🥗' },
      { id: 'm3', name: 'Суп дня', price: 320, emoji: '🍜' },
      { id: 'm4', name: 'Свежевыжатый сок', price: 250, emoji: '🧃' },
    ]
  },
  {
    id: 'rest-2',
    name: 'Bistro Jet',
    description: 'Горячие блюда и супы',
    menu: [
      { id: 'm5', name: 'Паста Карбонара', price: 520, emoji: '🍝' },
      { id: 'm6', name: 'Борщ с пампушками', price: 380, emoji: '🍲' },
      { id: 'm7', name: 'Куриная котлета', price: 450, emoji: '🍗' },
      { id: 'm8', name: 'Чай / Кофе', price: 180, emoji: '☕' },
    ]
  },
  {
    id: 'rest-3',
    name: 'Terminal Bites',
    description: 'Быстрые перекусы и напитки',
    menu: [
      { id: 'm9', name: 'Бургер Классик', price: 490, emoji: '🍔' },
      { id: 'm10', name: 'Картофель фри', price: 220, emoji: '🍟' },
      { id: 'm11', name: 'Молочный коктейль', price: 300, emoji: '🥤' },
      { id: 'm12', name: 'Пирожное', price: 280, emoji: '🧁' },
    ]
  },
];

export const initialRequests = [
  {
    id: 'req-1',
    type: 'wheelchair',
    typeLabel: 'Инвалидное кресло',
    passenger: 'Элеонора Ванс',
    phone: '+7 (495) 123-45-67',
    location: 'Гейт A-12',
    flight: 'SU-1234 (Посадка)',
    priority: 'A',
    status: 'new',
    assignedStaff: null,
    createdAt: Date.now() - 4 * 60 * 1000,
    notes: '',
  },
  {
    id: 'req-2',
    type: 'escort',
    typeLabel: 'Сопровождение',
    passenger: 'Самуэль Торн',
    phone: 'Чат в приложении',
    location: 'Зона высадки 4',
    flight: 'S7-502',
    priority: 'B',
    status: 'accepted',
    assignedStaff: 'staff-1',
    createdAt: Date.now() - 15 * 60 * 1000,
    notes: 'Слабовидящий пассажир',
  },
  {
    id: 'req-3',
    type: 'food',
    typeLabel: 'Доставка питания',
    passenger: 'Мария Гарсиа',
    phone: '+7 (495) 987-65-43',
    location: 'Лаунж B',
    flight: 'DP-6078',
    priority: 'C',
    status: 'new',
    assignedStaff: null,
    createdAt: Date.now() - 12 * 60 * 1000,
    notes: 'Нужна визуальная помощь с меню',
  },
];

export const initialFeedback = [
  { id: 'fb-1', passenger: 'Анна Петрова', rating: 5, comment: 'Замечательное обслуживание! Сотрудник помог добраться до гейта за считанные минуты.', date: '2026-03-28', staffName: 'Маркус Чен' },
  { id: 'fb-2', passenger: 'Иван Козлов', rating: 4, comment: 'Хороший сервис, немного пришлось подождать, но в целом доволен.', date: '2026-03-27', staffName: 'Елена Родригес' },
  { id: 'fb-3', passenger: 'Ольга Сидорова', rating: 5, comment: 'Безупречная поддержка для моей мамы. Спасибо за внимание и заботу!', date: '2026-03-26', staffName: 'Сара Дженкинс' },
];

export const knowledgeBase = [
  {
    id: 'kb-1',
    category: 'Инструкция',
    categoryColor: 'primary',
    title: 'Протокол помощи незрячим',
    icon: 'visibility',
    content: 'Обеспечьте словесное описание на каждом ориентире. Поддерживайте физический контакт только по запросу пассажира — предпочтительный метод (локоть или плечо).',
    action: 'Полный протокол',
  },
  {
    id: 'kb-2',
    category: 'Руководство',
    categoryColor: 'secondary',
    title: 'Мобильность и инвалидные кресла',
    icon: 'accessible',
    content: 'Проверяйте тип аккумулятора электрических средств передвижения (PMA) перед сдачей у гейта. Стандартные механические кресла должны иметь бирку «Доставить к двери самолёта».',
    action: 'Руководство по оборудованию',
  },
  {
    id: 'kb-3',
    category: 'Экстренное',
    categoryColor: 'tertiary',
    title: 'Контакты терминала',
    icon: 'call',
    contacts: [
      { label: 'Диспетчер Терминала А', phone: '+7 (495) 012-88-00', code: 'А' },
      { label: 'Медицинская служба', phone: '+7 (495) 911-30-00', code: 'М' },
    ],
  },
];

export const flightStatusLabels = {
  boarding: { label: 'ПОСАДКА', color: 'bg-primary-container text-on-primary-container' },
  on_time: { label: 'ПО РАСПИСАНИЮ', color: 'bg-green-100 text-green-800' },
  delayed: { label: 'ЗАДЕРЖАН', color: 'bg-error-container text-on-error-container' },
  arrived: { label: 'ПРИБЫЛ', color: 'bg-primary-fixed text-on-primary-fixed-variant' },
  check_in: { label: 'РЕГИСТРАЦИЯ', color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
};
