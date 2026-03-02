package com.inkredplumes.dto;

public interface CommandeParAuteurProjection {
    Integer getIdCommande();
    String getClientNom();
    String getTitre();
    Integer getQuantite();
    Double getPrixUnitaire();
    String getStatut();
}

