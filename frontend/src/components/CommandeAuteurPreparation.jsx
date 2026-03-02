// CommandeAuteurPreparation.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CommandeDetailModal.css";

/**
 * Ensure absolute URL for images (keeps dev/prod compatible).
 */
const ensureAbsoluteUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) {
    const api = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${api}${url}`;
  }
  return url;
};

/**
 * Props:
 * - commande: { idCommande, statut, ... }
 * - onClose: () => void
 * - onShipped?: (idCommande) => void   (only used in author mode)
 * - readOnly?: boolean                 (client paid / in-processing view)
 */
export default function CommandeAuteurPreparation({ commande, onClose, onShipped, readOnly = false }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipLoading, setShipLoading] = useState(false);

  const token = localStorage.getItem("token");
  const id = commande?.idCommande;
  const base = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // ---- Fetch data (author vs readOnly/client) ----
  useEffect(() => {
    let cancel = false;

    const run = async () => {
      try {
        const url = readOnly
          ? `${base}/api/commandes/${id}/payee`
          : `${base}/api/commandes/auteur/${id}/preparation`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!cancel) {
          // API may return an array of line items
          setRows(Array.isArray(res.data) ? res.data : [res.data]);
        }
      } catch (err) {
        console.error("❌ Failed to load preparation:", err);
        if (!cancel) setRows([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    if (token && id) run();
    else {
      setLoading(false);
      setRows([]);
    }

    return () => { cancel = true; };
  }, [token, id, base, readOnly]);

  // ---- Ship (author only) ----
  const handleShip = async () => {
    if (readOnly || !id || shipLoading) return;
    setShipLoading(true);
    try {
      await axios.post(
        `${base}/api/commandes/${id}/expedier`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 1) optimistic callback to parent
      if (typeof onShipped === "function") onShipped(id);

      // 2) event-bus (keep counters in sync in CommandeViewer)
      window.dispatchEvent(new CustomEvent("commande:expediee", { detail: { id } }));

      // 3) close modal
      onClose?.();
    } catch (err) {
      console.error("❌ Unable to ship:", err);
      const status = err?.response?.status;
      if (status === 403) {
        alert("Accès refusé. Connecte-toi avec un compte auteur.");
      } else if (status === 409) {
        alert("La commande n'est pas dans un état expédiable.");
      } else {
        alert("Expédition impossible. Réessayez.");
      }
    } finally {
      setShipLoading(false);
    }
  };

  // ---- Rendering ----
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
        <p>Commande introuvable ou non autorisée.</p>
        <div className="modal-buttons">
          <button className="btn-secondary1" onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }

  // A single order can contain multiple line items
  const first = rows[0] || {};
  const clientFullName = `${first.clientPrenom ?? ""} ${first.clientNom ?? ""}`.trim();
  const clientAdr = [first.adresse, first.codePostal, first.ville].filter(Boolean).join(" ");
  const total = rows.reduce((acc, r) => acc + Number(r?.totalLigne || 0), 0).toFixed(2);

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3 className="modal-title">
        {readOnly ? "🧾 Commande payée / en traitement" : "📦 Préparation de la commande"}
      </h3>
      <p className="commande-id">Commande : {first.idCommande}</p>

      {/* Customer block */}
      <div className="auteur-info">
        <p><strong>Client :</strong> {clientFullName || "—"}</p>
        <p><strong>Email :</strong> {first.clientEmail || "—"}</p>
        <p><strong>Adresse :</strong> {clientAdr || "—"}</p>
      </div>

      {/* Line items */}
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
              onError={(ev) => { ev.currentTarget.src = "/images/placeholder_book.png"; }}
            />
            <div className="livre-infos">
              <div className="livre-header-row">
                <h2 className="titre-livre-align">{r.livreTitre || "—"}</h2>
              </div>
              {r.resume && <p className="fiche-resume">{r.resume}</p>}
              <div className="modal-price-block">
                <p><strong>Prix unitaire :</strong> {Number(r.prixUnitaire || 0).toFixed(2)} €</p>
                <p><strong>Quantité :</strong> {r.quantite ?? "—"}</p>
                <p><strong>Total ligne :</strong> {lineTotal} €</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Order total */}
      <div className="modal-price-block">
        <p style={{ fontSize: "1.1rem" }}>
          <strong>Total commande :</strong> {total} €
        </p>
      </div>

      {/* Actions */}
      <div className="modal-buttons">
        <button className="btn-secondary1" onClick={onClose}>❌ Fermer</button>

        {!readOnly && (
          <button className="btn-pay" onClick={handleShip} disabled={shipLoading}>
            {shipLoading ? "Traitement…" : "✅ Confirmer l’expédition"}
          </button>
        )}
      </div>
    </div>
  );
}
