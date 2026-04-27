import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'text-4xl' }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={`transition-transform hover:scale-110 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          aria-label={`${star} из 5 звёзд`}
        >
          <span
            className={`material-symbols-outlined ${size} ${
              star <= (hover || value) ? 'text-primary filled' : 'text-outline-variant'
            }`}
            style={star <= (hover || value) ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}
