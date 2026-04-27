import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import Modal from './Modal';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const currentUser = useStore((state) => state.currentUser);
  const updateCurrentUser = useStore((state) => state.updateCurrentUser);

  const [formData, setFormData] = useState({
    full_name: currentUser.full_name,
    email: currentUser.email,
    phone: currentUser.phone,
  });

  useEffect(() => {
    setFormData({
      full_name: currentUser.full_name,
      email: currentUser.email,
      phone: currentUser.phone,
    });
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateCurrentUser({
      ...formData,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name)}&background=1d3a8a&color=fff&size=128`
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки аккаунта">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-on-surface mb-1">
            Полное имя (ФИО)
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1">
            Email (Логин)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1">
            Телефон
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none transition-all"
          />
        </div>
        
        <div className="pt-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-bold bg-primary text-white hover:bg-blue-800 rounded-lg transition-colors shadow-md"
          >
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
}
