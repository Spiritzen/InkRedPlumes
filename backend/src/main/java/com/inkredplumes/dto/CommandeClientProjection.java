package com.inkredplumes.dto;

public interface CommandeClientProjection {
    Integer getIdCommande();
    String getTitre();
    Integer getQuantite();
    Double getPrixUnitaire();
    String getStatut();
}