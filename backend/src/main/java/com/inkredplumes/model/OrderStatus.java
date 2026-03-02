// src/main/java/com/inkredplumes/model/OrderStatus.java
package com.inkredplumes.model;

/**
 * Cycle de vie d'une commande.
 * Persistée en base en minuscules via le converter.
 */
public enum OrderStatus {
    EN_ATTENTE,
    PAYEE,
    EN_COURS_DE_TRAITEMENT,

    // ✅ Nouveau : côté vendeur = “à préparer” (commande payée et en attente de préparation)
    EN_ATTENTE_DE_PREPARATION,

    EXPEDIEE,
    TERMINEE,
    ANNULEE
}
