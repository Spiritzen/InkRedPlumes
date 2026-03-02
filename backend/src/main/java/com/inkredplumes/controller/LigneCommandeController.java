package com.inkredplumes.controller;

import com.inkredplumes.model.LigneCommande;
import com.inkredplumes.repository.LigneCommandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ligne-commandes")
public class LigneCommandeController {

    @Autowired
    private LigneCommandeRepository ligneCommandeRepository;

    @GetMapping
    public List<LigneCommande> getAllLignesCommande() {
        return ligneCommandeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LigneCommande> getLigneCommandeById(@PathVariable Integer id) {
        Optional<LigneCommande> ligne = ligneCommandeRepository.findById(id);
        return ligne.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LigneCommande createLigneCommande(@RequestBody LigneCommande ligneCommande) {
        return ligneCommandeRepository.save(ligneCommande);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LigneCommande> updateLigneCommande(@PathVariable Integer id, @RequestBody LigneCommande updatedLigne) {
        return ligneCommandeRepository.findById(id).map(ligne -> {
            ligne.setCommandeId(updatedLigne.getCommandeId());
            ligne.setProduitId(updatedLigne.getProduitId());
            ligne.setQuantite(updatedLigne.getQuantite());
            ligne.setPrixUnitaire(updatedLigne.getPrixUnitaire());
            return ResponseEntity.ok(ligneCommandeRepository.save(ligne));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLigneCommande(@PathVariable Integer id) {
        return ligneCommandeRepository.findById(id).map(ligne -> {
            ligneCommandeRepository.delete(ligne);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
