import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useStore from './store/useStore';
import HomePage from './pages/HomePage';
import PassengerPage from './pages/PassengerPage';
import StaffPage from './pages/StaffPage';
import DispatcherPage from './pages/DispatcherPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const simulateFlightUpdates = useStore((state) => state.simulateFlightUpdates);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateFlightUpdates();
    }, 15000); // Update every 15s for demo purposes
    return () => clearInterval(interval);
  }, [simulateFlightUpdates]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/passenger" element={<PassengerPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/dispatcher" element={<DispatcherPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
