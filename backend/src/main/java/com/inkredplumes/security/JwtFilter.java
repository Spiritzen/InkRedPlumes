package com.inkredplumes.security;

// 🔁 Filtres nécessaires à Spring Boot pour intercepter les requêtes
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * 🛡️ Filtres personnalisés pour intercepter chaque requête HTTP et
 * vérifier la présence, la validité et le contenu d’un JWT.
 * 
 * Cette classe est exécutée automatiquement AVANT que Spring Security
 * n’autorise ou n’interdise une requête.
 */
@Component //  Composant Spring détecté automatiquement
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil; // 🔐 Classe utilitaire pour décoder et valider le token

    @Autowired
    private CustomUserDetailsService userDetailsService; // 🔍 Permet de récupérer les infos de l'utilisateur via son email

    /**
     *  Cette méthode est exécutée automatiquement sur chaque requête HTTP
     * Elle intercepte le token JWT, le valide et injecte l’utilisateur dans le contexte de sécurité de Spring.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 📩 On récupère l’en-tête Authorization (il doit contenir : Bearer eyJhbGciOi...)
        final String authHeader = request.getHeader("Authorization");

        String email = null; // 🧑 Email de l'utilisateur à extraire du token
        String token = null; // 🧾 Le JWT brut

        // ✅ Vérifie que l’en-tête commence bien par "Bearer " (obligatoire pour JWT)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // 🔪 Supprime "Bearer " pour ne garder que le token
            email = jwtUtil.extractEmail(token); // 📬 Extrait l'email contenu dans le token
        }

        // 🔐 Si un email a été trouvé et qu’aucun utilisateur n’est encore authentifié pour cette requête
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 📚 Charge les détails de l’utilisateur depuis la base (via UserDetails)
            var userDetails = userDetailsService.loadUserByUsername(email);

            // ✅ Vérifie que le token est bien valide (non expiré, signature correcte, bon email)
            if (jwtUtil.validateToken(token, userDetails.getUsername())) {

                // 🎭 Extrait le rôle contenu dans le token (ex: client, author, admin)
                String role = jwtUtil.extractRole(token);

                // 🔐 Crée un objet Authentication reconnu par Spring Security
                // Ici on indique :
                // - le principal (userDetails, PAS ton entité User !)
                // - les credentials (null car déjà authentifié)
                // - les rôles (ex: ROLE_CLIENT, ROLE_AUTHOR)
                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );

                // 🧩 Associe des détails supplémentaires liés à la requête (IP, session, etc.)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 🔄 Injecte l’utilisateur authentifié dans le contexte global de Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 🔁 Passe la main au filtre suivant de la chaîne (ou au contrôleur si c’est le dernier)
        filterChain.doFilter(request, response);
    }
}
