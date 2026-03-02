package com.inkredplumes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface CommandePreparationProjection {
    Integer getIdCommande();
    LocalDateTime getDateCommande();
    String getStatut();

    // Client
    Integer getClientId();
    String getClientPrenom();
    String getClientNom();
    String getClientEmail();
    String getAdresse();
    String getVille();
    String getCodePostal();

    // Livre
    Integer getLivreId();
    String getLivreTitre();
    String getImagePath();
    String getResume();

    // Panier
    Integer getQuantite();
    BigDecimal getPrixUnitaire();
    BigDecimal getTotalLigne();
}
