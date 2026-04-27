const badgeStyles = {
  new: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  accepted: 'bg-primary-container text-on-primary-container',
  in_progress: 'bg-secondary-container text-on-secondary-container',
  completed: 'bg-green-100 text-green-800',
  sos: 'bg-error text-on-error',
  wheelchair: 'bg-primary-fixed text-on-primary-fixed-variant',
  escort: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  food: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  critical: 'bg-tertiary-container text-on-tertiary-container',
  info: 'bg-primary-fixed text-on-primary-fixed-variant',
};

const statusLabels = {
  new: 'НОВЫЙ',
  accepted: 'ПРИНЯТ',
  in_progress: 'В РАБОТЕ',
  completed: 'ЗАВЕРШЁН',
  sos: 'SOS',
};

export default function Badge({ type = 'info', label, className = '' }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block ${badgeStyles[type] || badgeStyles.info} ${className}`}>
      {label || statusLabels[type] || type}
    </span>
  );
}
