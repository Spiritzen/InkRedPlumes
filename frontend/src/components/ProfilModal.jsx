import React from 'react';
import './ProfilModal.css';
import EditUserInfoForm from './EditUserInfoForm';
import EditAdresseForm from './EditAdresseForm'; // ✅ Ajout ici
import ChangePasswordForm from './ChangePasswordForm'; // ✅ Ajout ici
import CommandeViewer from './CommandeViewer'; // ✅ Nouvelle modale commandes


function ProfilModal({ card, onClose }) {
  if (!card) return null;

  return (
    <div
      className="profil-modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains('profil-modal-overlay')) {
          onClose();
        }
      }}
    >
      <div className="profil-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="profil-modal-title">{card.label}</h3>

        <div className="profil-modal-content">
          {card.label === 'Modifier mes infos' && (
            <EditUserInfoForm onClose={onClose} />
          )}

          {card.label === 'Adresse de livraison' && (
            <EditAdresseForm onClose={onClose} />
          )}
          {card.label === 'Changer mon mot de passe' && (
  <ChangePasswordForm onClose={onClose} />
)}
{card.label === 'Mes commandes' && (
  <CommandeViewer onClose={onClose} />
)}

          {/* D’autres modales à venir ici si besoin */}
        </div>
      </div>
    </div>
  );
}

export default ProfilModal;

