package com.inkredplumes.controller;

import com.inkredplumes.dto.AuthRequest;
import com.inkredplumes.model.User;
import com.inkredplumes.repository.UserRepository;
import com.inkredplumes.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

            System.out.println("✅ Token généré pour : " + user.getEmail());
            return ResponseEntity.ok(Map.of("token", token)); // ✅ corrigé ici

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Identifiants invalides");
        }
    }
}
