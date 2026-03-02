package com.inkredplumes.controller;

import com.inkredplumes.model.Produit;
import com.inkredplumes.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    @Autowired
    private ProduitRepository produitRepository;

    @GetMapping
    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Integer id) {
        Optional<Produit> produit = produitRepository.findById(id);
        return produit.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Produit createProduit(@RequestBody Produit produit) {
        return produitRepository.save(produit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produit> updateProduit(@PathVariable Integer id, @RequestBody Produit updated) {
        return produitRepository.findById(id).map(p -> {
            p.setNomProduit(updated.getNomProduit());
            p.setDescriptionProduit(updated.getDescriptionProduit());
            p.setPrixProduit(updated.getPrixProduit());
            p.setStockProduit(updated.getStockProduit());
            return ResponseEntity.ok(produitRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Integer id) {
        return produitRepository.findById(id).map(p -> {
            produitRepository.delete(p);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
