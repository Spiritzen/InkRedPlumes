// CommandeViewer.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./ProfilModal.css";
import "../Pages/MesLivres.css";
import "./CommandeViewer.css";
import CommandeDetailModal from "./CommandeDetailModal";

// --- Constantes stables (hors composant) ---
const STATUTS_CLIENT = [
  "en_attente",
  "payee",
  "en_cours_de_traitement",
  "expediee",
  "terminee",
];

const STATUTS_AUTEUR = ["en_attente_de_preparation", "expediee", "terminee"];

const COULEURS = {
  en_attente: "btn-danger",
  payee: "btn-success",
  en_cours_de_traitement: "btn-edit",
  expediee: "btn-edit",
  terminee: "btn-success",
  en_attente_de_preparation: "btn-danger",
  annulee: "btn-edit",
};

// --- Helpers stables (hors composant) ---
const normalizeRow = (row) => {
  const idCommande =
    row.idCommande ?? row.id_commande ?? row.id ?? row.orderId ?? null;

  const statut = String(row.statut ?? row.status ?? "")
    .trim()
    .toLowerCase();

  const titre = row.titre ?? row.livreTitre ?? row.bookTitle ?? "";

  const prixUnitaire = Number(
    row.prixUnitaire ?? row.prix ?? row.unitPrice ?? 0
  );
  const quantite = Number(row.quantite ?? row.qty ?? row.quantity ?? 0);

  const clientNom =
    row.clientNom ??
    row.client_nom ??
    (row.clientPrenom && row.clientNom
      ? `${row.clientPrenom} ${row.clientNom}`.trim()
      : row.clientPrenom ?? "");

  return {
    ...row,
    idCommande,
    statut,
    titre,
    prixUnitaire,
    quantite,
    clientNom,
  };
};

const normalizeList = (list) =>
  (Array.isArray(list) ? list : []).map((r) => normalizeRow(r));

const computeCounts = (data, statuts, isAuthorView) => {
  const counts = {};
  statuts.forEach((s) => {
    if (isAuthorView) {
      counts[s] = data.filter((c) => c.statut === s).length;
    } else {
      // côté client: on regroupe "payee" & "en_attente_de_preparation"
      if (s === "payee" || s === "en_cours_de_traitement") {
        counts[s] = data.filter(
          (c) =>
            c.statut === s || c.statut === "en_attente_de_preparation"
        ).length;
      } else {
        counts[s] = data.filter((c) => c.statut === s).length;
      }
    }
  });
  return counts;
};

const filterForView = (data, statut, isAuthorView) => {
  if (!statut) return [];
  if (isAuthorView) return data.filter((c) => c.statut === statut);
  if (statut === "payee" || statut === "en_cours_de_traitement") {
    return data.filter(
      (c) => c.statut === statut || c.statut === "en_attente_de_preparation"
    );
  }
  return data.filter((c) => c.statut === statut);
};

const pickFirstNonEmpty = (counts, order) =>
  order.find((s) => (counts?.[s] || 0) > 0) || null;

// =====================================================

function CommandeViewer({ onClose }) {
  const [commandes, setCommandes] = useState([]);
  const [commandesClient, setCommandesClient] = useState([]);

  const [role, setRole] = useState("");
  const [modalRole, setModalRole] = useState(null);              // rôle à utiliser dans la modale ("author" | "client")
  const [modalClickedStatus, setModalClickedStatus] = useState(null); // statut cliqué pour personnaliser le titre/texte
  const [loading, setLoading] = useState(true);

  const [showClientModal, setShowClientModal] = useState(false);
  const [statutActif, setStatutActif] = useState(null);
  const [statutActifClient, setStatutActifClient] = useState(null);

  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);

  const token = localStorage.getItem("token");
  const api = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Chargement des données
  const fetchAllCommandes = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resUser = await axios.get(`${api}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = resUser.data;
      const roleLower = String(user.role || "").toLowerCase();
      setRole(roleLower);

      if (roleLower === "author") {
        const [auteurRes, clientRes] = await Promise.all([
          axios.get(`${api}/api/commandes/auteur/details`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${api}/api/commandes/client/details`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const auteurRows = normalizeList(auteurRes.data);
        const clientRows = normalizeList(clientRes.data);

        setCommandes(auteurRows);       // tes ventes
        setCommandesClient(clientRows); // tes achats perso

        // init filtres si vides
        const countsMain = computeCounts(auteurRows, STATUTS_AUTEUR, true);
        setStatutActif((prev) => prev ?? pickFirstNonEmpty(countsMain, STATUTS_AUTEUR));

        const countsClient = computeCounts(clientRows, STATUTS_CLIENT, false);
        setStatutActifClient((prev) => prev ?? pickFirstNonEmpty(countsClient, STATUTS_CLIENT));
      } else {
        const clientRes = await axios.get(`${api}/api/commandes/client/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clientRows = normalizeList(clientRes.data);
        setCommandes(clientRows);
        setCommandesClient([]);

        const countsMain = computeCounts(clientRows, STATUTS_CLIENT, false);
        setStatutActif((prev) => prev ?? pickFirstNonEmpty(countsMain, STATUTS_CLIENT));
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des commandes :", err);
    } finally {
      setLoading(false);
    }
  }, [token, api]);

  useEffect(() => {
    fetchAllCommandes();
  }, [fetchAllCommandes]);

  // Event-bus (pas de dépendances dynamiques)
  useEffect(() => {
    const onAnnulee = (e) => {
      const id = e?.detail?.id;
      if (!id) return;
      setCommandes((prev) => prev.filter((c) => c.idCommande !== id));
      setCommandesClient((prev) => prev.filter((c) => c.idCommande !== id));
    };
    const onExpediee = (e) => {
      const id = e?.detail?.id;
      if (!id) return;
      setCommandes((prev) =>
        prev.map((c) =>
          c.idCommande === id ? { ...c, statut: "expediee" } : c
        )
      );
      setCommandesClient((prev) =>
        prev.map((c) =>
          c.idCommande === id ? { ...c, statut: "expediee" } : c
        )
      );
    };
    const onTerminee = (e) => {
      const id = e?.detail?.id;
      if (!id) return;
      setCommandes((prev) =>
        prev.map((c) =>
          c.idCommande === id ? { ...c, statut: "terminee" } : c
        )
      );
      setCommandesClient((prev) =>
        prev.map((c) =>
          c.idCommande === id ? { ...c, statut: "terminee" } : c
        )
      );
    };

    window.addEventListener("commande:annulee", onAnnulee);
    window.addEventListener("commande:expediee", onExpediee);
    window.addEventListener("commande:terminee", onTerminee);
    return () => {
      window.removeEventListener("commande:annulee", onAnnulee);
      window.removeEventListener("commande:expediee", onExpediee);
      window.removeEventListener("commande:terminee", onTerminee);
    };
  }, []);

  // Callbacks pour la modale enfant
  const handleCommandeAnnulee = async (idCommande) => {
    setCommandes((prev) => prev.filter((c) => c.idCommande !== idCommande));
    setCommandesClient((prev) => prev.filter((c) => c.idCommande !== idCommande));
    setCommandeSelectionnee(null);
    setModalRole(null);
    setModalClickedStatus(null);
    await fetchAllCommandes();
  };

  const handleCommandeExpediee = async (idCommande) => {
    setCommandes((prev) =>
      prev.map((c) =>
        c.idCommande === idCommande ? { ...c, statut: "expediee" } : c
      )
    );
    setCommandesClient((prev) =>
      prev.map((c) =>
        c.idCommande === idCommande ? { ...c, statut: "expediee" } : c
      )
    );
    setCommandeSelectionnee(null);
    setModalRole(null);
    setModalClickedStatus(null);
    await fetchAllCommandes();
  };

  const handleCommandeRecue = async (idCommande) => {
    setCommandes((prev) =>
      prev.map((c) =>
        c.idCommande === idCommande ? { ...c, statut: "terminee" } : c
      )
    );
    setCommandesClient((prev) =>
      prev.map((c) =>
        c.idCommande === idCommande ? { ...c, statut: "terminee" } : c
      )
    );
    setCommandeSelectionnee(null);
    setModalRole(null);
    setModalClickedStatus(null);
    await fetchAllCommandes();
  };

  // Helper pour ouvrir la modale avec le bon contexte ("client" | "author") + statut cliqué
  const openDetails = (cmd, viewAs, clickedStatus = null) => {
    setCommandeSelectionnee(cmd);
    setModalRole(viewAs);
    setModalClickedStatus(clickedStatus);
    if (viewAs === "client") setShowClientModal(false); // ferme la modale "Mes achats perso"
  };

  // Rendu
  if (loading) return <p>Chargement des commandes...</p>;

  const countsMain =
    role === "author"
      ? computeCounts(commandes, STATUTS_AUTEUR, true)
      : computeCounts(commandes, STATUTS_CLIENT, false);

  const countsClientModal = computeCounts(
    commandesClient,
    STATUTS_CLIENT,
    false
  );

  const filteredMain = filterForView(
    commandes,
    statutActif,
    role === "author"
  );
  const filteredClientModal = filterForView(
    commandesClient,
    statutActifClient,
    false
  );

  const renderBoutonsStatuts = (statuts, counts, setter, actif) => (
    <div className="btn-statut">
      {statuts.map((statut) => (
        <button
          key={statut}
          className={`btn ${COULEURS[statut]}`}
          onClick={() => setter(actif === statut ? null : statut)}
        >
          {statut.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())}{" "}
          ({counts[statut] || 0})
        </button>
      ))}
    </div>
  );

  // viewAs = "author" pour le tableau principal d'un auteur (ses ventes)
  // viewAs = "client" pour les achats perso et pour les clients
  // clickedStatus = statut actuellement filtré (sert à personnaliser le titre/texte de la modale payée)
  const renderTableau = (data, showClient, viewAs, clickedStatus) => (
    <table className="table-livres">
      <thead>
        <tr>
          <th>ID</th>
          {showClient && <th>Client</th>}
          <th>Titre</th>
          <th>Prix</th>
        </tr>
      </thead>
      <tbody>
        {data.map((cmd) => (
          <tr
            key={cmd.idCommande}
            className="clickable-row"
            onClick={() => openDetails(cmd, viewAs, clickedStatus)}
          >
            <td>{cmd.idCommande}</td>
            {showClient && <td>{cmd.clientNom || "–"}</td>}
            <td>{cmd.titre || "–"}</td>
            <td>
              {Number.isFinite(cmd.prixUnitaire) &&
              Number.isFinite(cmd.quantite) &&
              cmd.quantite > 0
                ? `${(cmd.prixUnitaire * cmd.quantite).toFixed(2)} €`
                : "–"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="commande-viewer-content">
      <h4 className="profil-modal-title">
        {role === "author" ? "clients" : ""}
      </h4>

      {/* Boutons + compteurs */}
      {role === "author"
        ? renderBoutonsStatuts(
            STATUTS_AUTEUR,
            countsMain,
            setStatutActif,
            statutActif
          )
        : renderBoutonsStatuts(
            STATUTS_CLIENT,
            countsMain,
            setStatutActif,
            statutActif
          )}

      {/* Tableau principal */}
      {statutActif &&
        filteredMain.length > 0 &&
        renderTableau(
          filteredMain,
          role === "author",                        // showClient column?
          role === "author" ? "author" : "client",  // ✅ contexte pour la modale
          role === "author" ? null : statutActif    // ✅ statut cliqué (client uniquement)
        )}

      {/* Modale "Mes achats perso" (auteur uniquement) */}
      {role === "author" && (
        <div className="confirmation-buttons">
          <button className="btn-edit" onClick={() => setShowClientModal(true)}>
            Mes achats perso
          </button>
        </div>
      )}

      {showClientModal && (
        <div className="confirmation-overlay">
          <div className="profil-modal-box">
            <h4 className="profil-modal-title">Mes achats personnels</h4>

            {renderBoutonsStatuts(
              STATUTS_CLIENT,
              countsClientModal,
              setStatutActifClient,
              statutActifClient
            )}

            {statutActifClient &&
              filteredClientModal.length > 0 &&
              renderTableau(filteredClientModal, false, "client", statutActifClient)}

            <button
              onClick={() => setShowClientModal(false)}
              className="btn-secondary"
            >
              ❌ Fermer
            </button>
          </div>
        </div>
      )}

      <div className="confirmation-buttons">
        <button onClick={onClose} className="btn-secondary">
          ❌ Fermer
        </button>
      </div>

      {/* ✅ Toujours ouvrir CommandeDetailModal avec le bon rôle + statut cliqué */}
      {commandeSelectionnee && (
        <CommandeDetailModal
          commande={commandeSelectionnee}
          onClose={() => {
            setCommandeSelectionnee(null);
            setModalRole(null);
            setModalClickedStatus(null);
          }}
          role={modalRole || role}
          onCancelled={handleCommandeAnnulee}
          onStatusChange={handleCommandeExpediee} // expédiée (auteur)
          onReceived={handleCommandeRecue}       // reçue (client) -> terminee
          clickedStatus={modalClickedStatus}     // ✅ pour personnaliser CommandePayee
        />
      )}
    </div>
  );
}

export default CommandeViewer;
