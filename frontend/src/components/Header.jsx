import { useEffect, useState, useCallback } from 'react';
import './Header.css';
import barreImageDesktop from '../assets/barre600width.png';
import barreImageMobile from '../assets/barre300width.png'; // ✅ add
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const navigate = useNavigate();
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const isAuthenticated = !!localStorage.getItem("token");
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const placeholderTexte = isAuthenticated ? `Bienvenue ${prenom}` : "Entrez votre recherche...";

  useEffect(() => {
    if (!isAuthenticated) {
      setPrenom('');
      setRole('');
      setPendingCount(0);
      return;
    }
    axios.get(`${base}/api/users/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        setPrenom(res.data.firstName);
        setRole(String(res.data.role || '').toLowerCase());
      })
      .catch(() => {
        setPrenom('👤');
        setRole('');
      });
  }, [isAuthenticated, base]);

  const fetchBadgeCount = useCallback(async () => {
    if (!isAuthenticated || !role) {
      setPendingCount(0);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (role === 'author') {
        const [auteurRes, clientRes] = await Promise.all([
          axios.get(`${base}/api/commandes/auteur/details`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${base}/api/commandes/client/details`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const aRows = Array.isArray(auteurRes.data) ? auteurRes.data : [];
        const cRows = Array.isArray(clientRes.data) ? clientRes.data : [];

        const countPrep = aRows.filter(r =>
          String(r.statut || r.status || '').toLowerCase() === 'en_attente_de_preparation'
        ).length;
        const countClientWaiting = cRows.filter(r =>
          String(r.statut || r.status || '').toLowerCase() === 'en_attente'
        ).length;

        setPendingCount(countPrep + countClientWaiting);
      } else {
        const clientRes = await axios.get(`${base}/api/commandes/client/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cRows = Array.isArray(clientRes.data) ? clientRes.data : [];
        const countWaiting = cRows.filter(r =>
          String(r.statut || r.status || '').toLowerCase() === 'en_attente'
        ).length;
        setPendingCount(countWaiting);
      }
    } catch (err) {
      console.error('❌ Impossible de charger le compteur commandes :', err);
      setPendingCount(0);
    }
  }, [isAuthenticated, role, base]);

  useEffect(() => {
    fetchBadgeCount();
    const id = setInterval(fetchBadgeCount, 60_000);
    return () => clearInterval(id);
  }, [fetchBadgeCount]);

  useEffect(() => {
    const refresh = () => fetchBadgeCount();
    window.addEventListener('commande:annulee', refresh);
    window.addEventListener('commande:expediee', refresh);
    window.addEventListener('commande:terminee', refresh);
    window.addEventListener('commande:payee', refresh);
    return () => {
      window.removeEventListener('commande:annulee', refresh);
      window.removeEventListener('commande:expediee', refresh);
      window.removeEventListener('commande:terminee', refresh);
      window.removeEventListener('commande:payee', refresh);
    };
  }, [fetchBadgeCount]);

  useEffect(() => {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.querySelector('.menu');
    if (!menuToggle || !menu) return;

    const toggle = (ev) => {
      ev.stopPropagation();
      menu.classList.toggle('open');
    };

    const close = () => {
      menu.classList.remove('open');
    };

    menuToggle.addEventListener('click', toggle);
    document.addEventListener('click', close);
    return () => {
      menuToggle.removeEventListener('click', toggle);
      document.removeEventListener('click', close);
    };
  }, []);

  // ✅ Ouvre directement Profil + carte "Mes commandes"
  const openOrders = (ev) => {
    ev.stopPropagation();
    const menu = document.querySelector('.menu');
    menu?.classList.remove('open');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/profil', { state: { open: 'orders' } });
  };

  return (
 <header className="searchbar">
    {/* ✅ Responsive image swap: < 740px -> 300x55 */}
    <picture>
      <source media="(max-width: 740px)" srcSet={barreImageMobile} />
      <img src={barreImageDesktop} alt="barre nav" className="searchbar-bg" />
    </picture>

    <div className="search-container">
      <span className="search-icon material-icons">search</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholderTexte}
      />
    </div>

      <div className="menu">
        <button className="menu-toggle" id="menu-toggle">
          <span className="icon material-icons">add</span>
          {pendingCount > 0 && (
            <span className="notif-badge">{pendingCount}</span>
          )}
        </button>

        <ul className="menu-items">
          <li className={`item ${isAuthenticated ? 'logout' : 'login'}`}>
            <button
              title={isAuthenticated ? "Se déconnecter" : "Connexion"}
              onClick={(ev) => {
                ev.stopPropagation();
                if (isAuthenticated) {
                  localStorage.removeItem("token");
                  navigate('/');
                  window.location.reload();
                } else {
                  navigate('/login');
                }
              }}
            >
              <span className={`material-icons ${isAuthenticated ? 'rotated' : ''}`}>
                {isAuthenticated ? 'logout' : 'login'}
              </span>
            </button>
          </li>

          <li className="item settings">
            <button
              title="Paramètres"
              onClick={(ev) => {
                ev.stopPropagation();
                if (!isAuthenticated) {
                  navigate('/login');
                } else if (role === 'author') {
                  navigate('/mes-livres');
                } else {
                  navigate('/profil');
                }
              }}
            >
              <span className={`material-icons ${isAuthenticated ? 'rotated' : ''}`}>
                settings
              </span>
            </button>
          </li>

          <li className="item">
            <button title="Bookmarks"><span className="material-icons">bookmark</span></button>
          </li>

          <li className="item">
            <button title="Message"><span className="material-icons">email</span></button>
          </li>

          {/* 🛒 Panier → ouvre Profil + Mes commandes */}
          <li className="item cart">
            <button title="Cart" onClick={openOrders}>
              <span className="material-icons">shopping_cart</span>
              {pendingCount > 0 && (
                <span className="notif-badge small">{pendingCount}</span>
              )}
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
