// CommandeExpedieeDetailProjection.java

package com.inkredplumes.dto;


public interface CommandeExpedieeDetailProjection {
    Integer getIdCommande();
    String  getStatut();
    java.time.LocalDateTime getDateCommande();
    java.time.LocalDateTime getDateExpedition();

    Integer getClientId();
    String  getClientPrenom();
    String  getClientNom();

    Integer getAuteurId();
    String  getAuteurPrenom();
    String  getAuteurNom();

    Integer getIdLivre();
    String  getLivreTitre();
    Integer getQuantite();
    java.math.BigDecimal getPrixUnitaire();
    java.math.BigDecimal getTotalLigne();
}
