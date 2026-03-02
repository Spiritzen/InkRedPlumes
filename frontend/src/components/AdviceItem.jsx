import { useState } from 'react';

function AvisItem({ image, nom, texte, stars, noir }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 100;

  const visibleText = texte.slice(0, maxLength);
  const hiddenText = texte.slice(maxLength);

  return (
    <div className="review content-row-advice">
      <div className="review-header">
        <img src={image} alt="User profile" className="review-image" />
        <div className="review-user-info">
          <span className="review-name">{nom}</span>
          <div className="review-stars">
            {[...Array(stars)].map((_, i) => (
              <img key={i} src="/images/star.png" alt="Star" className="star-icon" />
            ))}
            {noir && <img src="/images/starblack.png" alt="Star" className="star-icon" />}
          </div>
        </div>
      </div>
      <div className="review-text-container">
        <p className="review-text">
          {texte.length <= maxLength || expanded
            ? texte
            : (
              <>
                {visibleText}
                <span className="more-text">{expanded && hiddenText}</span>
              </>
            )}
        </p>
        {texte.length > maxLength && (
          <button
            className="read-more-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '<< Lire moins' : '>> Lire la suite'}
          </button>
        )}
      </div>
    </div>
  );
}

export default AvisItem;
