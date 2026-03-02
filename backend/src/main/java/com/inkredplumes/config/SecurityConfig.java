package com.inkredplumes.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.inkredplumes.security.JwtFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ===== Public =====
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/livres/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/comments/livres/*/top-comment").permitAll()
                .requestMatchers("/images/**", "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/categories/**").permitAll()

                // ===== Utilisateur connecté =====
                .requestMatchers(HttpMethod.GET,  "/api/users/me").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/api/users/change-password").authenticated()

                // ===== Commandes — endpoints spécifiques (avant les génériques) =====
                // Annulation côté client
                .requestMatchers(HttpMethod.POST, "/api/commandes/*/annuler").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                // Changement de statut (générique DTO)
                .requestMatchers(HttpMethod.PUT,  "/api/commandes/*/statut").hasAnyRole("AUTHOR","ADMIN")
                // Paiement accepté → en_attente_de_preparation
                .requestMatchers(HttpMethod.POST, "/api/commandes/*/payer").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                // Préparation (récap auteur)
                .requestMatchers(HttpMethod.GET,  "/api/commandes/auteur/*/preparation").hasAnyRole("AUTHOR","ADMIN")
                
                // Expédier (auteur)
                .requestMatchers(HttpMethod.POST, "/api/commandes/*/expedier").hasAnyRole("AUTHOR","ADMIN")
                
                // Confirmer réception (client)
                .requestMatchers(HttpMethod.POST, "/api/commandes/*/reception").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                // Récap expédiée (unifié)
                .requestMatchers(HttpMethod.GET,  "/api/commandes/*/expediee").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/commandes/*/payee").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                // Projections
                .requestMatchers(HttpMethod.GET,  "/api/commandes/client/en-attente").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                
                .requestMatchers(HttpMethod.GET,  "/api/commandes/client/details").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/commandes/auteur/details").hasAnyRole("AUTHOR","ADMIN")
                // Mes commandes
                .requestMatchers(HttpMethod.GET,  "/api/commandes/me/**").hasAnyRole("CLIENT","AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/commandes/*/expediee").hasAnyRole("CLIENT","AUTHOR","ADMIN")
             // ➕ pour terminee :
             .requestMatchers(HttpMethod.GET, "/api/commandes/*/terminee").hasAnyRole("CLIENT","AUTHOR","ADMIN")


                // ===== Livres (écriture) =====
                .requestMatchers(HttpMethod.DELETE, "/api/livres/**").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/livres/**").authenticated()
                .requestMatchers(HttpMethod.PUT,    "/api/categories/**").authenticated()

                // ===== Commandes — génériques (laisser après les spécifiques) =====
                .requestMatchers(HttpMethod.GET,  "/api/commandes/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/commandes").authenticated()

                // ===== Le reste =====
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // Si besoin, décommente quand tu actives l'encodage des mots de passe
    /*
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    */
}
