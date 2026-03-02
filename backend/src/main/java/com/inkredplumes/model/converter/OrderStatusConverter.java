package com.inkredplumes.model.converter;

import com.inkredplumes.model.OrderStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Convertit OrderStatus <-> String (minuscules) en BDD. */
@Converter(autoApply = false)
public class OrderStatusConverter implements AttributeConverter<OrderStatus, String> {
    @Override public String convertToDatabaseColumn(OrderStatus attribute) {
        return attribute == null ? null : attribute.name().toLowerCase(); // ex: EN_ATTENTE -> "en_attente"
    }
    @Override public OrderStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : OrderStatus.valueOf(dbData.toUpperCase()); // "en_attente" -> EN_ATTENTE
    }
}
