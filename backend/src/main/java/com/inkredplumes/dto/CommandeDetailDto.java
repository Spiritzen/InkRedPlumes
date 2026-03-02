package com.inkredplumes.dto;

public class CommandeDetailDto {

    private Integer idCommande;
    private String clientNom;
    private String titre;
    private int quantite;
    private double prixUnitaire;

    // Constructor
    public CommandeDetailDto(Integer idCommande, String clientNom, String titre, int quantite, double prixUnitaire) {
        this.idCommande = idCommande;
        this.clientNom = clientNom;
        this.titre = titre;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
    }

    // Getters and Setters
    public Integer getIdCommande() {
        return idCommande;
    }

    public void setIdCommande(Integer idCommande) {
        this.idCommande = idCommande;
    }

    public String getClientNom() {
        return clientNom;
    }

    public void setClientNom(String clientNom) {
        this.clientNom = clientNom;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public double getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(double prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }
}
