// src/components/Carrousel.jsx
import { useEffect, useState, useRef } from 'react';
import './Carrousel.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

function Carrousel() {
  const [livres, setLivres] = useState([]);
  const [selectedLivre, setSelectedLivre] = useState(null);
  const swiperRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/livres')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => b.idLivre - a.idLivre);
        setLivres(sorted.slice(0, 10));
      })
      .catch((err) => console.error('❌ Erreur fetch :', err));
  }, []);

  useEffect(() => {
    if (selectedLivre) {
      fetch(`http://localhost:8080/api/livres/${selectedLivre.idLivre}/categories`)
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error("Erreur catégories :", err));
    } else {
      setCategories([]);
    }
  }, [selectedLivre]);

  return (
    <div className="carrousel-container">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={30}
        slidesPerView={5}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation
        grabCursor
        centeredSlides={true}
        speed={1200}
        className="custom-swiper"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setTimeout(() => {
            swiper.autoplay?.start();
          }, 500);
        }}
        breakpoints={{
          1200: { slidesPerView: 5, spaceBetween: 40 },
          1100: { slidesPerView: 4, spaceBetween: 20 },
          850:  { slidesPerView: 3, spaceBetween: 20 },
          580:  { slidesPerView: 3, spaceBetween: 15 },
          480:  { slidesPerView: 2, spaceBetween: 15 },
          0:    { slidesPerView: 2, spaceBetween: 8 }
        }}
      >
        {livres.map((livre) => (
          <SwiperSlide key={livre.idLivre}>
            <div className="carrousel-card" onClick={() => setSelectedLivre(livre)}>
              <div className="carrousel-card-inner">
                <img
                  src={`http://localhost:8080${livre.imagePath}`}
                  alt={livre.titre}
                  className="carrousel-image"
                />
                <div className="carrousel-title">{livre.titre}</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {selectedLivre && (
        <div className="carrousel-modal" onClick={() => setSelectedLivre(null)}>
          <div className="carrousel-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`http://localhost:8080${selectedLivre.imagePath}`}
              alt={selectedLivre.titre}
            />
            <h3>{selectedLivre.titre}</h3>

            {categories.length > 0 && (
              <p style={{ color: 'lightgoldenrodyellow', fontStyle: 'italic' }}>
                <span style={{ textDecorationLine: 'underline', color: 'rgb(233, 199, 7)' }}>
                  Catégorie{categories.length > 1 ? 's' : ''}
                </span> : {categories.join(', ')}
              </p>
            )}

            <p>{selectedLivre.resume}</p>
            <p className="carrousel-modal-price">{selectedLivre.prix.toFixed(2)} €</p>

            <div className="carrousel-modal-buttons">
              <button className="carrousel-more-btn">Savoir plus</button>
              <button onClick={() => setSelectedLivre(null)} className="carrousel-exit-btn">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Carrousel;
