package com.inkredplumes;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Permet d'exposer des ressources statiques accessibles via l'URL
     * Exemple : http://localhost:8080/uploads/livres/nom-image.jpg
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 🔓 Permet d’accéder aux fichiers dans le dossier uploads/ à la racine du projet
    	registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + System.getProperty("user.dir") + "/../uploads/");

        // 🧩 Garde aussi l'accès aux images situées dans src/main/resources/static/images
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }

    /**
     * Autorise les requêtes cross-origin entre le backend (Spring Boot)
     * et le frontend (React sur http://localhost:5173)
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
        .allowedOriginPatterns("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
