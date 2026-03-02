import { useEffect, useState } from "react";
import axios from "axios";
import "./ProfilModal.css"; // Réutilisation du style modal existant

function EditAdresseForm({ onClose }) {
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchAdresse = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:8080/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdresse(response.data.adresse || '');
        setVille(response.data.ville || '');
        setCodePostal(response.data.codePostal || '');
      } catch (err) {
        console.error("Erreur lors de la récupération de l'adresse :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdresse();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:8080/api/users/me", {
        adresse,
        ville,
        codePostal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onClose(); // Ferme la modale principale
      }, 3000);
    } catch (err) {
      console.error("❌ Échec de la mise à jour :", err);
      alert("Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <p>Chargement de l'adresse...</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="form-group">
          <label>Adresse :</label>
          <input
            type="text"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Ville :</label>
          <input
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Code Postal :</label>
          <input
            type="text"
            value={codePostal}
            onChange={(e) => setCodePostal(e.target.value)}
          />
        </div>

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
            ✅ Adresse mise à jour avec succès !
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

export default EditAdresseForm;
