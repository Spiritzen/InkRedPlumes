package com.inkredplumes.dto;

public interface CommandeClientEnAttenteProjection {
    Integer getIdCommande();
    String getDateCommande();
    String getStatut();
    
    Integer getLivreId();
    String getLivreTitre();
    String getImagePath();
    String getResume();
    Double getNoteMoyenne();

    Integer getAuteurId();
    String getAuteurPrenom();
    String getAuteurNom();
    Double getAuteurNote();

    Integer getQuantite();
    Double getPrixUnitaire();
}
