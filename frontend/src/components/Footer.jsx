// src/components/Footer.jsx
import './Footer.css';
import logo from '../assets/logoIRP.png'; // Assure-toi que ce fichier existe

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Colonne 1 : Logo */}
        <div className="footer-column center-content">
          <img src={logo} alt="Logo Ink Red Plumes" className="footer-logo" />
        </div>

        {/* Colonne 2 : Liens pro */}
        <div className="footer-column center-content">
          <div>
            <h4>Ink Red Plumes</h4>
            <ul>
              <li><a href="https://www.youtube.com/watch?v=DVOQzauF8Es" target="_blank" rel="noopener noreferrer">🎬 Portfolio vidéo</a></li>
              <li><a href="https://fr.linkedin.com/in/sebastien-cantrelle-26b695106" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a></li>
              <li><a href="https://www.afci-formation.fr/cda/" target="_blank" rel="noopener noreferrer">🎓 Formation CDA - AFCI</a></li>
            </ul>
          </div>
        </div>

        {/* Colonne 3 : Navigation */}
        <div className="footer-column center-content">
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><a href="/">🏠 Accueil</a></li>
              <li><a href="/mes-livres">📚 Mes livres</a></li>
              <li><a href="/login">🔐 Connexion</a></li>
              <li><a href="mailto:sebastien@inkredplumes.com">📧 Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Colonne 4 : Infos légales */}
        <div className="footer-column center-content">
          <div>
            <h4>Informations</h4>
            <ul>
              <li><a href="#">🔒 Confidentialité</a></li>
              <li><a href="#">📄 Mentions légales</a></li>
              <li><a href="#">⚖️ Conditions d’utilisation</a></li>
            </ul>
          </div>
        </div>
      </div>

      <p className="footer-bottom">© 2025 Ink Red Plumes – Tous droits réservés</p>
    </footer>
  );
}

export default Footer;
