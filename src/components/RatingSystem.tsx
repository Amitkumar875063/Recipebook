import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingSystemProps {
  currentRating: number;
  onRate: (rating: number) => void;
  readonly?: boolean;
}

const RatingSystem: React.FC<RatingSystemProps> = ({ 
  currentRating, 
  onRate, 
  readonly = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (rating: number) => {
    if (!readonly) {
      onRate(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || currentRating);
        return (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform duration-150`}
          >
            <Star
              className={`h-5 w-5 ${
                filled
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingSystem;