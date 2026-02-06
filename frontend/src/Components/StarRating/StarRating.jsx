// src/Components/StarRating/StarRating.jsx
import React, { useState } from "react";
import "./StarRating.css";

export default function StarRating({ value = 0, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);

  const handleClick = (star) => {
    if (!disabled && onChange) onChange(star);
  };

  const handleKeyDown = (star) => (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      onChange?.(star);
    }
  };

  return (
    <div className="stars" role="radiogroup" aria-label={`Rating ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <span
            key={star}
            className={`star ${filled ? "filled" : ""} ${disabled ? "disabled" : ""}`}
            role="radio"
            aria-checked={filled}
            tabIndex={disabled ? -1 : 0}
            onClick={() => handleClick(star)}
            onKeyDown={handleKeyDown(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            aria-label={`${star} star`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
