import { useState } from 'react';
import './StarRating.css';

const StarRating = ({ value = 0, onChange, readonly = false, size = 'md' }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className={`star-rating ${size} ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hover || value) ? 'active' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
        >
          <i className={`${star <= (hover || value) ? 'fas' : 'far'} fa-star`}></i>
        </button>
      ))}
      {value > 0 && <span className="rating-value">{value.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;
