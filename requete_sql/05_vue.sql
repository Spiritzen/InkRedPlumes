-- 01. Vue : Liste des utilisateurs
CREATE VIEW vue_utilisateurs AS
SELECT idUser, email, firstName, lastName, role, createdAt
FROM user;

-- 02. Vue : Liste des auteurs avec nombre de livres
CREATE VIEW vue_auteurs AS
SELECT u.idUser, u.firstName, u.lastName, COUNT(l.idLivre) AS nbLivres
FROM user u
JOIN livre l ON u.idUser = l.auteurId
WHERE u.role = 'author'
GROUP BY u.idUser;

-- 03. Vue : Livres ayant des commentaires avec moyenne de note
CREATE VIEW vue_livres_commentes AS
SELECT l.idLivre, l.titre, COUNT(c.idComment) AS nbCommentaires, AVG(c.note) AS moyenneNote
FROM livre l
JOIN comments c ON l.idLivre = c.livreId
GROUP BY l.idLivre;

-- 04. Vue : Livres les mieux notés
CREATE VIEW vue_livres_populaires AS
SELECT l.idLivre, l.titre, AVG(c.note) AS moyenneNote
FROM livre l
JOIN comments c ON l.idLivre = c.livreId
GROUP BY l.idLivre
ORDER BY moyenneNote DESC;

-- 05. Vue : Commandes par client
CREATE VIEW vue_commandes_clients AS
SELECT c.idCommande, u.firstName, u.lastName, c.dateCommande
FROM commande c
JOIN user u ON c.userId = u.idUser;

-- 06. Vue : Contenu des lignes de commande
CREATE VIEW vue_contenu_commandes AS
SELECT ldc.idLigne, ldc.commandeId, p.nomProduit, ldc.quantite, ldc.prixUnitaire
FROM ligne_de_commande ldc
JOIN produit p ON ldc.produitId = p.idProduit;

-- 07. Vue : Produits avec stock faible (<10)
CREATE VIEW vue_produits_stock_faible AS
SELECT idProduit, nomProduit, stockProduit
FROM produit
WHERE stockProduit < 10;

-- 08. Vue : Historique des commandes d’un utilisateur
CREATE VIEW vue_historique_commandes_utilisateur AS
SELECT u.firstName, u.lastName, c.idCommande, c.dateCommande
FROM user u
JOIN commande c ON u.idUser = c.userId;

-- 09. Vue : Nombre de commentaires par livre
CREATE VIEW vue_commentaires_par_livre AS
SELECT l.titre, COUNT(c.idComment) AS nbCommentaires
FROM livre l
JOIN comments c ON l.idLivre = c.livreId
GROUP BY l.idLivre;

-- 10. Vue : Chiffre d'affaires par produit
CREATE VIEW vue_stats_ventes AS
SELECT p.nomProduit, SUM(ldc.quantite * ldc.prixUnitaire) AS chiffreAffaires
FROM produit p
JOIN ligne_de_commande ldc ON p.idProduit = ldc.produitId
GROUP BY p.idProduit;

CREATE OR REPLACE VIEW vue_stats_livres AS
SELECT
    l.idLivre,
    l.titre,
    l.prix,
    l.imagePath,
    l.auteurId,
    COALESCE(SUM(ldcl.quantite), 0) AS nombreVentes,
    ROUND(AVG(c.note), 1) AS moyenneNote
FROM livre l
LEFT JOIN ligne_de_commande_livre ldcl ON ldcl.livreId = l.idLivre
LEFT JOIN comments c ON c.livreId = l.idLivre
GROUP BY l.idLivre;vue_utilisateurs
