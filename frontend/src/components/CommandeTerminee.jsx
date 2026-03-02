// CommandeTerminee.jsx
import { useEffect, useState } from "react";
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

export default function CommandeTerminee({ commande, onClose }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const id = commande?.idCommande;
  const base = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get(`${base}/api/commandes/${id}/terminee`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setRows(Array.isArray(res.data) ? res.data : [res.data]);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (token && id) load(); else { setLoading(false); setRows([]); }
    return () => { cancelled = true; };
  }, [token, id, base]);

  const handleContactSeller = () => {
    // Placeholder — on branchera plus tard vers une page/formulaire
    alert("Fonction à venir : contacter le vendeur.");
  };

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {loading ? (
        <p>Chargement…</p>
      ) : !rows || rows.length === 0 ? (
        <>
          <h3 className="modal-title">✅ Commande terminée</h3>
          <p>Commande introuvable ou accès non autorisé.</p>
          <div className="modal-buttons">
            <button className="btn-secondary1" onClick={onClose}>Fermer</button>
          </div>
        </>
      ) : (
        <>
          <h3 className="modal-title">✅ Commande terminée</h3>
          <p className="commande-id">Commande : {rows[0].idCommande}</p>

          {/* Date d’expédition */}
          <p>
            <strong>Date d’expédition :</strong>{" "}
            {(() => {
              const raw = rows[0].dateExpedition || rows[0].date_expedition || null;
              return raw ? new Date(raw).toLocaleString("fr-FR") : "—";
            })()}
          </p>

          {/* Infos client (sans email) */}
          {(() => {
            const r = rows[0];
            const full = `${r.clientPrenom ?? ""} ${r.clientNom ?? ""}`.trim();
            const adr = [r.adresse, r.codePostal, r.ville].filter(Boolean).join(" ");
            return (
              <div className="auteur-info">
                <p><strong>Client :</strong> {full || "—"}</p>
                <p><strong>Adresse :</strong> {adr || "—"}</p>
              </div>
            );
          })()}

          {/* 📩 Bouton contacter le vendeur (placeholder) */}
          <div className="contact-seller" style={{ marginTop: ".5rem" }}>
            <button className="btn-primary" onClick={handleContactSeller}>
              📩 Contacter le vendeur
            </button>
          </div>

          {/* Lignes */}
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

          {/* Total */}
          <div className="modal-price-block">
            <p style={{ fontSize: "1.1rem" }}>
              <strong>Total commande :</strong>{" "}
              {rows.reduce((acc, r) => acc + Number(r.totalLigne || 0), 0).toFixed(2)} €
            </p>
          </div>

          <div className="modal-buttons">
            <button className="btn-secondary1" onClick={onClose}>❌ Fermer</button>
          </div>
        </>
      )}
    </div>
  );
}
