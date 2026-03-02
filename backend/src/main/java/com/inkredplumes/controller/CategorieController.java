package com.inkredplumes.controller;

import com.inkredplumes.model.Categorie;
import com.inkredplumes.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CategorieController {

    @Autowired
    private CategorieRepository categorieRepository;

    // Récupérer toutes les catégories
    @GetMapping
    public List<Categorie> getAllCategories() {
    	System.out.println("Requête GET reçue sur /api/categories");
        return categorieRepository.findAll();
    }

    // Ajouter une nouvelle catégorie (au besoin)
    @PostMapping
    public Categorie createCategorie(@RequestBody Categorie categorie) {
        return categorieRepository.save(categorie);
    }
}
