
CREATE DATABASE IF NOT EXISTS ink_red_plumes;
USE ink_red_plumes;

CREATE TABLE user (
   idUser INT AUTO_INCREMENT PRIMARY KEY,
   email VARCHAR(150) NOT NULL UNIQUE,
   `password` VARCHAR(255) NOT NULL,
   firstName VARCHAR(100) NOT NULL,
   lastName VARCHAR(100) NOT NULL,
   role VARCHAR(6) NOT NULL,
   createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE livre (
   idLivre INT AUTO_INCREMENT PRIMARY KEY,
   titre VARCHAR(200) NOT NULL,
   resume VARCHAR(600),
   prix DECIMAL(10,2) NOT NULL,
   dateParution DATE NOT NULL,
   imagePath VARCHAR(255),
   auteurId INT NOT NULL
);

CREATE TABLE comments (
   idComment INT AUTO_INCREMENT PRIMARY KEY,
   contenu VARCHAR(600) NOT NULL,
   note INT CHECK (note BETWEEN 1 AND 5),
   dateCommentaire DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   userId INT NOT NULL,
   livreId INT NOT NULL
);

CREATE TABLE commande (
   idCommande INT AUTO_INCREMENT PRIMARY KEY,
   userId INT NOT NULL,
   dateCommande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produit (
   idProduit INT AUTO_INCREMENT PRIMARY KEY,
   nomProduit VARCHAR(100) NOT NULL,
   descriptionProduit VARCHAR(600),
   prixProduit DECIMAL(10,2) NOT NULL,
   stockProduit INT NOT NULL
);

CREATE TABLE ligne_de_commande (
   idLigne INT AUTO_INCREMENT PRIMARY KEY,
   commandeId INT NOT NULL,
   produitId INT NOT NULL,
   quantite INT NOT NULL,
   prixUnitaire DECIMAL(10,2) NOT NULL
);
CREATE TABLE ligne_de_commande_livre (
   idLigneLivre INT AUTO_INCREMENT PRIMARY KEY,
   commandeId INT NOT NULL,
   livreId INT NOT NULL,
   quantite INT NOT NULL,
   prixUnitaire DECIMAL(10,2) NOT NULL
);
