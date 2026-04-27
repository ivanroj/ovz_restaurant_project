import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

export default function LiveFlightBoard({ isDispatcher = false }) {
  const { t } = useTranslation();
  const flights = useStore((state) => state.flights);
  const requests = useStore((state) => state.requests);

  const [tab, setTab] = useState('departures'); // 'departures' | 'arrivals'
  const [search, setSearch] = useState('');

  const statusColors = {
    check_in: 'bg-blue-100 text-blue-800',
    on_time: 'bg-green-100 text-green-800',
    boarding: 'bg-orange-100 text-orange-800',
    delayed: 'bg-red-100 text-red-800',
    arrived: 'bg-surface-variant text-on-surface-variant',
  };

  const getPrmCount = (flightId) => {
    return requests.filter(r => r.flight === flightId).length;
  };

  // Logic: if 'to' includes SVO, S Sheremetyevo, etc., it's an arrival.
  // We use string match since this is a mock.
  const filteredFlights = flights.filter(f => {
    const isArrival = f.to.includes('SVO') || f.to.includes('Москва');
    
    if (tab === 'arrivals' && !isArrival) return false;
    if (tab === 'departures' && isArrival) return false;

    if (search) {
      const q = search.toLowerCase();
      return f.id.toLowerCase().includes(q) || 
             f.from.toLowerCase().includes(q) || 
             f.to.toLowerCase().includes(q) || 
             f.airline.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden flex flex-col">
      {/* Header Controls */}
      <div className="p-4 md:px-6 bg-surface-container border-b border-surface-container-high flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex bg-surface-container-low p-1 rounded-lg w-full md:w-auto">
          <button 
            onClick={() => setTab('departures')} 
            className={`flex-1 md:w-32 py-2 text-sm font-bold rounded-md transition-colors ${tab === 'departures' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            ✈️ {t('passenger.board.departures')}
          </button>
          <button 
            onClick={() => setTab('arrivals')} 
            className={`flex-1 md:w-32 py-2 text-sm font-bold rounded-md transition-colors ${tab === 'arrivals' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            🛬 {t('passenger.board.arrivals')}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input 
            type="text" 
            placeholder={t('passenger.board.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left">
          <thead className="bg-surface-container-high">
            <tr>
              <th className="px-6 py-4 label-sm text-outline">{t('passenger.board.colFlight')}</th>
              <th className="px-6 py-4 label-sm text-outline">{t('passenger.board.colDirection')}</th>
              <th className="px-6 py-4 label-sm text-outline">{t('passenger.board.colTime')}</th>
              <th className="px-6 py-4 label-sm text-outline">{t('passenger.board.colGate')}</th>
              <th className="px-6 py-4 label-sm text-outline">{t('passenger.board.colStatus')}</th>
              {isDispatcher && (
                <th className="px-6 py-4 label-sm text-outline">{t('passenger.board.colPRM')}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredFlights.length === 0 ? (
              <tr>
                <td colSpan={isDispatcher ? 6 : 5} className="text-center py-12 text-outline">
                   <span className="material-symbols-outlined block mb-2 text-3xl">flight_off</span>
                   Рейсы не найдены
                </td>
              </tr>
            ) : (
              filteredFlights.map((flight, i) => {
                const color = statusColors[flight.status] || statusColors.on_time;
                const statusLabel = t(`passenger.board.status_${flight.status}`);
                const prmCount = getPrmCount(flight.id);

                return (
                  <tr key={flight.id} className={`${i % 2 === 1 ? 'bg-surface-container-low' : ''} hover:bg-surface transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-on-surface">{flight.id}</div>
                      <div className="text-xs text-on-surface-variant font-medium">{flight.airline}</div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {tab === 'departures' ? (
                        <>
                          <span className="text-outline mr-2">→</span>
                          <span className="font-bold">{flight.to}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-outline mr-2">←</span>
                          <span className="font-bold">{flight.from}</span>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-lg text-on-surface">{flight.time}</td>
                    <td className="px-6 py-4 font-black text-primary text-base">{flight.terminal}-{flight.gate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap animate-in fade-in zoom-in duration-300 ${color}`}>
                        {statusLabel}
                      </span>
                    </td>
                    {isDispatcher && (
                      <td className="px-6 py-4 text-center">
                        {prmCount > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-tertiary-container text-on-tertiary-container font-black text-sm rounded-lg" title="Количество заявок на спецобслуживание">
                             <span className="material-symbols-outlined text-sm">accessible_forward</span>
                             {prmCount}
                          </div>
                        ) : (
                          <span className="text-outline">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
