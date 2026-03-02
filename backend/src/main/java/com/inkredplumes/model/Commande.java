package com.inkredplumes.model;

import java.time.LocalDateTime;

import com.inkredplumes.model.converter.OrderStatusConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Entité Commande.
 * Conserve les colonnes existantes + ajoute dateExpedition (nullable).
 */
@Entity
@Table(name = "commande")
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idCommande")
    private Integer idCommande;

    @Column(name = "userId", nullable = false)
    private Integer userId;

    @Column(name = "dateCommande")
    private LocalDateTime dateCommande;

    /** Date d'expédition (renseignée lors du clic "Expédier"). */
    @Column(name = "dateExpedition") // ⬅️ si ta BDD est en snake_case, mets "date_expedition"
    private LocalDateTime dateExpedition;

    /** Statut métier, stocké en base en minuscules via le converter. */
    @Convert(converter = OrderStatusConverter.class)
    @Column(name = "statut", nullable = false, length = 40)
    private OrderStatus statut = OrderStatus.EN_ATTENTE;

    // --- Hooks de cycle de vie ---

    /** Initialise la date de commande et le statut si absents lors de l'insertion. */
    @PrePersist
    public void prePersist() {
        if (this.dateCommande == null) {
            this.dateCommande = LocalDateTime.now();
        }
        if (this.statut == null) {
            this.statut = OrderStatus.EN_ATTENTE;
        }
        // ❗️Ne pas toucher à dateExpedition ici : reste null tant que non expédiée
    }

    // --- Getters / Setters ---

    public Integer getIdCommande() { return idCommande; }
    public void setIdCommande(Integer idCommande) { this.idCommande = idCommande; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public LocalDateTime getDateCommande() { return dateCommande; }
    public void setDateCommande(LocalDateTime dateCommande) { this.dateCommande = dateCommande; }

    public LocalDateTime getDateExpedition() { return dateExpedition; }
    public void setDateExpedition(LocalDateTime dateExpedition) { this.dateExpedition = dateExpedition; }

    public OrderStatus getStatut() { return statut; }
    public void setStatut(OrderStatus statut) { this.statut = statut; }
}
