// src/components/ChangePasswordForm.jsx
import { useState } from "react";
import axios from "axios";
import "./ProfilModal.css"; // Réutilise le style général de tes modales

function ChangePasswordForm({ onClose }) {
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nouveau !== confirmation) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:8080/api/users/change-password", {
        ancienMotDePasse: ancien,
        nouveauMotDePasse: nouveau
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowConfirmation(true);
      setMessage("✅ Mot de passe mis à jour !");
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 3000);
    } catch (err) {
      setMessage("❌ Erreur lors de la mise à jour : " + (err.response?.data || ""));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="form-group">
          <label>Ancien mot de passe :</label>
          <input
            type="password"
            value={ancien}
            onChange={e => setAncien(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Nouveau mot de passe :</label>
          <input
            type="password"
            value={nouveau}
            onChange={e => setNouveau(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirmer le nouveau mot de passe :</label>
          <input
            type="password"
            value={confirmation}
            onChange={e => setConfirmation(e.target.value)}
            required
          />
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="confirmation-buttons">
          <button type="submit" className="btn-secondary" style={{ background: "linear-gradient(to right, #b8860b, #ffd700)" }}>
  ✅ Enregistrer
</button>
          <button type="button" onClick={onClose} className="btn-secondary">❌ Annuler</button>
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">
            ✅ Mot de passe mis à jour avec succès !
            <br />
            <button className="btn-secondary" onClick={() => setShowConfirmation(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChangePasswordForm;
