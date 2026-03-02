package com.inkredplumes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "produit")
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idProduit")
    private Integer idProduit;

    @Column(name = "nomProduit")
    private String nomProduit;

    @Column(name = "descriptionProduit")
    private String descriptionProduit;

    @Column(name = "prixProduit")
    private Double prixProduit;

    @Column(name = "stockProduit")
    private Integer stockProduit;

    // Getters & Setters
    public Integer getIdProduit() {
        return idProduit;
    }

    public void setIdProduit(Integer idProduit) {
        this.idProduit = idProduit;
    }

    public String getNomProduit() {
        return nomProduit;
    }

    public void setNomProduit(String nomProduit) {
        this.nomProduit = nomProduit;
    }

    public String getDescriptionProduit() {
        return descriptionProduit;
    }

    public void setDescriptionProduit(String descriptionProduit) {
        this.descriptionProduit = descriptionProduit;
    }

    public Double getPrixProduit() {
        return prixProduit;
    }

    public void setPrixProduit(Double prixProduit) {
        this.prixProduit = prixProduit;
    }

    public Integer getStockProduit() {
        return stockProduit;
    }

    public void setStockProduit(Integer stockProduit) {
        this.stockProduit = stockProduit;
    }
}
