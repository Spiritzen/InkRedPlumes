import React, { useEffect, useState, useCallback } from 'react';
import './Profil.css';
import ProfilModal from '../components/ProfilModal';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

/** ✅ Liste des cartes stabilisée (ne change plus à chaque render) */
const CARDS = [
  { icon: 'person',        label: 'Modifier mes infos' },
  { icon: 'home',          label: 'Adresse de livraison' },
  { icon: 'vpn_key',       label: 'Changer mon mot de passe' },
  { icon: 'shopping_cart', label: 'Mes commandes' }, // 🛒 badge ici
  { icon: 'rate_review',   label: 'Mes avis' },
  { icon: 'settings',      label: 'Paramètres généraux' }
];

function Profil() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const isAuthenticated = !!localStorage.getItem('token');
  const location = useLocation();

  const [selectedCard, setSelectedCard] = useState(null);
  const [role, setRole] = useState('');               // "client" | "author" | "admin"
  const [pendingCount, setPendingCount] = useState(0); // 🔴 pastille

  // scroll bg parallax existant
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const bgPosition = { current: 0 };
    const targetPosition = { current: 0 };
    let requestRef;

    const handleScroll = () => {
      targetPosition.current = window.scrollY * 0.3;
    };

    const animate = () => {
      bgPosition.current += (targetPosition.current - bgPosition.current) * 0.08;

      const profil = document.querySelector('.profil-container');
      if (profil) {
        profil.style.backgroundPosition = `center ${-bgPosition.current}px`;
      }

      requestRef = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll);
    requestRef = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(requestRef);
    };
  }, []);

  // 🔐 Charger rôle si connecté
  useEffect(() => {
    if (!isAuthenticated) {
      setRole('');
      setPendingCount(0);
      return;
    }
    axios.get(`${base}/api/users/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then(res => setRole(String(res.data.role || '').toLowerCase()))
    .catch(() => setRole(''));
  }, [isAuthenticated, base]);

  // 🧮 Charger le compteur de tâches (comme dans Header)
  const fetchBadgeCount = useCallback(async () => {
    if (!isAuthenticated || !role) {
      setPendingCount(0);
      return;
    }
    try {
      const token = localStorage.getItem('token');

      if (role === 'author') {
        // Auteur : commandes à préparer + ses commandes en attente (achats perso)
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
        // Client : commandes en attente
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
    const onRefresh = () => fetchBadgeCount();
    window.addEventListener('commande:annulee', onRefresh);
    window.addEventListener('commande:expediee', onRefresh);
    window.addEventListener('commande:terminee', onRefresh);
    window.addEventListener('commande:payee', onRefresh);
    return () => {
      window.removeEventListener('commande:annulee', onRefresh);
      window.removeEventListener('commande:expediee', onRefresh);
      window.removeEventListener('commande:terminee', onRefresh);
      window.removeEventListener('commande:payee', onRefresh);
    };
  }, [fetchBadgeCount]);

  // ✅ Auto-ouverture de la carte “Mes commandes” si on vient du panier
  useEffect(() => {
    if (location?.state?.open === 'orders') {
      const ordersCard = CARDS.find(c => c.icon === 'shopping_cart');
      if (ordersCard) setSelectedCard(ordersCard);

      // Nettoyage de l'état de navigation (évite réouverture au "Back")
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        // ✅ catch non vide (pas d'erreur ESLint no-empty)
        console.debug('replaceState a échoué (non bloquant)', err);
      }
    }
  }, [location?.state]); // CARDS est stable (const hors composant)

  return (
    <div className="profil-container">
      <div className="header-spacer"></div>
      <h2 className="profil-title">Mon espace personnel</h2>

      <div className="profil-grid-wrapper">
        <div className="profil-grid">
          {CARDS.map((card, index) => {
            const isOrdersCard = card.icon === 'shopping_cart';
            return (
              <div
                key={index}
                className="profil-card"
                onClick={() => setSelectedCard(card)}
              >
                {/* 🔴 Pastille visible uniquement sur la carte "Mes commandes" */}
                {isOrdersCard && pendingCount > 0 && (
                  <span className="notif-badge">{pendingCount}</span>
                )}
                <span className="material-icons">{card.icon}</span>
                <p>{card.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modale contextuelle */}
      <ProfilModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}

export default Profil;
