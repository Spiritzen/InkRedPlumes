package com.inkredplumes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ligne_de_commande")
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idLigne")
    private Integer idLigne;

    @Column(name = "commandeId")
    private Integer commandeId;

    @Column(name = "produitId")
    private Integer produitId;

    @Column(name = "quantite")
    private Integer quantite;

    @Column(name = "prixUnitaire")
    private Double prixUnitaire;

    // Getters et Setters
    public Integer getIdLigne() {
        return idLigne;
    }

    public void setIdLigne(Integer idLigne) {
        this.idLigne = idLigne;
    }

    public Integer getCommandeId() {
        return commandeId;
    }

    public void setCommandeId(Integer commandeId) {
        this.commandeId = commandeId;
    }

    public Integer getProduitId() {
        return produitId;
    }

    public void setProduitId(Integer produitId) {
        this.produitId = produitId;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public Double getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(Double prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }
}
