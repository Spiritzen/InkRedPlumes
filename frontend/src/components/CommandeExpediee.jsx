// CommandeExpediee.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CommandeDetailModal.css";

const ensureAbsoluteUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) {
    const api = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${api}${url}`;
  }
  return url;
};

export default function CommandeExpediee({ commande, role, onClose, onReceived }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recvLoading, setRecvLoading] = useState(false);

  const token = localStorage.getItem("token");
  const id = commande?.idCommande;
  const base = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      try {
        // Un SEUL endpoint : le back renvoie la bonne projection selon l'utilisateur
        const res = await axios.get(`${base}/api/commandes/${id}/expediee`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancel) setRows(res.data);
      } catch (e) {
        console.error("❌ Chargement détails expédiée échoué :", e);
        if (!cancel) setRows([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    if (token && id) run();
    return () => { cancel = true; };
  }, [token, id, base]);

  const confirmReceived = async () => {
    if (role !== "client") return onClose?.();
    if (!id) return;
    setRecvLoading(true);
    try {
      await axios.post(`${base}/api/commandes/${id}/reception`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onReceived?.(id);
      window.dispatchEvent(new CustomEvent("commande:terminee", { detail: { id } }));
      onClose?.();
    } catch (e) {
      console.error("❌ Confirmation réception impossible :", e);
      alert("Impossible de confirmer la réception. Réessayez.");
    } finally {
      setRecvLoading(false);
    }
  };

  const handleContactSeller = () => {
    const first = rows?.[0];
    const sellerName = `${first?.auteurPrenom ?? ""} ${first?.auteurNom ?? ""}`.trim();
    alert(`Fonction à venir : contacter le vendeur${sellerName ? ` (${sellerName})` : ""}.`);
  };

  if (loading) {
    return (
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>Chargement…</p>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>Commande introuvable ou accès non autorisé.</p>
        <div className="modal-buttons">
          <button className="btn-secondary1" onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }

  const first = rows[0];
  const clientFullName = `${first.clientPrenom ?? ""} ${first.clientNom ?? ""}`.trim();
  const clientAdr = [first.adresse, first.codePostal, first.ville].filter(Boolean).join(" ");

  // 🗓️ Date d’expédition (format FR)
  const rawDate = first.dateExpedition || first.date_expedition || null;
  const dateExpedition = rawDate ? new Date(rawDate).toLocaleString("fr-FR") : "—";

  const total = rows.reduce((acc, r) => acc + Number(r.totalLigne || 0), 0).toFixed(2);

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3 className="modal-title">📦 Commande expédiée</h3>
      <p className="commande-id">Commande : {first.idCommande}</p>
      <p><strong>Date d’expédition :</strong> {dateExpedition}</p>

      {/* 👤 Client (sans email) */}
      <div className="auteur-info">
        <p><strong>Client :</strong> {clientFullName || "—"}</p>
        <p><strong>Adresse :</strong> {clientAdr || "—"}</p>
      </div>

      {/* 📩 Bouton “contacter le vendeur” (pas d'infos vendeur affichées) */}
      <div className="contact-seller" style={{ margin: ".5rem 0 1rem" }}>
        <button className="btn-primary" onClick={handleContactSeller}>
          📩 Contacter le vendeur
        </button>
      </div>

      {/* 🧾 Lignes */}
      {rows.map((r, idx) => {
        const img = ensureAbsoluteUrl(r.imagePath) || "/images/placeholder_book.png";
        const lineTotal = Number(r.totalLigne || 0).toFixed(2);
        return (
          <div key={idx} className="commande-livre-section">
            <img
              src={img}
              alt={r.livreTitre || "Livre"}
              className="commande-livre-img"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = "/images/placeholder_book.png"; }}
            />
            <div className="livre-infos">
              <div className="livre-header-row">
                <h2 className="titre-livre-align">{r.livreTitre}</h2>
              </div>
              {r.resume && <p className="fiche-resume">{r.resume}</p>}
              <div className="modal-price-block">
                <p><strong>Prix unitaire :</strong> {Number(r.prixUnitaire || 0).toFixed(2)} €</p>
                <p><strong>Quantité :</strong> {r.quantite}</p>
                <p><strong>Total ligne :</strong> {lineTotal} €</p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="modal-price-block">
        <p style={{ fontSize: "1.1rem" }}>
          <strong>Total commande :</strong> {total} €
        </p>
      </div>

      <div className="modal-buttons">
        <button className="btn-secondary1" onClick={onClose}>❌ Fermer</button>
        {role === "client" && (
          <button className="btn-pay" onClick={confirmReceived} disabled={recvLoading}>
            {recvLoading ? "Traitement…" : "📬 Commande reçue"}
          </button>
        )}
      </div>
    </div>
  );
}
