package com.inkredplumes.repository;

import com.inkredplumes.model.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    // Possibilité d'ajouter des méthodes personnalisées plus tard
}
