package com.inkredplumes.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inkredplumes.model.Commande;
import com.inkredplumes.model.OrderStatus;
import com.inkredplumes.repository.CommandeRepository;

@Service
public class CommandeCron {

    private final CommandeRepository commandeRepository;

    public CommandeCron(CommandeRepository commandeRepository) {
        this.commandeRepository = commandeRepository;
    }

    // Tous les jours à 02:15 (ajoute zone si besoin: zone = "Europe/Paris")
    @Scheduled(cron = "0 15 2 * * *")
    @Transactional
    public void autoCloseExpediees() {
        LocalDateTime limit = LocalDateTime.now().minusDays(6);

        // --- OPTION A (bulk update JPA, le plus efficace) ---
        // Décommente si tu ajoutes closeExpediees(...) dans le repo (voir plus bas)
        // int n = commandeRepository.closeExpediees(limit);
        // return;

        // --- OPTION B (sélect + saveAll), simple et sûr ---
        List<Commande> list = commandeRepository
                .findByStatutAndDateExpeditionBefore(OrderStatus.EXPEDIEE, limit);
        for (Commande c : list) {
            c.setStatut(OrderStatus.TERMINEE);
        }
        commandeRepository.saveAll(list);
    }
}
