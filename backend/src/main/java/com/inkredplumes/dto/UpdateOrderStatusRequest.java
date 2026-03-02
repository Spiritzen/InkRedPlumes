package com.inkredplumes.dto;

import com.inkredplumes.model.OrderStatus;

/** Payload de mise à jour de statut de commande. */
public class UpdateOrderStatusRequest {
    private OrderStatus statut;
    public OrderStatus getStatut() { return statut; }
    public void setStatut(OrderStatus statut) { this.statut = statut; }
}
