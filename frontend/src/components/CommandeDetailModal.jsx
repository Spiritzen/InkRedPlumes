// CommandeDetailModal.jsx
import React, { useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import "./CommandeDetailModal.css";

import CommandeClientEnAttente from "./CommandeClientEnAttente";
import CommandeAuteurPreparation from "./CommandeAuteurPreparation";
import CommandeExpediee from "./CommandeExpediee";
import CommandeTerminee from "./CommandeTerminee";
import CommandePayee from "./CommandePayee"; // ✅ NEW

// S'assure d'avoir une racine de portal dédiée
const ensureModalRoot = () => {
  let el = document.getElementById("modal-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "modal-root";
    document.body.appendChild(el);
  }
  return el;
};

function CommandeDetailModal({
  commande,
  onClose,
  role,              // "client" | "author"
  onCancelled,       // callback commande annulée
  onStatusChange,    // callback statut changé (expédiée)
  onReceived,        // callback réception confirmée (terminee)
  clickedStatus,     // ✅ statut sur lequel l'utilisateur a cliqué ("payee" | "en_cours_de_traitement" | ...)
}) {
  const modalRoot = ensureModalRoot();

  // 🔒 Bloque le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (!commande) return;

    const y = window.scrollY || window.pageYOffset;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      overflow: document.body.style.overflow,
      width: document.body.style.width,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = prev.position || "";
      document.body.style.top = prev.top || "";
      document.body.style.overflow = prev.overflow || "";
      document.body.style.width = prev.width || "";
      window.scrollTo(0, y);
    };
  }, [commande]);

  // 🔝 Remonter en haut quand la commande change
  useLayoutEffect(() => {
    if (!commande) return;
    const overlay = document.querySelector(".detail-overlay-modal");
    if (overlay) overlay.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [commande]);

  const renderContent = () => {
    const statut = (commande?.statut || "").toLowerCase();

    // ✅ Cas universel : "terminee" (client & auteur)
    if (statut === "terminee") {
      return <CommandeTerminee commande={commande} onClose={onClose} />;
    }

    // 👤 Côté client — "payée" / "en cours de traitement" / "en attente de préparation"
    if (role === "client") {
      const isPaidLike = ["payee", "en_cours_de_traitement", "en_attente_de_preparation"].includes(statut);
      if (isPaidLike) {
        return (
          <CommandePayee
            commande={commande}
            onClose={onClose}
            clickedStatus={clickedStatus || statut} // ✅ personnalise le titre/texte
          />
        );
      }
      if (statut === "en_attente") {
        return (
          <CommandeClientEnAttente
            commande={commande}
            onClose={onClose}
            onCancelled={onCancelled}
          />
        );
      }
      if (statut === "expediee") {
        return (
          <CommandeExpediee
            commande={commande}
            role="client"
            onClose={onClose}
            onReceived={onReceived}
          />
        );
      }
    }

    // ✍️ Côté auteur — ventes
    if (role === "author") {
      if (statut === "en_attente_de_preparation") {
        return (
          <CommandeAuteurPreparation
            commande={commande}
            onClose={onClose}
            onShipped={onStatusChange}
          />
        );
      }
      if (statut === "en_attente") {
        return (
          <CommandeClientEnAttente
            commande={commande}
            onClose={onClose}
            onCancelled={onCancelled}
          />
        );
      }
      if (statut === "expediee") {
        return (
          <CommandeExpediee
            commande={commande}
            role="author"
            onClose={onClose}
          />
        );
      }
    }

    // Fallback propre
    return (
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>Statut ou rôle non pris en charge pour le moment.</p>
        <button className="btn-secondary1" onClick={onClose}>Fermer</button>
      </div>
    );
  };

  if (!commande) return null;

  // 🎯 Overlay + Portal (comme toutes tes autres modales)
  return createPortal(
    <div
      className="detail-overlay-modal"
      key={commande?.idCommande}
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} // close uniquement si clic sur overlay
    >
      {renderContent()}
    </div>,
    modalRoot
  );
}

export default CommandeDetailModal;
