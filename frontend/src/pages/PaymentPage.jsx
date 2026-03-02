// PaymentPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentPage.css";

// ✅ Normalise les URLs d'image (relative -> absolue via VITE_API_URL)
const ensureAbsoluteUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${apiBase}${url}`;
  }
  return url;
};

// ⏳ Modale "autorisation en cours"
function PaymentProcessingModal({ onClose }) {
  useEffect(() => {
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prev.overflow || "";
      document.body.style.position = prev.position || "";
      document.body.style.width = prev.width || "";
    };
  }, []);
  return (
    <div className="pay-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
        <div className="loader-ring" aria-hidden />
        <h3 className="pay-modal-title">Autorisation en cours…</h3>
        <p className="pay-modal-sub">Veuillez patienter quelques secondes.</p>
      </div>
    </div>
  );
}

// ✅ Modale de résultat (succès / échec)
function PaymentResultModal({ status = "success", title, message, onClose }) {
  useEffect(() => {
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prev.overflow || "";
      document.body.style.position = prev.position || "";
      document.body.style.width = prev.width || "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSuccess = status === "success";
  const finalTitle = title ?? (isSuccess ? "Paiement confirmé" : "Paiement refusé");
  const finalMsg =
    message ??
    (isSuccess
      ? "Votre paiement a bien été accepté. Merci pour votre achat ✨"
      : "Le paiement n’a pas pu aboutir. Veuillez réessayer ou choisir un autre moyen de paiement.");

  return (
    <div
      className="pay-result-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="pay-result-box" onClick={(e) => e.stopPropagation()}>
        <div className={`pay-result-icon ${isSuccess ? "ok" : "ko"}`} aria-hidden>
          {isSuccess ? "✅" : "❌"}
        </div>
        <h3 className="pay-result-title">{finalTitle}</h3>
        <p className="pay-result-msg">{finalMsg}</p>
        <div className="pay-result-actions">
          <button
            className={isSuccess ? "btn-pay" : "btn-secondary"}
            onClick={onClose}
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔎 Lis *les deux* shapes possibles: { imageSrc } OU { item: { image, ... } }
  const {
    orderId,        // ← idCommande (numérique) passé par navigate depuis la modale
    amount,
    livreTitre,
    imageSrc,       // ← format "plat"
    quantity,
    item: stateItem // ← format structuré { title, image, qty, unitPrice }
  } = location.state || {};

  const imgRaw = stateItem?.image ?? imageSrc;
  const thumb = ensureAbsoluteUrl(imgRaw) || "/images/placeholder_book.png";

  const [currentOrderId] = useState(orderId ?? "CMD-FAKE-2025");
  const [totalAmount] = useState(Number(amount ?? 42).toFixed(2));
  const qty = Number(stateItem?.qty ?? quantity ?? 1);
  const title = stateItem?.title ?? livreTitre ?? "Titre du livre";

  // 🔐 Prépare l'id pour l'API (doit être numérique)
  const apiOrderId = Number.isFinite(Number(orderId))
    ? Number(orderId)
    : Number.isFinite(Number(currentOrderId))
    ? Number(currentOrderId)
    : null;

  // Méthode + champs
  const [method, setMethod] = useState("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPseudo, setPaypalPseudo] = useState("");
  const [pscCode, setPscCode] = useState("");
  const [pscAlias, setPscAlias] = useState("");
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ✅ Résultat (ouvre la jolie modale)
  const [result, setResult] = useState({ open: false, status: "success", title: "", message: "" });

  // 🎞️ Parallax BG
  const bgPos = useRef(0);
  const targetPos = useRef(0);
  const rafRef = useRef();

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => { targetPos.current = window.scrollY * 0.3; };
    const animate = () => {
      bgPos.current += (targetPos.current - bgPos.current) * 0.08;
      const el = document.querySelector(".pay-page");
      if (el) el.style.backgroundPosition = `center ${-bgPos.current}px`;
      rafRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener("scroll", onScroll);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ✅ Validation simple
  const validate = () => {
    const e = {};
    if (method === "card") {
      if (cardName.trim().length < 2) e.cardName = "Nom trop court.";
      if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ""))) e.cardNumber = "Numéro invalide (16 chiffres).";
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) e.cardExpiry = "Format MM/AA attendu.";
      if (!/^\d{3,4}$/.test(cardCvv)) e.cardCvv = "CVV invalide.";
    } else if (method === "paypal") {
      if (!/.+@.+\..+/.test(paypalEmail)) e.paypalEmail = "Email invalide.";
      if (paypalPseudo.trim().length < 2) e.paypalPseudo = "Pseudo trop court.";
    } else if (method === "paysafecard") {
      if (!/^\d{16}$/.test(pscCode.replace(/\s+/g, ""))) e.pscCode = "Code invalide (16 chiffres).";
      if (pscAlias.trim().length < 2) e.pscAlias = "Alias trop court.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🚀 Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);
    setShowModal(true);

    // ⏳ Simulation d'autorisation
    setTimeout(async () => {
      setProcessing(false);
      setShowModal(false);

      // 🧭 Base API + token
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const token = localStorage.getItem("token");

      // ✅ Après “processing” → on appelle le backend pour marquer la commande comme payée
      //    (devient EN_ATTENTE_DE_PREPARATION côté serveur, comme convenu)
      if (apiOrderId && token) {
        try {
          await axios.post(
            `${apiBase}/api/commandes/${apiOrderId}/payer`,
            { moyen: method }, // corps optionnel (le backend peut l’ignorer)
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // 🎉 Succès API → on ouvre la modale “paiement confirmé”
          setResult({
            open: true,
            status: "success",
            title: "Paiement confirmé",
            message: `Votre paiement de ${totalAmount} € a bien été accepté.`,
          });
        } catch (err) {
          console.error("❌ Erreur lors de la confirmation de paiement :", err);
          // ❌ Échec API → on affiche une modale d’échec
          setResult({
            open: true,
            status: "error",
            title: "Paiement confirmé (local), mais erreur serveur",
            message:
              "Le paiement a été autorisé, mais la mise à jour du statut de votre commande a échoué. " +
              "Veuillez actualiser la page ou réessayer dans quelques instants.",
          });
        }
      } else {
        // ⚠️ Pas d’id exploitable ou pas de token → on confirme localement, mais on prévient
        if (!apiOrderId) {
          console.warn("Aucun id de commande numérique disponible pour l'appel /payer.");
        }
        if (!token) {
          console.warn("Aucun token disponible pour l'appel /payer.");
        }
        setResult({
          open: true,
          status: "success",
          title: "Paiement confirmé",
          message: `Votre paiement de ${totalAmount} € a bien été accepté.`,
        });
      }
    }, 1600);
  };

  const handleCancel = () => {
    if (processing) return;
    navigate(-1);
  };

  const handleResultClose = () => {
    setResult((r) => ({ ...r, open: false }));
    if (result.status === "success") {
      // 👉 Redirige vers le profil (où les compteurs/statuts se mettront à jour)
      navigate("/profil");
    }
  };

  const maskCardNumber = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const maskPscCode = (v) => v.replace(/\D/g, "").slice(0, 16);

  return (
    <div className="pay-page">
      <div className="pay-card">
        <h1 className="pay-title">💳 Paiement</h1>
        <p className="pay-subtitle">
          Commande <strong>{currentOrderId}</strong> — <strong>{totalAmount} €</strong>
        </p>

        {/* 📦 Récap image + infos */}
        <div className="pay-recap">
          <div className="pay-recap-img">
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              onError={(e) => { e.currentTarget.src = "/images/placeholder_book.png"; }}
            />
          </div>
          <div className="pay-recap-info">
            <h3 className="pay-recap-title">{title}</h3>
            <div className="pay-recap-lines">
              <div className="row"><span>Quantité</span><span>× {qty}</span></div>
              <div className="row"><span>Sous-total</span><span>{totalAmount} €</span></div>
              <div className="row"><span>Frais</span><span>0,00 €</span></div>
              <div className="row total"><span>Total</span><span>{totalAmount} €</span></div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="pay-tabs" role="tablist" aria-label="Choix du moyen de paiement">
          <button className={`pay-tab ${method === "card" ? "active" : ""}`} onClick={() => setMethod("card")} role="tab" aria-selected={method === "card"}>Carte bancaire</button>
          <button className={`pay-tab ${method === "paypal" ? "active" : ""}`} onClick={() => setMethod("paypal")} role="tab" aria-selected={method === "paypal"}>PayPal</button>
          <button className={`pay-tab ${method === "paysafecard" ? "active" : ""}`} onClick={() => setMethod("paysafecard")} role="tab" aria-selected={method === "paysafecard"}>paysafecard</button>
        </div>

        {/* Formulaire */}
        <form className="pay-form" onSubmit={handleSubmit} noValidate>
          {method === "card" && (
            <div className="pay-grid">
              <div className="pay-field">
                <label>Nom sur la carte</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Jane Doe" autoComplete="cc-name" />
                {errors.cardName && <span className="pay-error">{errors.cardName}</span>}
              </div>
              <div className="pay-field">
                <label>Numéro de carte</label>
                <input type="text" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(maskCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" autoComplete="cc-number" />
                {errors.cardNumber && <span className="pay-error">{errors.cardNumber}</span>}
              </div>
              <div className="pay-field small">
                <label>Expiration (MM/AA)</label>
                <input type="text" inputMode="numeric" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))} placeholder="10/28" autoComplete="cc-exp" />
                {errors.cardExpiry && <span className="pay-error">{errors.cardExpiry}</span>}
              </div>
              <div className="pay-field small">
                <label>CVV</label>
                <input type="password" inputMode="numeric" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" autoComplete="cc-csc" />
                {errors.cardCvv && <span className="pay-error">{errors.cardCvv}</span>}
              </div>
            </div>
          )}

          {method === "paypal" && (
            <div className="pay-grid">
              <div className="pay-field">
                <label>Email PayPal</label>
                <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="votre.email@exemple.com" />
                {errors.paypalEmail && <span className="pay-error">{errors.paypalEmail}</span>}
              </div>
              <div className="pay-field">
                <label>Pseudo PayPal</label>
                <input type="text" value={paypalPseudo} onChange={(e) => setPaypalPseudo(e.target.value)} placeholder="VotrePseudo" />
                {errors.paypalPseudo && <span className="pay-error">{errors.paypalPseudo}</span>}
              </div>
            </div>
          )}

          {method === "paysafecard" && (
            <div className="pay-grid">
              <div className="pay-field">
                <label>Code paysafecard (16 chiffres)</label>
                <input type="text" inputMode="numeric" value={pscCode} onChange={(e) => setPscCode(v => v.replace(/\D/g, "").slice(0, 16))} placeholder="1234567812345678" />
                {errors.pscCode && <span className="pay-error">{errors.pscCode}</span>}
              </div>
              <div className="pay-field">
                <label>Alias</label>
                <input type="text" value={pscAlias} onChange={(e) => setPscAlias(e.target.value)} placeholder="Mon code du 08/09" />
                {errors.pscAlias && <span className="pay-error">{errors.pscAlias}</span>}
              </div>
            </div>
          )}

          <div className="pay-actions">
            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={processing}>Annuler</button>
            <button type="submit" className="btn-pay" disabled={processing}>
              {processing ? "Traitement..." : `Payer ${totalAmount} €`}
            </button>
          </div>
        </form>
      </div>

      {/* Modales */}
      {showModal && <PaymentProcessingModal onClose={() => {}} />}
      {result.open && (
        <PaymentResultModal
          status={result.status}
          title={result.title}
          message={result.message}
          onClose={handleResultClose}
        />
      )}
    </div>
  );
}
