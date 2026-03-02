import { useEffect, useState } from "react";
import axios from "axios";
import "./ProfilModal.css";


function EditUserInfoForm({ onClose }) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:8080/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data;
        setPrenom(user.firstName || '');
        setNom(user.lastName || '');
        setAdresse(user.adresse || '');
        setVille(user.ville || '');
        setCodePostal(user.codePostal || '');
      } catch (err) {
        console.error("Erreur lors du chargement des infos utilisateur :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fermeture automatique de la modale de confirmation après 3 secondes
  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
        onClose(); // Fermer la modale principale après confirmation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmation, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:8080/api/users/me", {
        firstName: prenom,
        lastName: nom,
        adresse,
        ville,
        codePostal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowConfirmation(true); // ✅ Afficher la modale de confirmation
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      alert("❌ Impossible de mettre à jour vos informations.");
    }
  };

  if (loading) return <p>Chargement des données...</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="form-group">
          <label>Prénom :</label>
          <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Nom :</label>
          <input type="text" value={nom} onChange={e => setNom(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Adresse :</label>
          <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Ville :</label>
          <input type="text" value={ville} onChange={e => setVille(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Code Postal :</label>
          <input type="text" value={codePostal} onChange={e => setCodePostal(e.target.value)} />
        </div>

        <div className="confirmation-buttons">
          <button type="submit" className="btn-secondary" style={{ background: "linear-gradient(to right, #b8860b, #ffd700)" }}>
  ✅ Enregistrer
</button>
          <button type="button" onClick={onClose} className="btn-secondary">❌ Annuler</button>
        </div>
      </form>

      {/* ✅ Modale de confirmation flottante */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">
            <p>✅ Modifications prises en compte !</p>
            <button onClick={() => { setShowConfirmation(false); onClose(); }} className="btn-secondary">
              ❌ Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default EditUserInfoForm;
