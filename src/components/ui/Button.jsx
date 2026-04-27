const variants = {
  primary: 'btn-gradient-primary text-white shadow-ambient hover:shadow-ambient-lg active:scale-95',
  secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-variant active:scale-95',
  ghost: 'bg-transparent text-primary hover:bg-surface-container-highest active:scale-95',
  error: 'bg-error text-on-error shadow-sos hover:opacity-90 active:scale-95',
  tertiary: 'bg-tertiary text-on-tertiary hover:bg-tertiary-container active:scale-95',
  outline: 'border-2 border-outline-variant text-on-surface-variant hover:bg-surface-container-low active:scale-95',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl font-bold',
  lg: 'px-8 py-4 text-lg rounded-xl font-bold',
  xl: 'px-8 py-6 text-2xl rounded-xl font-black uppercase tracking-widest',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
