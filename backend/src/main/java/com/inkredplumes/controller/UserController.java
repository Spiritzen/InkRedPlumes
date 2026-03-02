package com.inkredplumes.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.inkredplumes.model.User;
import com.inkredplumes.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    //  GET /api/users/me — infos de l'utilisateur connecté
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getIdUser());
        userInfo.put("email", user.getEmail());
        userInfo.put("firstName", user.getFirstName());
        userInfo.put("lastName", user.getLastName());
        userInfo.put("role", user.getRole());
        userInfo.put("adresse", user.getAdresse());
        userInfo.put("ville", user.getVille());
        userInfo.put("codePostal", user.getCodePostal());

        return ResponseEntity.ok(userInfo);
    }

    // 🟢 PUT /api/users/me — mise à jour des infos perso de l'utilisateur connecté
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody Map<String, String> updates, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        user.setFirstName(updates.get("firstName"));
        user.setLastName(updates.get("lastName"));
        user.setAdresse(updates.get("adresse"));
        user.setVille(updates.get("ville"));
        user.setCodePostal(updates.get("codePostal"));

        userRepository.save(user);

        return ResponseEntity.ok("✅ Informations mises à jour !");
    }

    // ✅ GET /api/users — tous les utilisateurs
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST /api/users
    @PostMapping
    public User createUser(@RequestBody User newUser) {
        return userRepository.save(newUser);
    }

    // ✅ PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setEmail(updatedUser.getEmail());
            user.setPassword(updatedUser.getPassword());
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setRole(updatedUser.getRole());
            user.setCreatedAt(updatedUser.getCreatedAt());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }
 // 🔐 PUT /api/users/change-password — changement du mot de passe
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        
        String email = authentication.getName();
        String ancienMotDePasse = payload.get("ancienMotDePasse");
        String nouveauMotDePasse = payload.get("nouveauMotDePasse");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        if (!user.getPassword().equals(ancienMotDePasse)) {
            return ResponseEntity.badRequest().body("❌ Ancien mot de passe incorrect.");
        }

        user.setPassword(nouveauMotDePasse); // en clair pour l'instant
        userRepository.save(user);

        return ResponseEntity.ok("✅ Mot de passe modifié !");
    }

    // ✅ DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST /api/users/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User newUser) {
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("❌ Un compte avec cet email existe déjà.");
        }

        // newUser.setPassword(passwordEncoder.encode(newUser.getPassword())); // activer en prod
        newUser.setPassword(newUser.getPassword()); // provisoire
        newUser.setCreatedAt(java.time.LocalDateTime.now());

        userRepository.save(newUser);

        return ResponseEntity.status(201).build();
    }
}
