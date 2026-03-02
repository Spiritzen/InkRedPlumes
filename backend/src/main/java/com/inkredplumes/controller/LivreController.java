package com.inkredplumes.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.inkredplumes.model.Livre;
import com.inkredplumes.model.LivreStats;
import com.inkredplumes.model.User;
import com.inkredplumes.repository.LivreRepository;
import com.inkredplumes.repository.LivreStatsRepository;
import com.inkredplumes.repository.UserRepository;


@RestController
@RequestMapping("/api/livres")
public class LivreController {

    private final LivreRepository livreRepository;
    private final UserRepository userRepository;

    @Autowired
    private LivreStatsRepository livreStatsRepository;

    @Autowired
    public LivreController(LivreRepository livreRepository, UserRepository userRepository) {
        this.livreRepository = livreRepository;
        this.userRepository = userRepository;
    }

 //  POST /api/livres/upload-image — Upload d'une image dans uploads/livres/
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile image) {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body("Fichier vide.");
        }

        try {
            //  Nouveau dossier de destination dynamique (pas dans /static/)
        	String uploadDir = System.getProperty("user.dir") + "/../uploads/livres";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            //  Nom de fichier unique
            String fileName = System.currentTimeMillis() + "-" + image.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);

            //  Copie physique du fichier
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            //  Chemin accessible via http://localhost:8080/uploads/livres/nom-image.jpg
            return ResponseEntity.ok("/uploads/livres/" + fileName);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload.");
        }
    }

    //  POST /api/livres — Ajouter un livre
   
    @PostMapping
    public ResponseEntity<Livre> createLivre(@RequestBody Livre newLivre, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> auteur = userRepository.findByEmail(email);
        if (auteur.isEmpty()) return ResponseEntity.status(404).build();

     // 1. Associer l'auteur connecté
        newLivre.setAuteurId(auteur.get().getIdUser());

        // 🔧 2. Ajouter la quantité (déjà présente dans l'objet newLivre)
        // Rien à faire ici puisque setQuantite est déjà fait côté React

        // ✅ 3. Sauvegarder le livre
        Livre savedLivre = livreRepository.save(newLivre);

        // ✅ 4. Enregistrer les catégories (multi)
        if (newLivre.getCategorieIds() != null && !newLivre.getCategorieIds().isEmpty()) {
            for (Integer catId : newLivre.getCategorieIds()) {
                jdbcTemplate.update(
                    "INSERT INTO livre_categorie (livreId, categorieId) VALUES (?, ?)",
                    savedLivre.getIdLivre(), catId
                );
            }
        }
        // 🔧 4. Ajouter la quantité (si envoyée depuis React)
        newLivre.setQuantite(newLivre.getQuantite());

        return ResponseEntity.ok(savedLivre);
    }

    //  GET /api/livres — Tous les livres (public)
    @GetMapping
    public List<Livre> getAllLivres() {
        return livreRepository.findAll();
    }

    // GET /api/livres/{id} — Détail
    @GetMapping("/{id}")
    public ResponseEntity<Livre> getLivreById(@PathVariable Integer id) {
        return livreRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //  GET /api/livres/mine — Livres de l’auteur connecté
    @GetMapping("/mine")
    public ResponseEntity<List<Livre>> getMyBooks(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> auteur = userRepository.findByEmail(email);
        if (auteur.isEmpty()) return ResponseEntity.status(404).build();

        Integer auteurId = auteur.get().getIdUser();
        List<Livre> livres = livreRepository.findByAuteurId(auteurId);
        return ResponseEntity.ok(livres);
    }

    //  GET /api/livres/mine/stats — Stats de ventes et notes
    @GetMapping("/mine/stats")
    public ResponseEntity<List<LivreStats>> getStatsByAuteur(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> auteur = userRepository.findByEmail(email);
        if (auteur.isEmpty()) return ResponseEntity.status(404).build();

        Integer auteurId = auteur.get().getIdUser();
        List<LivreStats> stats = livreStatsRepository.findByAuteurId(auteurId);
        return ResponseEntity.ok(stats);
    }

    //  PUT /api/livres/{id} — Modifier
    @PutMapping("/{id}")
    public ResponseEntity<Livre> updateLivre(@PathVariable Integer id, @RequestBody Livre updatedLivre, Authentication authentication) {
        String email = authentication.getName();
      

        Optional<User> auteur = userRepository.findByEmail(email);
        if (auteur.isEmpty()) {
        
            return ResponseEntity.status(403).<Livre>build();
        }

        return livreRepository.findById(id).map(livre -> {
           

            if (!livre.getAuteurId().equals(auteur.get().getIdUser())) {
           
                return ResponseEntity.status(403).<Livre>build();
            }

            livre.setTitre(updatedLivre.getTitre());
            livre.setResume(updatedLivre.getResume());
            livre.setPrix(updatedLivre.getPrix());
            livre.setDateParution(updatedLivre.getDateParution());
            livre.setImagePath(updatedLivre.getImagePath());
            livre.setQuantite(updatedLivre.getQuantite());

            // 🧼 Nettoyage des anciennes catégories
            jdbcTemplate.update("DELETE FROM livre_categorie WHERE livreId = ?", id);
          

            if (updatedLivre.getCategorieIds() != null && !updatedLivre.getCategorieIds().isEmpty()) {
                for (Integer catId : updatedLivre.getCategorieIds()) {
                    jdbcTemplate.update(
                        "INSERT INTO livre_categorie (livreId, categorieId) VALUES (?, ?)",
                        id, catId
                    );
                    System.out.println("✅ Catégorie ajoutée : " + catId);
                }
            }

            Livre saved = livreRepository.save(livre);
           
            return ResponseEntity.ok(saved);

        }).orElseGet(() -> {
         
            return ResponseEntity.notFound().build();
        });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AUTHOR', 'ADMIN')")
    public ResponseEntity<Void> deleteLivre(@PathVariable Integer id, Authentication authentication) {
        Optional<Livre> livreOpt = livreRepository.findById(id);
        if (livreOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Livre livre = livreOpt.get();
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(403).build();
        }

        User user = userOpt.get();
        String role = user.getRole().toUpperCase();

        if ("AUTHOR".equals(role) && !livre.getAuteurId().equals(user.getIdUser())) {
            return ResponseEntity.status(403).build();
        }

        // Supprimer les liens dans livre_categorie
        try {
            livreRepository.removeCategoriesByLivreId(id);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }

        // Supprimer l’image
        String imagePath = livre.getImagePath();
        if (imagePath != null && imagePath.startsWith("/uploads/livres/")) {
            try {
                String absolutePath = Paths.get(System.getProperty("user.dir"), "..", imagePath)
                        .normalize().toAbsolutePath().toString();
                Files.deleteIfExists(Paths.get(absolutePath));
            } catch (IOException ignored) {
            }
        }

        // Supprimer le livre
        try {
            livreRepository.delete(livre);
        } catch (Exception ex) {
            return ResponseEntity.status(500).build();
        }

        return ResponseEntity.noContent().build();
    }


    
    //  GET /api/livres/{id}/categories — Récupère les catégories associées à un livre
    // Utilisé pour afficher les catégories dans la modale du carrousel React
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/{id}/categories")
    public List<String> getCategoriesByLivreId(@PathVariable Long id) {
        String sql = "SELECT c.nomCategorie FROM categorie c " +
                     "JOIN livre_categorie lc ON c.idCategorie = lc.categorieId " +
                     "WHERE lc.livreId = ?";
        return jdbcTemplate.queryForList(sql, String.class, id);
    }

}

