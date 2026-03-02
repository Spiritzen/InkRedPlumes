import { useEffect } from 'react';
import './AvisUtilisateurs.css'; // 👉 Tu peux extraire le CSS ici ou l’inclure dans Home.css

function AvisUtilisateurs() {
useEffect(() => {
  const reviews = document.querySelectorAll('.review');

  function animateStars(stars) {
    stars.forEach((star, index) => {
      setTimeout(() => {
        star.classList.add('visible');
      }, index * 200); // 250ms entre chaque étoile
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const review = entry.target;
      const stars = review.querySelectorAll('.star-icon');
      const index = parseInt(review.dataset.index) || 0;

      if (entry.isIntersecting) {
        // ✨ Animation en cascade selon l’index
        setTimeout(() => {
          review.classList.add('show');

     if (!review.classList.contains('played')) {
  requestAnimationFrame(() => {
    stars.forEach(s => s.classList.remove('visible'));
    setTimeout(() => {
      animateStars(stars);
      // 🪄 Une fois les étoiles animées, on autorise le hover
      setTimeout(() => {
        review.classList.add('hover-ready');
      }, stars.length * 250); // ≈ durée totale des étoiles
    }, 300);
  });
  review.classList.add('played');
}
        }, index * 100); // Décalage d’apparition progressif entre les avis
} else {
  // 🔁 Reset pour pouvoir rejouer l’animation
  review.classList.remove('show', 'played', 'hover-ready');
  stars.forEach(s => s.classList.remove('visible'));
}
    });
  }, {
    threshold: 0.5
  });

  reviews.forEach((review, index) => {
    review.classList.add(index % 2 === 0 ? 'from-left' : 'from-right');
    review.dataset.index = index; // 🧩 sert pour l'effet cascade
    observer.observe(review);
  });

  return () => {
    observer.disconnect();
  };
}, []);




  return (
    <section className="avis-section">
      

      {/* Avis de Sophie D. */}
      <div className="review content-row-advice">
        <div className="review-header">
          <img src="/images/bulle.png" alt="User profile" className="review-image" />
          <div className="review-user-info">
            <span className="review-name">Sophie D.</span>
            <div className="review-stars">
              {[...Array(5)].map((_, i) => (
                <img key={i} src="/images/star.png" alt="Star" className="star-icon" />
              ))}
            </div>
          </div>
        </div>
        <div className="review-text-container">
          <p className="review-text">
             "Je suis tombée par hasard sur un roman que je cherchais depuis des années... Ink Red Plumes est devenu mon lieu de prédilection pour dénicher des perles oubliées."
  
          </p>
        </div>
      </div>

      {/* Avis de Elena R. */}
      <div className="review content-row-advice">
        <div className="review-header">
          <img src="/images/bulle1.png" alt="User profile" className="review-image" />
          <div className="review-user-info">
            <span className="review-name">Elena R.</span>
            <div className="review-stars">
              {[...Array(5)].map((_, i) => (
                <img key={i} src="/images/star.png" alt="Star" className="star-icon" />
              ))}
            </div>
          </div>
        </div>
        <div className="review-text-container">
          <p className="review-text">
           "Publier mon recueil ici a été une révélation : la mise en ligne est fluide, et j’ai pu échanger avec des lecteurs passionnés. Je recommande à tous les auteurs débutants."
          </p>
        </div>
      </div>

      {/* Avis de Stéphane P. */}
      <div className="review content-row-advice">
        <div className="review-header">
          <img src="/images/bulle2.png" alt="User profile" className="review-image" />
          <div className="review-user-info">
            <span className="review-name">Stéphane P.</span>
            <div className="review-stars">
              {[...Array(4)].map((_, i) => (
                <img key={i} src="/images/star.png" alt="Star" className="star-icon" />
              ))}
              <img src="/images/starblack.png" alt="Star" className="star-icon" />
            </div>
          </div>
        </div>
        <div className="review-text-container">
          <p className="review-text">
           "J’avais une petite collection de livres anciens qui dormait dans un grenier. Grâce à cette plateforme, j’ai pu leur donner une seconde vie auprès de vrais passionnés."

          </p>
        </div>
      </div>
    </section>
  );
}

export default AvisUtilisateurs;
