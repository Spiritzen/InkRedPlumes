import { useEffect, useState } from 'react';
import axios from 'axios';
import './MesLivres.css';

function MesLivres() {
  const [livres, setLivres] = useState([]);
  const [erreur, setErreur] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [livreSelectionne, setLivreSelectionne] = useState(null);
  const [selectedEditLivre, setSelectedEditLivre] = useState(null);
  const [prenom, setPrenom] = useState('');

  const [titre, setTitre] = useState('');
  const [resume, setResume] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prix, setPrix] = useState('');
  const [dateParution, setDateParution] = useState('');
  const [image, setImage] = useState(null);

  const [categorieIds, setCategorieIds] = useState([]);
  const [categories, setCategories] = useState([]);

  const [livreAffiche, setLivreAffiche] = useState(null);         // 📌 modale aperçu
  const [categoriesLivreAffiche, setCategoriesLivreAffiche] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get('http://localhost:8080/api/livres/mine', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setLivres(res.data))
      .catch(() => setErreur("Impossible de charger vos livres."));

    axios.get('http://localhost:8080/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setPrenom(res.data.firstName))
      .catch(() => setPrenom('Auteur'));

    axios.get('http://localhost:8080/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleCategorieChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
    setCategorieIds(selectedOptions);
  };

  useEffect(() => {
    const bgPosition = { current: 0 };
    const targetPosition = { current: 0 };
    let requestRef;

    const handleScroll = () => {
      targetPosition.current = window.scrollY * 0.3;
    };

    const animate = () => {
      bgPosition.current += (targetPosition.current - bgPosition.current) * 0.08;
      const container = document.querySelector('.mes-livres-container');
      if (container) {
        container.style.backgroundPosition = `center ${-bgPosition.current}px`;
      }
      requestRef = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll);
    requestRef = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(requestRef);
    };
  }, []);

  const resetForm = () => {
    setTitre('');
    setResume('');
    setPrix('');
    setDateParution('');
    setImage(null);
    setCategorieIds([]);
    setQuantite('');
  };

  useEffect(() => {
    if (livreAffiche) {
      const token = localStorage.getItem("token");
      axios.get(`http://localhost:8080/api/livres/${livreAffiche.idLivre}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setCategoriesLivreAffiche(res.data);
      }).catch(() => {
        setCategoriesLivreAffiche([]);
      });
    }
  }, [livreAffiche]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get('http://localhost:8080/api/livres/mine', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const livresDeBase = res.data;

      axios.get('http://localhost:8080/api/livres/mine/stats', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(statsRes => {
        const stats = statsRes.data;

        const livresAvecStats = livresDeBase.map(l => {
          const stat = stats.find(s => s.idLivre === l.idLivre);
          return {
            ...l,
            nombreVentes: stat ? stat.nombreVentes : 0,
            moyenneNote: stat ? stat.moyenneNote : null
          };
        });

        setLivres(livresAvecStats);
      });

    }).catch(() => setErreur("❌ Impossible de charger vos livres."));
  }, []);

  useEffect(() => {
    if (showForm || showEditModal || showDelete || showConfirmation || livreAffiche) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showForm, showEditModal, showDelete, showConfirmation, livreAffiche]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let imagePath = '';

      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const imageRes = await axios.post('http://localhost:8080/api/livres/upload-image', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        imagePath = imageRes.data;
      }

      const response = await axios.post('http://localhost:8080/api/livres', {
        titre,
        resume,
        prix: parseFloat(prix),
        dateParution,
        imagePath,
        categorieIds,
        quantite: parseInt(quantite, 10)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLivres([...livres, response.data]);
      setShowForm(false);
      resetForm();
    } catch {
      setErreur("❌ Erreur lors de la publication du livre.");
    }
  };

  const handleSelectEdit = async (id) => {
    const livre = livres.find(l => l.idLivre === parseInt(id, 10));
    if (!livre) return;

    setSelectedEditLivre(livre);
    setTitre(livre.titre || '');
    setResume(livre.resume || '');
    setPrix(livre.prix?.toString() || '');
    setDateParution(livre.dateParution?.substring(0, 10) || '');
    setQuantite(livre.quantite?.toString() || '');

    const token = localStorage.getItem("token");
    const res = await axios.get(`http://localhost:8080/api/livres/${id}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const matchedCategories = res.data
      .map(nom => {
        const cat = categories.find(c => c.nomCategorie === nom);
        return cat ? cat.idCategorie : null;
      })
      .filter(Boolean);

    setCategorieIds(matchedCategories);
  };

  const prefillFormWithLivre = async (livre) => {
    setSelectedEditLivre(livre);
    setTitre(livre.titre || '');
    setResume(livre.resume || '');
    setPrix(livre.prix?.toString() || '');
    setDateParution(livre.dateParution?.substring(0, 10) || '');
    setQuantite(livre.quantite?.toString() || '');

    const token = localStorage.getItem("token");
    const res = await axios.get(`http://localhost:8080/api/livres/${livre.idLivre}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const matchedCategories = res.data
      .map(nom => {
        const cat = categories.find(c => c.nomCategorie === nom);
        return cat ? cat.idCategorie : null;
      })
      .filter(Boolean);

    setCategorieIds(matchedCategories);
  };

  const handleUpdateLivre = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      let imagePath = selectedEditLivre.imagePath;

      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const imgRes = await axios.post('http://localhost:8080/api/livres/upload-image', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        imagePath = imgRes.data;
      }

      const updatedLivre = {
        titre,
        resume,
        prix: parseFloat(prix),
        dateParution,
        imagePath,
        categorieIds,
        quantite: parseInt(quantite, 10)
      };

      await axios.put(`http://localhost:8080/api/livres/${selectedEditLivre.idLivre}`, updatedLivre, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const nouveauxLivres = livres.map(l =>
        l.idLivre === selectedEditLivre.idLivre ? { ...l, ...updatedLivre } : l
      );
      setLivres(nouveauxLivres);
      setShowEditModal(false);
      setSelectedEditLivre(null);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="mes-livres-container">
      <div className="header-spacer"></div>
      <h2><span className="title-mes-livres">Bienvenue dans la zone de pilotage de ta librairie {prenom}</span></h2>
      <div className="special-padding"></div>
      {erreur && <div className="error-message">{erreur}</div>}

      <div className="mes-livres-buttons-wrapper">
        <div className="mes-livres-buttons-left">
          <button onClick={() => setShowForm(true)} className="btn-success">📤 Ajouter un livre</button>
          <button onClick={() => setShowEditModal(true)} className="btn-edit">✏️ Modifier un livre</button>
          <button
            onClick={() => {
              if (livres.length === 0) alert("Rien à supprimer.");
              else setShowDelete(true);
            }}
            className="btn-danger"
          >
            🗑️ Supprimer un livre
          </button>
        </div>
        <div className="mes-livres-buttons-right">
          <button onClick={() => window.location.href = '/profil'} className="btn-profil">
            Mon compte <span className="material-icons">settings</span>
          </button>
        </div>
      </div>

      <h3>📚 Mes livres publiés</h3>

      {/* 🔁 MODALE AJOUT */}
      {showForm && (
        <div
          className="ml-modal-overlay"
          onClick={e => { if (e.target.classList.contains("ml-modal-overlay")) setShowForm(false); }}
        >
          <div className="ml-modal-box ml-scrollable">
            <h2>📝 Ajout de livre</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre :</label>
                <input type="text" value={titre} onChange={e => setTitre(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Catégories :</label>
                <select multiple value={categorieIds} onChange={handleCategorieChange} required>
                  {categories.map(c => (
                    <option key={c.idCategorie} value={c.idCategorie}>
                      {c.nomCategorie}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Résumé :</label>
                <textarea value={resume} onChange={e => setResume(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Prix :</label>
                <input type="number" step="0.01" value={prix} onChange={e => setPrix(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Date de parution :</label>
                <input type="date" value={dateParution} onChange={e => setDateParution(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Quantité :</label>
                <input type="number" min="1" value={quantite} onChange={(e) => setQuantite(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Image de couverture :</label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} required />
              </div>

              <div className="ml-buttons-row">
                <button type="submit" className="btn-success">✅ Publier</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔁 MODALE MODIFICATION */}
      {showEditModal && (
        <div
          className="ml-modal-overlay"
          onClick={e => {
            if (e.target.classList.contains("ml-modal-overlay")) {
              setShowEditModal(false);
              resetForm();
              setSelectedEditLivre(null);
            }
          }}
        >
          <div className="ml-modal-box">
            <h2>✏️ Modifier un livre</h2>
            <div className="form-group">
              <label>Choisissez un livre :</label>
              <select onChange={e => handleSelectEdit(e.target.value)} value={selectedEditLivre?.idLivre || ''}>
                <option value="">-- Sélectionnez un titre --</option>
                {livres.map(livre => <option key={livre.idLivre} value={livre.idLivre}>{livre.titre}</option>)}
              </select>
            </div>

            {selectedEditLivre && (
              <form onSubmit={handleUpdateLivre}>
                <div className="form-group"><label>Titre :</label><input type="text" value={titre} onChange={e => setTitre(e.target.value)} /></div>
                <div className="form-group"><label>Résumé :</label><textarea value={resume} onChange={e => setResume(e.target.value)} /></div>
                <div className="form-group"><label>Prix :</label><input type="number" value={prix} onChange={e => setPrix(e.target.value)} /></div>
                <div className="form-group"><label>Date :</label><input type="date" value={dateParution} onChange={e => setDateParution(e.target.value)} /></div>

                <div className="form-group">
                  <label>Catégories :</label>
                  <select multiple value={categorieIds} onChange={handleCategorieChange} required>
                    {categories.map(c => (
                      <option key={c.idCategorie} value={c.idCategorie}>
                        {c.nomCategorie}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantité :</label>
                  <input type="number" min="0" value={quantite} onChange={(e) => setQuantite(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Changer l’image de couverture :</label>
                  <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
                  <small style={{ fontSize: '0.8rem', color: 'gray' }}>Laisser vide si vous ne souhaitez pas la modifier</small>
                </div>

                <div className="ml-buttons-row">
                  <button type="submit" className="btn-success">✅ Modifier</button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      setSelectedEditLivre(null);
                    }}
                    className="btn-secondary"
                  >
                    ❌ Fermer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🔁 MODALE SUPPRESSION */}
      {showDelete && (
        <div
          className="ml-modal-overlay"
          onClick={e => { if (e.target.classList.contains("ml-modal-overlay")) setShowDelete(false); }}
        >
          <div className="ml-modal-box ml-modal-delete-box">
            <h2>❌ Supprimer un livre</h2>
            <p className="confirm-text">Cette action est irréversible. Veuillez sélectionner un livre.</p>
            <div className="delete-list">
              {livres.map(livre => (
                <div
                  key={livre.idLivre}
                  onClick={() => setLivreSelectionne(livre)}
                  className={`livre-selection ${livreSelectionne?.idLivre === livre.idLivre ? 'selected' : ''}`}
                >
                  <strong>{livre.titre}</strong> — {livre.prix} € — {livre.nombreVentes} ventes — {(livre.prix * livre.nombreVentes).toFixed(2)} €
                </div>
              ))}
            </div>
            <div className="ml-buttons-row">
              <button onClick={() => setShowDelete(false)} className="btn-secondary">❌ Annuler</button>
              <button
                disabled={!livreSelectionne}
                onClick={() => {
                  if (livreSelectionne) {
                    setShowDelete(false);
                    setShowConfirmation(true);
                  }
                }}
                className="btn-danger"
              >
                ✅ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔁 MODALE CONFIRMATION */}
      {showConfirmation && (
        <div
          className="ml-modal-overlay"
          onClick={e => { if (e.target.classList.contains("ml-modal-overlay")) setShowConfirmation(false); }}
        >
          <div className="ml-modal-box">
            <h2>⚠️ Confirmation</h2>
            <p>Vous êtes sur le point de supprimer :</p>
            <p className="confirm-text">{livreSelectionne?.titre}</p>
            <p className="text-muted">Cette action est irréversible. Souhaitez-vous continuer ?</p>
            <div className="ml-buttons-row">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setLivreSelectionne(null);
                }}
                className="btn-secondary"
              >
                ❌ Annuler
              </button>
              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  try {
                    await axios.delete(`http://localhost:8080/api/livres/${livreSelectionne.idLivre}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setLivres(livres.filter(l => l.idLivre !== livreSelectionne.idLivre));
                    setShowConfirmation(false);
                    setLivreSelectionne(null);
                  } catch {
                    alert("❌ Erreur lors de la suppression.");
                  }
                }}
                className="btn-danger"
              >
                ✅ Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔁 MODALE APERÇU LIVRE (au clic sur la ligne du tableau) */}
      {livreAffiche && (
        <div className="ml-view-overlay" onClick={() => setLivreAffiche(null)}>
          <div className="ml-view-box" onClick={(e) => e.stopPropagation()}>
            <div className="ml-cover-frame">
              <img
                className="ml-cover-img"
                src={`http://localhost:8080${livreAffiche.imagePath}`}
                alt={livreAffiche.titre}
              />
            </div>

            <h3 className="ml-view-title">{livreAffiche.titre}</h3>

            {categoriesLivreAffiche.length > 0 && (
              <div className="ml-modal-categories">
                <span>Catégories</span> : {categoriesLivreAffiche.join(', ')}
              </div>
            )}

            <p className="ml-fiche-resume">{livreAffiche.resume}</p>

    <div className="ml-price-stats">
  <p className="ml-modal-price">Prix unitaire : {(livreAffiche.prix ?? 0).toFixed(2)} €</p>
  <p>Ventes totales : {livreAffiche.nombreVentes || 0}</p>
  <p>Gains totaux : {((livreAffiche.prix || 0) * (livreAffiche.nombreVentes || 0)).toFixed(2)} €</p>
  <p>Moyenne des notes : {livreAffiche.moyenneNote ? `${livreAffiche.moyenneNote} ⭐` : '–'}</p>
  <p>En stock : {livreAffiche.quantite}</p>
</div>

            <div className="ml-modal-buttons">
              <button
                className="ml-more-btn"
                onClick={async () => {
                  await prefillFormWithLivre(livreAffiche);
                  setShowEditModal(true);
                  setLivreAffiche(null);
                }}
              >
                ✏️ Modifier ce livre
              </button>
              <button className="ml-exit-btn" onClick={() => setLivreAffiche(null)}>❌ Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔁 TABLEAU LIVRES */}
      <table className="table-livres">
        <thead>
          <tr>
            <th>📷</th>
            <th>Titre</th>
            <th>Prix</th>
            <th>Ventes</th>
            <th>Gains (€)</th>
            <th>En stock</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {livres.map(livre => (
            <tr
              key={livre.idLivre}
              className="clickable-row"
              onClick={() => setLivreAffiche(livre)}
            >
              <td>{livre.imagePath && <img src={`http://localhost:8080${livre.imagePath}`} alt={livre.titre} width={20} height={20} />}</td>
              <td>{livre.titre}</td>
              <td>{livre.prix} €</td>
              <td>{livre.nombreVentes || 0}</td>
              <td>{((livre.prix || 0) * (livre.nombreVentes || 0)).toFixed(2)} €</td>
              <td>{livre.quantite || 0}</td>
              <td>{livre.moyenneNote ? `${livre.moyenneNote} ★` : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MesLivres;
