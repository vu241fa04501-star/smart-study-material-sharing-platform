import React, { useState } from 'react';
import { StarIcon } from './Icons';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  isInteractive = false,
  onRatingChange,
  size = 18,
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (isInteractive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (isInteractive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(0);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="star-rating-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div className="stars-row" style={{ display: 'inline-flex', gap: '2px' }}>
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(activeRating);

          return (
            <span
              key={index}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: isInteractive ? 'pointer' : 'default',
                transition: 'transform 0.15s ease',
                display: 'inline-flex',
                color: isFilled ? '#f59e0b' : '#cbd5e1',
              }}
              title={isInteractive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
            >
              <StarIcon size={size} filled={isFilled} />
            </span>
          );
        })}
      </div>
      {showValue && (
        <span
          style={{
            fontSize: `${Math.max(12, size - 3)}px`,
            fontWeight: 600,
            color: '#334155',
            marginLeft: '4px',
          }}
        >
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
