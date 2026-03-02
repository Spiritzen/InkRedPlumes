-- comments.userId → user.idUser
ALTER TABLE comments
ADD CONSTRAINT fk_comments_user
FOREIGN KEY (userId) REFERENCES user(idUser);

-- comments.livreId → livre.idLivre
ALTER TABLE comments
ADD CONSTRAINT fk_comments_livre
FOREIGN KEY (livreId) REFERENCES livre(idLivre);

-- livre.auteurId → user.idUser
ALTER TABLE livre
ADD CONSTRAINT fk_livre_auteur
FOREIGN KEY (auteurId) REFERENCES user(idUser);

-- commande.userId → user.idUser
ALTER TABLE commande
ADD CONSTRAINT fk_commande_user
FOREIGN KEY (userId) REFERENCES user(idUser);

-- ligne_de_commande.commandeId → commande.idCommande
ALTER TABLE ligne_de_commande
ADD CONSTRAINT fk_ldc_commande
FOREIGN KEY (commandeId) REFERENCES commande(idCommande);

-- ligne_de_commande.produitId → produit.idProduit
ALTER TABLE ligne_de_commande
ADD CONSTRAINT fk_ldc_produit
FOREIGN KEY (produitId) REFERENCES produit(idProduit);

ALTER TABLE ligne_de_commande_livre
ADD CONSTRAINT fk_ldc_livre_commande
FOREIGN KEY (commandeId) REFERENCES commande(idCommande);

ALTER TABLE ligne_de_commande_livre
ADD CONSTRAINT fk_ldc_livre_livre
FOREIGN KEY (livreId) REFERENCES livre(idLivre);

ALTER TABLE commande
ADD COLUMN statut VARCHAR(30) NOT NULL DEFAULT 'en_attente';

ALTER TABLE commande
ADD CONSTRAINT check_statut_commande
CHECK (statut IN (
  'en_attente',
  'payee',
  'en_cours_de_traitement',
  'expediee',
  'terminee',
  'en_attente_de_preparation',
  'annulee'
));