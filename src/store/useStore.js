import { create } from 'zustand';
import { initialFlights, initialStaff, initialRequests, initialRestaurants, initialFeedback } from '../data/mockData';

const useStore = create((set, get) => ({
  // ─── Data ───
  flights: initialFlights,
  staff: initialStaff,
  requests: initialRequests,
  restaurants: initialRestaurants,
  foodOrders: [],
  feedback: initialFeedback,
  sosAlerts: [],
  notifications: [],

  // ─── Current User (DB Binding) ───
  currentUser: {
    user_id: '11111111-1111-1111-1111-111111111111',
    role: 'admin',
    full_name: 'Системный администратор',
    phone: '+7 (999) 123-45-67',
    email: 'admin@aeroassist.ru',
    avatar: 'https://ui-avatars.com/api/?name=Системный+администратор&background=1d3a8a&color=fff&size=128',
  },
  updateCurrentUser: (updates) => set((state) => ({
    currentUser: { ...state.currentUser, ...updates }
  })),

  // ─── Flight Simulation ───
  simulateFlightUpdates: () => set((state) => {
    let newNotification = null;
    const newFlights = state.flights.map(f => {
      // 10% chance to change status
      if (Math.random() < 0.1 && !newNotification) {
        let newStatus = f.status;
        if (f.status === 'check_in') newStatus = 'on_time';
        else if (f.status === 'on_time' && Math.random() > 0.5) newStatus = 'boarding';
        else if (f.status === 'on_time') newStatus = 'delayed';
        else if (f.status === 'boarding') newStatus = 'arrived';
        else if (f.status === 'delayed') newStatus = 'boarding';
        
        if (newStatus !== f.status) {
          newNotification = {
            id: `n-flight-${Date.now()}`,
            message: `flightStatusChange`,
            data: { flight: f.id, status: newStatus },
            type: newStatus === 'delayed' ? 'error' : 'info',
            time: Date.now(),
            read: false,
          };
          return { ...f, status: newStatus };
        }
      }
      return f;
    });

    if (newNotification) {
      return { 
        flights: newFlights, 
        notifications: [newNotification, ...state.notifications] 
      };
    }
    return { flights: newFlights };
  }),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  // ─── A11y State ───
  a11y: {
    largeText: false,
    themeMode: 'normal', // normal | dark | contrast
    highlightLinks: false,
    dyslexiaMode: false,
    stopAnimations: false,
    largeCursor: false,
    textToSpeech: false, // Hover to read
  },

  setA11y: (updates) => set((state) => ({
    a11y: { ...state.a11y, ...updates }
  })),

  // ─── Request Actions ───
  addRequest: (data) => set((state) => ({
    requests: [
      {
        id: `req-${Date.now()}`,
        type: data.type,
        typeLabel: data.typeLabel,
        passenger: data.passenger || 'Пассажир',
        phone: data.phone || '',
        location: data.location,
        flight: data.flight || '',
        priority: data.priority || 'B',
        status: 'new',
        assignedStaff: null,
        createdAt: Date.now(),
        notes: data.notes || '',
      },
      ...state.requests,
    ],
    notifications: [
      { id: `n-${Date.now()}`, message: `Новый запрос: ${data.typeLabel}`, type: 'info', time: Date.now(), read: false },
      ...state.notifications,
    ],
  })),

  acceptRequest: (requestId, staffId) => set((state) => ({
    requests: state.requests.map((r) =>
      r.id === requestId ? { ...r, status: 'accepted', assignedStaff: staffId } : r
    ),
    staff: state.staff.map((s) =>
      s.id === staffId ? { ...s, status: 'busy' } : s
    ),
  })),

  updateRequestStatus: (requestId, status) => set((state) => ({
    requests: state.requests.map((r) =>
      r.id === requestId ? { ...r, status } : r
    ),
    staff: status === 'completed'
      ? state.staff.map((s) => {
          const req = state.requests.find((r) => r.id === requestId);
          return req && s.id === req.assignedStaff ? { ...s, status: 'available' } : s;
        })
      : state.staff,
  })),

  assignRequest: (requestId, staffId) => set((state) => ({
    requests: state.requests.map((r) =>
      r.id === requestId ? { ...r, assignedStaff: staffId, status: 'accepted' } : r
    ),
    staff: state.staff.map((s) =>
      s.id === staffId ? { ...s, status: 'busy' } : s
    ),
  })),

  // ─── Food Orders ───
  addFoodOrder: (data) => set((state) => ({
    foodOrders: [
      {
        id: `food-${Date.now()}`,
        restaurant: data.restaurant,
        items: data.items,
        gate: data.gate,
        passenger: data.passenger || 'Пассажир',
        status: 'new',
        createdAt: Date.now(),
      },
      ...state.foodOrders,
    ],
    requests: [
      {
        id: `req-${Date.now()}`,
        type: 'food',
        typeLabel: 'Доставка питания',
        passenger: data.passenger || 'Пассажир',
        phone: '',
        location: data.gate,
        flight: '',
        priority: 'C',
        status: 'new',
        assignedStaff: null,
        createdAt: Date.now(),
        notes: `Заказ из ${data.restaurant}: ${data.items.map(i => i.name).join(', ')}`,
      },
      ...state.requests,
    ],
  })),

  // ─── SOS ───
  addSOSAlert: (data) => set((state) => ({
    sosAlerts: [
      {
        id: `sos-${Date.now()}`,
        location: data.location || 'Неизвестно',
        message: data.message || 'Экстренный вызов',
        createdAt: Date.now(),
      },
      ...state.sosAlerts,
    ],
    requests: [
      {
        id: `req-sos-${Date.now()}`,
        type: 'sos',
        typeLabel: 'SOS — Экстренная помощь',
        passenger: data.passenger || 'Пассажир',
        phone: '',
        location: data.location || 'Неизвестно',
        flight: '',
        priority: 'A',
        status: 'new',
        assignedStaff: null,
        createdAt: Date.now(),
        notes: data.message || 'Экстренный вызов помощи',
      },
      ...state.requests,
    ],
  })),

  // ─── Feedback ───
  addFeedback: (data) => set((state) => ({
    feedback: [
      {
        id: `fb-${Date.now()}`,
        passenger: data.passenger || 'Анонимный пассажир',
        rating: data.rating,
        comment: data.comment,
        date: new Date().toISOString().split('T')[0],
        staffName: data.staffName || '',
      },
      ...state.feedback,
    ],
  })),

  // ─── Staff Management ───
  addStaff: (data) => set((state) => ({
    staff: [
      ...state.staff,
      {
        id: `staff-${Date.now()}`,
        name: data.name,
        initials: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        role: data.role || 'Помощник',
        zone: data.zone || 'Терминал A',
        status: 'available',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1d3a8a&color=fff&size=128`,
      },
    ],
  })),

  // ─── Computed ───
  getActiveRequests: () => get().requests.filter((r) => r.status !== 'completed'),
  getNewRequests: () => get().requests.filter((r) => r.status === 'new'),
  getAvailableStaff: () => get().staff.filter((s) => s.status === 'available'),
  getAverageRating: () => {
    const fb = get().feedback;
    if (fb.length === 0) return 0;
    return (fb.reduce((sum, f) => sum + f.rating, 0) / fb.length).toFixed(1);
  },
}));

export default useStore;
