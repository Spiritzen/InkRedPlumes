import { useEffect, useRef } from 'react';
import './Home.css';
import AvisUtilisateurs from '../components/AvisUtilisateurs';
import Carrousel from '../components/Carrousel';

function Home() {
  // Références pour l'effet de fond animé
  const bgPosition = useRef(0);
  const targetPosition = useRef(0);
  const requestRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      // Le scroll influence la cible du fond (on ralentit l'effet avec un facteur)
      targetPosition.current = window.scrollY * 0.3;
    };

    const animate = () => {
      // Interpolation fluide (type Math.lerp)
      bgPosition.current += (targetPosition.current - bgPosition.current) * 0.08;

      // Application de la position de fond
      const home = document.querySelector('.home-page');
      if (home) {
        home.style.backgroundPosition = `center ${-bgPosition.current}px`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="home-page">
      {/* 🎬 Vidéo de fond */}
      <section className="hero-video">
        <video autoPlay muted loop className="video-background">
          <source src="/videos/inkred_intro.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la balise vidéo.
        </video>
        <div className="overlay-text">
<h1>
  Bienvenue sur <span className="inkred-text">Ink Red</span> <span className="plumes-gold">Plumes</span>
</h1>
          <p>Explorez, vendez et collectionnez des livres rares et précieux </p>
        </div>
      </section>

      {/* 📚 Livres en vedette */}
      <section className="featured-books">
        <h2> Les dernières pépites ajoutés : </h2>
       
          <Carrousel />
        
      </section>

      {/* ℹ️ Présentation */}
<section className="about-section">
  <div className="about-container-limited">
    {/* 📸 Image magique à gauche */}
    <div className="about-image-limited" />

    {/* 📜 Texte à propos */}
   <div className="about-text">
  <h2>À propos de notre librairie</h2>

  <p>
    Que vous soyez <strong>collectionneur passionné</strong>, <strong>auteur</strong> en quête de lecteurs,
    ou simplement quelqu’un qui possède des livres oubliés dans un grenier…<span> </span>
    <span className="inkred-text"> Ink Red </span> <span> </span>
    <span className="plumes-gold"> Plumes </span><span> </span>
    vous ouvre les portes d’un <em>univers unique</em>.
  </p>

  <p>
       <strong>Publiez vos œuvres</strong>, <strong>partagez vos trouvailles</strong>, ou
    <em> redonnez vie</em> à ces livres que vous ne lisez plus.
  </p>

  <p>
      Ici, <em>chaque ouvrage</em> peut devenir une <strong>découverte</strong>, une <strong>rencontre</strong>, une <strong>transmission</strong>.
  </p>

  <p>
       Rejoignez une <strong>communauté engagée</strong> de lecteurs, de vendeurs, et de curieux.
  </p>
</div>
  </div>
</section>

      {/* ⭐ Témoignages */}
      <section className="testimonials">
        <h2>Ils en parlent mieux que nous...</h2>
        <AvisUtilisateurs />
      </section>
      

 
    </div>
  );
}

export default Home;
