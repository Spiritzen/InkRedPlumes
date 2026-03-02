package com.inkredplumes.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.inkredplumes.dto.CommandeClientEnAttenteProjection;
import com.inkredplumes.dto.CommandeClientProjection;
import com.inkredplumes.dto.CommandeDetailProjection;
import com.inkredplumes.dto.CommandeParAuteurProjection;
import com.inkredplumes.dto.CommandePreparationProjection;
import com.inkredplumes.dto.UpdateOrderStatusRequest;
import com.inkredplumes.model.Commande;
import com.inkredplumes.model.OrderStatus;
import com.inkredplumes.model.User;
import com.inkredplumes.repository.CommandeRepository;
import com.inkredplumes.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/commandes")
public class CommandeController {

    @Autowired private CommandeRepository commandeRepository;
    @Autowired private UserRepository userRepository;

    // =========================
    //      LECTURES GENERALES
    // =========================

    // ADMIN – tout (optionnel)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Commande> getAllCommandes() {
        return commandeRepository.findAll();
    }

    // Mes commandes (brut)
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public List<Commande> getMyCommandes(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        return commandeRepository.findByUserId(user.getIdUser());
    }

    // Mes commandes par statut (enum)
    @GetMapping("/me/statut/{statut}")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public List<Commande> getMyCommandesByStatut(@PathVariable String statut, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        var s = OrderStatus.valueOf(statut.toUpperCase());
        return commandeRepository.findByUserIdAndStatut(user.getIdUser(), s);
    }

    // Auteur – projections “details” (pour tableau)
    @GetMapping("/auteur/details")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    public ResponseEntity<List<CommandeParAuteurProjection>> getCommandesParAuteur(Authentication auth) {
        var auteur = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        return ResponseEntity.ok(commandeRepository.getCommandesParAuteur(auteur.getIdUser()));
    }

    // Client (ou auteur acheteur) – projections “details” (pour tableau)
    @GetMapping("/client/details")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public ResponseEntity<List<CommandeClientProjection>> getCommandesClientAvecDetails(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        return ResponseEntity.ok(commandeRepository.getCommandesParClient(user.getIdUser()));
    }

    // Client – en attente (pour modale CommandeClientEnAttente)
    @GetMapping("/client/en-attente")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public List<CommandeClientEnAttenteProjection> getCommandesClientEnAttente(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        return commandeRepository.getCommandesParClientEnAttente(user.getIdUser());
    }

    // =========================
    //     C.R.U.D / STATUTS
    // =========================

    // Création commande (client ou auteur acheteur)
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR')")
    public Commande createCommande(@RequestBody Commande commande, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        commande.setUserId(user.getIdUser());
        commande.setDateCommande(LocalDateTime.now());
        commande.setStatut(OrderStatus.EN_ATTENTE);
        return commandeRepository.save(commande);
    }

    // Update statut (administration / outils)
    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    public ResponseEntity<?> updateStatutCommande(@PathVariable Integer id, @RequestBody UpdateOrderStatusRequest body) {
        var opt = commandeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        if (body == null || body.getStatut() == null) return ResponseEntity.badRequest().body("Le champ 'statut' est requis.");
        var cmd = opt.get();
        cmd.setStatut(body.getStatut());
        commandeRepository.save(cmd);
        return ResponseEntity.ok("Statut mis à jour.");
    }

    // Annuler (client/auteur acheteur/admin) — EN_ATTENTE -> ANNULEE
    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public ResponseEntity<?> annulerCommande(@PathVariable Integer id) {
        var opt = commandeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        var cmd = opt.get();
        if (cmd.getStatut() != OrderStatus.EN_ATTENTE) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Seules les commandes EN_ATTENTE peuvent être annulées.");
        }
        cmd.setStatut(OrderStatus.ANNULEE);
        commandeRepository.save(cmd);
        return ResponseEntity.noContent().build();
    }

    // Paiement validé → EN_ATTENTE_DE_PREPARATION
    @PostMapping("/{id}/payer")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public ResponseEntity<?> marquerCommandePayee(@PathVariable Integer id) {
        var opt = commandeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        var cmd = opt.get();

        if (cmd.getStatut() == OrderStatus.ANNULEE
                || cmd.getStatut() == OrderStatus.EXPEDIEE
                || cmd.getStatut() == OrderStatus.TERMINEE) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Commande déjà finalisée, impossible de la marquer payée.");
        }

        cmd.setStatut(OrderStatus.EN_ATTENTE_DE_PREPARATION);
        commandeRepository.save(cmd);
        return ResponseEntity.ok("Statut mis à jour : en_attente_de_preparation");
    }

    // =========================
    //     PREPARATION AUTEUR
    // =========================

    // Récap préparation (auteur)
    @GetMapping("/auteur/{id}/preparation")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    public ResponseEntity<?> getCommandePreparationAuteur(@PathVariable Integer id, Authentication auth) {
        var auteur = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        List<CommandePreparationProjection> rows = commandeRepository.getCommandePreparationAuteur(auteur.getIdUser(), id);
        if (rows == null || rows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Commande introuvable ou non autorisée.");
        }
        return ResponseEntity.ok(rows);
    }

    // Expédier (auteur) → EXPEDIEE + dateExpedition = now
    @PostMapping("/{id}/expedier")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    @Transactional
    public ResponseEntity<?> expedierCommande(@PathVariable Integer id, Authentication auth) {
        var auteur = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        var opt = commandeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        // vérifie que la commande concerne au moins 1 livre de cet auteur
        var rows = commandeRepository.getCommandePreparationAuteur(auteur.getIdUser(), id);
        if (rows == null || rows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cette commande ne concerne pas vos livres.");
        }

        var cmd = opt.get();
        cmd.setStatut(OrderStatus.EXPEDIEE);
        cmd.setDateExpedition(LocalDateTime.now());
        commandeRepository.save(cmd);

        return ResponseEntity.ok("Commande expédiée.");
    }

    // =========================
    //   DETALS EXPEDIEE (MODALE)
    // =========================

    // Auteur – détails expédiée
    @GetMapping("/auteur/{id}/expediee")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    public ResponseEntity<?> getCommandeExpedieeAuteur(@PathVariable Integer id, Authentication auth) {
        var auteur = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        var rows = commandeRepository.getCommandeDetailAuteur(auteur.getIdUser(), id);
        if (rows == null || rows.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Commande introuvable.");
        return ResponseEntity.ok(rows);
    }

    // Client (ou auteur acheteur) – détails expédiée
    @GetMapping("/client/{id}/expediee")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public ResponseEntity<?> getCommandeExpedieeClient(@PathVariable Integer id, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        var rows = commandeRepository.getCommandeDetailClient(user.getIdUser(), id);
        if (rows == null || rows.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Commande introuvable.");
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/{id}/expediee")
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    public ResponseEntity<?> getCommandeExpediee(@PathVariable Integer id, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        var cmdOpt = commandeRepository.findById(id);
        if (cmdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Commande inconnue.");
        }
        var cmd = cmdOpt.get();

        // ✅ rester carré : refuse si pas encore expédiée
        if (cmd.getStatut() != OrderStatus.EXPEDIEE) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("La commande n'est pas encore expédiée.");
        }

        // 1) Essai auteur (au moins une ligne lui appartient)
        var rowsAuteur = commandeRepository.getCommandeDetailAuteur(user.getIdUser(), id);
        if (rowsAuteur != null && !rowsAuteur.isEmpty()) {
            return ResponseEntity.ok(rowsAuteur);
        }

        // 2) Essai client (c’est son achat)
        if (cmd.getUserId() != null && cmd.getUserId().equals(user.getIdUser())) {
            var rowsClient = commandeRepository.getCommandeDetailClient(user.getIdUser(), id);
            if (rowsClient != null && !rowsClient.isEmpty()) {
                return ResponseEntity.ok(rowsClient);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Détails expédiés introuvables.");
        }

        // 3) Admin : OK (on réutilise la projection client)
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            var rowsAdmin = commandeRepository.getCommandeDetailClient(cmd.getUserId(), id);
            return ResponseEntity.ok(rowsAdmin);
        }

        // 4) Sinon
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Commande introuvable ou accès non autorisé.");
    }

    // =========================
    //      RECEPTION CLIENT
    // =========================

 // APRÈS ✅
    @PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
    @PostMapping("/{id}/reception")
    public ResponseEntity<?> confirmerReception(@PathVariable Integer id, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        var opt = commandeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        var c = opt.get();
        // ✅ Sécurité métier : seule la personne qui a acheté peut confirmer
        if (!c.getUserId().equals(user.getIdUser())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cette commande ne vous appartient pas.");
        }
        if (c.getStatut() != OrderStatus.EXPEDIEE) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("La commande n'est pas expédiée.");
        }

        c.setStatut(OrderStatus.TERMINEE);
        commandeRepository.save(c);
        return ResponseEntity.ok("Commande marquée reçue.");
    }
 // =========================
//  DÉTAILS TERMINÉE (MODALE)
//=========================

@GetMapping("/{id}/terminee")
@PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
public ResponseEntity<?> getCommandeTerminee(@PathVariable Integer id, Authentication auth) {
   var user = userRepository.findByEmail(auth.getName())
           .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

   var cmdOpt = commandeRepository.findById(id);
   if (cmdOpt.isEmpty()) {
       return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Commande inconnue.");
   }
   var cmd = cmdOpt.get();

   // ✅ commande doit être TERMINEE
   if (cmd.getStatut() != OrderStatus.TERMINEE) {
       return ResponseEntity.status(HttpStatus.CONFLICT)
               .body("La commande n'est pas terminée.");
   }

   // 1) Essai auteur (commande liée à au moins un livre de cet auteur)
   var rowsAuteur = commandeRepository.getCommandeDetailAuteur(user.getIdUser(), id);
   if (rowsAuteur != null && !rowsAuteur.isEmpty()) {
       return ResponseEntity.ok(rowsAuteur);
   }

   // 2) Essai client (c’est son achat)
   if (cmd.getUserId() != null && cmd.getUserId().equals(user.getIdUser())) {
       var rowsClient = commandeRepository.getCommandeDetailClient(user.getIdUser(), id);
       if (rowsClient != null && !rowsClient.isEmpty()) {
           return ResponseEntity.ok(rowsClient);
       }
       return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Détails terminée introuvables.");
   }

   // 3) Admin → OK (on réutilise la projection client)
   boolean isAdmin = auth.getAuthorities().stream()
           .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "admin".equalsIgnoreCase(a.getAuthority()));
   if (isAdmin) {
       var rowsAdmin = commandeRepository.getCommandeDetailClient(cmd.getUserId(), id);
       return ResponseEntity.ok(rowsAdmin);
   }

   return ResponseEntity.status(HttpStatus.FORBIDDEN)
           .body("Commande introuvable ou accès non autorisé.");
}
//GET /api/commandes/{id}/payee
@GetMapping("/{id}/payee")
@PreAuthorize("hasAnyRole('CLIENT','AUTHOR','ADMIN')")
public ResponseEntity<?> getCommandePayee(@PathVariable Integer id, Authentication auth) {
 var user = userRepository.findByEmail(auth.getName()).orElseThrow();
 var cmd = commandeRepository.findById(id).orElse(null);
 if (cmd == null) return ResponseEntity.status(404).body("Commande inconnue.");
 if (cmd.getStatut() == null || cmd.getStatut() == OrderStatus.EN_ATTENTE || cmd.getStatut() == OrderStatus.ANNULEE) {
     return ResponseEntity.status(409).body("Commande non payée.");
 }
 // auteur d'abord
 var rowsAuteur = commandeRepository.getCommandeDetailAuteur(user.getIdUser(), id);
 if (rowsAuteur != null && !rowsAuteur.isEmpty()) return ResponseEntity.ok(rowsAuteur);
 // sinon client propriétaire
 if (cmd.getUserId() != null && cmd.getUserId().equals(user.getIdUser())) {
     var rowsClient = commandeRepository.getCommandeDetailClient(user.getIdUser(), id);
     if (rowsClient != null && !rowsClient.isEmpty()) return ResponseEntity.ok(rowsClient);
 }
 // admin fallback éventuel identique à expédiée/terminée
 return ResponseEntity.status(403).body("Accès non autorisé.");
}
}
