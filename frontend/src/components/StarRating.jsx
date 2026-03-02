import React from 'react';
import './StarRating.css';

function StarRating({ note }) {
  const fullStars = Math.floor(note);
  const hasHalfStar = note % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const imgStyle = {
    width: '16px',
    height: '16px',
    objectFit: 'contain'
  };

  return (
    <div className="star-rating">
      {Array(fullStars).fill().map((_, i) => (
        <img key={`full-${i}`} src="/images/star-full.png" alt="★" style={imgStyle} />
      ))}
      {hasHalfStar && (
        <img src="/images/star-half.png" alt="½" style={imgStyle} />
      )}
      {Array(emptyStars).fill().map((_, i) => (
        <img key={`empty-${i}`} src="/images/star-empty.png" alt="☆" style={imgStyle} />
      ))}
    </div>
  );
}

export default StarRating;