// src/Components/StarRating/StarRating.jsx
import React from "react";
import "./StarRating.css";

export default function StarRating({ value = 0, onChange, disabled = false }) {
  const onStarClick = (star) => {
    if (!disabled && onChange) onChange(star);
  };

  const onStarKeyDown = (star) => (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      onChange?.(star);
    }
  };

  return (
    <div className="stars" role="radiogroup" aria-label={`Rating ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= value ? "star filled" : "star"}
          role="radio"
          aria-checked={star <= value}
          tabIndex={0}
          onClick={() => onStarClick(star)}
          onKeyDown={onStarKeyDown(star)}
          aria-label={`${star} star`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
