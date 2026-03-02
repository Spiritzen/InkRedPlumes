// LigneDeCommandeLivre.java - MODEL
package com.inkredplumes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ligne_de_commande_livre")
public class LigneDeCommandeLivre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idLigneLivre")
    private Integer idLigneLivre;

    @Column(name = "commandeId")
    private Integer commandeId;

    @Column(name = "livreId")
    private Integer livreId;

    @Column(name = "quantite")
    private Integer quantite;

    @Column(name = "prixUnitaire")
    private Double prixUnitaire;

    public Integer getIdLigneLivre() {
        return idLigneLivre;
    }

    public void setIdLigneLivre(Integer idLigneLivre) {
        this.idLigneLivre = idLigneLivre;
    }

    public Integer getCommandeId() {
        return commandeId;
    }

    public void setCommandeId(Integer commandeId) {
        this.commandeId = commandeId;
    }

    public Integer getLivreId() {
        return livreId;
    }

    public void setLivreId(Integer livreId) {
        this.livreId = livreId;
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