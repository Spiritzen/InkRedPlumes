// CommandeDetailProjection.java
package com.inkredplumes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface CommandeDetailProjection {
    Integer getIdCommande();
    LocalDateTime getDateExpedition();  // ⬅️ NOUVEAU

    String getClientPrenom();
    String getClientNom();
    String getClientEmail();
    String getAdresse();
    String getCodePostal();
    String getVille();

    Integer getIdLivre();
    String getLivreTitre();
    String getResume();
    String getImagePath();

    BigDecimal getPrixUnitaire();
    Integer getQuantite();
    BigDecimal getTotalLigne();
}
