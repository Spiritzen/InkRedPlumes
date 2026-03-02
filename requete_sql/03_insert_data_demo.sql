
-- Données pour user
INSERT INTO user (email, `password`, firstName, lastName, role, createdAt) VALUES
('admin@example.com', 'hashedpassword1', 'Alice', 'Admin', 'admin', NOW()),
('auteur@example.com', 'hashedpassword2', 'Bob', 'Writer', 'author', NOW()),
('client@example.com', 'hashedpassword3', 'Charlie', 'Buyer', 'client', NOW());
INSERT INTO user (email, `password`, firstName, lastName, role, createdAt) VALUES
('nora.lux@inkred.com', 'norapwd', 'Nora', 'Lux', 'author', NOW()),
('elias.sable@inkred.com', 'eliaspwd', 'Elias', 'Sable', 'author', NOW()),
('ayla.mire@inkred.com', 'aylapwd', 'Ayla', 'Mire', 'author', NOW()),
('leon.therain@inkred.com', 'leonpwd', 'Léon', 'Therain', 'author', NOW()),
('seraphine.bleu@inkred.com', 'seraphinepwd', 'Séraphine', 'Bleu', 'author', NOW());

-- Données pour livre
INSERT INTO livre (titre, resume, prix, dateParution, auteurId) VALUES
('Le Crépuscule Rouge', 'Un roman sombre et intense.', 19.99, '2023-01-15', 2),
('Les Plumes d''Or', 'Recueil de poèmes inspirants.', 12.50, '2022-05-10', 2);

-- Données pour produit
INSERT INTO produit (nomProduit, descriptionProduit, prixProduit, stockProduit) VALUES
('Carnet collector', 'Carnet à couverture illustrée lié à l''univers du livre.', 9.90, 100),
('Marque-page en bois', 'Gravé au laser avec une citation.', 4.50, 200);

-- Données pour commande
INSERT INTO commande (userId, dateCommande) VALUES
(3, '2024-06-15 14:00:00'),
(3, '2024-06-16 10:30:00');

-- Données pour ligne_de_commande
INSERT INTO ligne_de_commande (commandeId, produitId, quantite, prixUnitaire) VALUES
(1, 1, 2, 9.90),
(1, 2, 1, 4.50),
(2, 2, 3, 4.50);

-- Données pour comments
INSERT INTO comments (contenu, note, dateCommentaire, userId, livreId) VALUES
('Excellent ouvrage, très touchant.', 5, NOW(), 3, 1),
('J''ai trouvé les poèmes très inspirants.', 4, NOW(), 3, 2);

-- Données pour commande livres
INSERT INTO ligne_de_commande_livre (commandeId, livreId, quantite, prixUnitaire) VALUES
(1, 1, 1, 19.99),
(2, 2, 2, 12.50);

