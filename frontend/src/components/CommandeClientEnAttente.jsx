// CommandeClientEnAttente.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommandeDetailModal.css';
import './StarRating.css';
import StarRating from './StarRating';

function CommandeClientEnAttente({ commande, onClose, openModalNouvelleCommande, onCancelled }) {
  const [commandeDetaillee, setCommandeDetaillee] = useState(null);
  const [commandesSimilaires, setCommandesSimilaires] = useState([]);
  const [topComment, setTopComment] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const topRef = useRef(null);

  function getScrollableParent(node) {
    if (!node) return null;
    let p = node.parentElement;
    while (p) {
      const style = getComputedStyle(p);
      const overflowAll = `${style.overflow}${style.overflowY}${style.overflowX}`;
      const canScroll = /(auto|scroll)/i.test(overflowAll);
      if (canScroll && p.scrollHeight > p.clientHeight) return p;
      p = p.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  // UX: toujours démarrer en haut quand on ouvre/charge une commande
  useLayoutEffect(() => {
    if (topRef.current && typeof topRef.current.scrollIntoView === 'function') {
      topRef.current.scrollIntoView({ block: 'start', inline: 'nearest' });
    }
    const scroller = getScrollableParent(topRef.current);
    if (scroller) scroller.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [commande?.idCommande]);

  // Data: charger détails de la commande + autres en attente du même auteur
  useEffect(() => {
    let abort = false;

    const fetchCommandeEnAttente = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/commandes/client/en-attente',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (abort) return;

        const detail = res.data.find((c) => c.idCommande === commande?.idCommande) || null;
        setCommandeDetaillee(detail);

        const similaires = res.data.filter(
          (c) => c.idCommande !== commande?.idCommande && c.auteurId === commande?.auteurId
        );
        setCommandesSimilaires(similaires);
      } catch (error) {
        if (!abort) console.error('❌ Erreur chargement commande détaillée :', error);
      }
    };

    if (token && commande?.idCommande) {
      fetchCommandeEnAttente();
    } else {
      setCommandeDetaillee(null);
      setCommandesSimilaires([]);
    }

    return () => { abort = true; };
  }, [commande?.idCommande, commande?.auteurId, token]);

  // Data: charger le TOP commentaire une fois livreId connu
  useEffect(() => {
    let abort = false;
    const livreId = commandeDetaillee?.livreId;
    if (!livreId || !token) {
      setTopComment(null);
      return;
    }

    const fetchTopComment = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/comments/livres/${livreId}/top-comment`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!abort) setTopComment(res.data ?? null);
      } catch (err) {
        if (!abort) console.error('❌ Erreur récupération top commentaire :', err);
      }
    };

    fetchTopComment();
    return () => { abort = true; };
  }, [commandeDetaillee?.livreId, token]);

  // Handlers
  const handleOpenAutre = () => {
    onClose?.();
    setTimeout(() => { openModalNouvelleCommande?.(); }, 300);
  };

  const openConfirm = () => setShowConfirm(true);
  const closeConfirm = () => setShowConfirm(false);

  const confirmCancel = async () => {
    if (!commande?.idCommande) return;
    if (!token) {
      alert("Vous devez être connecté pour annuler une commande.");
      return;
    }
    try {
      setIsCancelling(true);
      await axios.post(
        `http://localhost:8080/api/commandes/${commande.idCommande}/annuler`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (typeof onCancelled === 'function') {
        onCancelled(commande.idCommande);
      } else {
        window.dispatchEvent(new CustomEvent('commande:annulee', { detail: { id: commande.idCommande } }));
      }
      closeConfirm();
      onClose?.();
    } catch (err) {
      console.error('❌ Annulation impossible :', err);
      alert("Annulation impossible. Vérifiez que la commande est encore 'en_attente' ou réessayez.");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e) => { if (e.key === 'Escape') closeConfirm(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirm]);

  const handlePayClick = () => {
    if (!commandeDetaillee) return;

    onClose?.();

    const prix = Number(commandeDetaillee?.prixUnitaire ?? 0);
    const qte = Number(commandeDetaillee?.quantite ?? 0);
    const total = +(prix * qte).toFixed(2);

    const imgSrc = /^https?:\/\//i.test(commandeDetaillee?.imagePath)
      ? commandeDetaillee.imagePath
      : `http://localhost:8080${commandeDetaillee?.imagePath || ''}`;

    setTimeout(() => {
      navigate("/paiement", {
        state: {
          orderId: commande?.idCommande,
          amount: total,
          item: {
            title: commandeDetaillee?.livreTitre,
            image: imgSrc,
            qty: qte,
            unitPrice: prix,
          },
          from: "commande-en-attente",
        },
      });
    }, 50);
  };

  // NEW — bouton “contacter le vendeur”
  const handleContactSeller = () => {
    const fullName = `${commandeDetaillee?.auteurPrenom ?? ""} ${commandeDetaillee?.auteurNom ?? ""}`.trim();
    alert(`Fonction à venir : contacter le vendeur${fullName ? ` (${fullName})` : ""}.`);
  };

  // Rendering
  if (!commandeDetaillee) return <p>Chargement des détails...</p>;

  const {
    livreTitre,
    imagePath,
    resume,
    prixUnitaire,
    quantite,
    noteMoyenne,
    auteurPrenom,
    auteurNom,
    auteurNote,
  } = commandeDetaillee;

  const prix = Number(prixUnitaire ?? 0);
  const qte = Number(quantite ?? 0);
  const total = (prix * qte).toFixed(2);

  const imageSrc = /^https?:\/\//i.test(imagePath)
    ? imagePath
    : `http://localhost:8080${imagePath || ''}`;

  const sellerFullName = `${auteurPrenom ?? ""} ${auteurNom ?? ""}`.trim();
  const modalRoot = document.getElementById('modal-root') || document.body;

  return (
    <>
      <div
        className="modal-content"
        key={commande?.idCommande}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={topRef} />

        <h3 className="modal-title">🕒 Commande en attente</h3>
        <p className="commande-attente-text">
          Cette commande est en attente de règlement. Une fois payée, elle sera transmise au vendeur pour traitement.
        </p>

        <p className="commande-id">Commande : {commande?.idCommande}</p>

        <div className="commande-livre-section">
          <img
            src={imageSrc}
            alt={livreTitre}
            className="commande-livre-img"
            loading="lazy"
          />

          <div className="livre-infos">
            <div className="livre-header-row">
              <h2 className="titre-livre-align">{livreTitre}</h2>
              <div className="note-right">
                <StarRating note={Number(noteMoyenne) || 0} />
              </div>
            </div>
            <p className="fiche-resume">{resume}</p>
          </div>
        </div>

        <div className="modal-price-block">
          <p><strong>Prix :</strong> {prix.toFixed(2)} €</p>
          <p><strong>Quantité :</strong> {qte}</p>
          <p><strong>Total :</strong> {total} €</p>
        </div>

        {/* 🛍️ Vendeur */}
        <div className="auteur-info">
          <p><strong>Vendeur :</strong> {sellerFullName || "—"}</p>
          <StarRating note={Number(auteurNote) || 0} />

          {topComment && (
            <div className="top-commentaire">
              <p><strong>💬 Commentaire :</strong> {topComment.contenu}</p>
              <StarRating note={Number(topComment.note) || 0} />
            </div>
          )}
        </div>

        {/* 📩 Bouton contacter le vendeur */}
        <div className="contact-seller">
          <button className="btn-primary" onClick={handleContactSeller}>
            📩 Contacter le vendeur
          </button>
        </div>

        {commandesSimilaires.length > 0 && (
          <div className="commande-similaire-zone">
            <button className="btn-secondary" onClick={handleOpenAutre}>
              ➕ Voir d'autres livres en attente du même vendeur
            </button>
          </div>
        )}

        <div className="modal-buttons">
          <button className="btn-pay" onClick={handlePayClick}>💳 Paiement</button>
          <button className="btn-secondary1" onClick={onClose}>❌ Fermer</button>
          <button className="btn-delete" onClick={openConfirm} disabled={isCancelling}>
            Supprimer
          </button>
        </div>
      </div>

      {showConfirm && createPortal(
        <div
          className="confirm-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeConfirm(); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">⚠️ Confirmation</h3>
            <p className="confirm-message">
              Vous allez supprimer <strong>« {livreTitre} »</strong> × {qte} de votre panier.
            </p>

            <div className="confirm-actions">
              <button className="btn-secondary1" onClick={closeConfirm} disabled={isCancelling}>
                Annuler
              </button>
              <button className="btn-delete" onClick={confirmCancel} disabled={isCancelling}>
                {isCancelling ? 'Veuillez patienter…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>,
        modalRoot
      )}
    </>
  );
}

export default CommandeClientEnAttente;
