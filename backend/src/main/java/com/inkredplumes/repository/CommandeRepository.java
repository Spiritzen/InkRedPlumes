package com.inkredplumes.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.inkredplumes.dto.CommandeClientEnAttenteProjection;
import com.inkredplumes.dto.CommandeClientProjection;
import com.inkredplumes.dto.CommandeDetailProjection;
import com.inkredplumes.dto.CommandeParAuteurProjection;
import com.inkredplumes.model.Commande;
import com.inkredplumes.model.OrderStatus;   // ✅ import de l’enum

public interface CommandeRepository extends JpaRepository<Commande, Integer> {

    List<Commande> findByUserId(Integer userId);

    //  String -> OrderStatus
    List<Commande> findByUserIdAndStatut(Integer userId, OrderStatus statut);

    //  String -> OrderStatus
    List<Commande> findByStatut(OrderStatus statut);
    
    //  Pour le cron : récupère seulement les EXPEDIEE avant la limite
    List<Commande> findByStatutAndDateExpeditionBefore(OrderStatus statut, LocalDateTime limit);

    // --- OPTION A (plus perf) : bulk update directement en base ---
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
           update Commande c
              set c.statut = com.inkredplumes.model.OrderStatus.TERMINEE
            where c.statut = com.inkredplumes.model.OrderStatus.EXPEDIEE
              and c.dateExpedition <= :limit
           """)
    int closeExpediees(@Param("limit") LocalDateTime limit);

    //  PROCÉDURE pour les auteurs
    @Query(value = "CALL get_commandes_par_auteur(:auteurId)", nativeQuery = true)
    List<CommandeParAuteurProjection> getCommandesParAuteur(@Param("auteurId") Integer auteurId);

    //  PROCÉDURE pour les clients
    @Query(value = "CALL get_commandes_par_client(:userId)", nativeQuery = true)
    List<CommandeClientProjection> getCommandesParClient(@Param("userId") Integer userId);

    //  Commandes reçues par un auteur (JPQL)
    @Query("""
        SELECT DISTINCT c FROM Commande c
        JOIN LigneDeCommandeLivre lcl ON lcl.commandeId = c.idCommande
        JOIN Livre l ON l.id = lcl.livreId
        WHERE l.auteurId = :auteurId
    """)
    List<Commande> findCommandesByAuteurId(@Param("auteurId") Integer auteurId);

    @Query(value = "CALL get_commandes_par_client_en_attente(:userId)", nativeQuery = true)
    List<CommandeClientEnAttenteProjection> getCommandesParClientEnAttente(@Param("userId") Integer userId);
    
    @Query(value = "CALL get_commande_preparation_auteur(:auteurId, :commandeId)", nativeQuery = true)
    List<com.inkredplumes.dto.CommandePreparationProjection> getCommandePreparationAuteur(
            @Param("auteurId") Integer auteurId,
            @Param("commandeId") Integer commandeId
    );
 // com/inkredplumes/repository/CommandeRepository.java
    @Query(value = "CALL get_commande_detail_auteur(:auteurId, :commandeId)", nativeQuery = true)
    List<CommandeDetailProjection> getCommandeDetailAuteur(@Param("auteurId") Integer auteurId,
                                                           @Param("commandeId") Integer commandeId);

    @Query(value = "CALL get_commande_detail_client(:userId, :commandeId)", nativeQuery = true)
    List<CommandeDetailProjection> getCommandeDetailClient(@Param("userId") Integer userId,
                                                           @Param("commandeId") Integer commandeId);
    

}
