
// LigneDeCommandeLivreController.java
package com.inkredplumes.controller;

import com.inkredplumes.model.LigneDeCommandeLivre;
import com.inkredplumes.repository.LigneDeCommandeLivreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ligne-commande-livres")
public class LigneDeCommandeLivreController {

    @Autowired
    private LigneDeCommandeLivreRepository repository;

    @GetMapping
    public List<LigneDeCommandeLivre> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LigneDeCommandeLivre> getById(@PathVariable Integer id) {
        Optional<LigneDeCommandeLivre> ligne = repository.findById(id);
        return ligne.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LigneDeCommandeLivre create(@RequestBody LigneDeCommandeLivre ligne) {
        return repository.save(ligne);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LigneDeCommandeLivre> update(@PathVariable Integer id, @RequestBody LigneDeCommandeLivre updated) {
        return repository.findById(id).map(ligne -> {
            ligne.setCommandeId(updated.getCommandeId());
            ligne.setLivreId(updated.getLivreId());
            ligne.setQuantite(updated.getQuantite());
            ligne.setPrixUnitaire(updated.getPrixUnitaire());
            return ResponseEntity.ok(repository.save(ligne));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return repository.findById(id).map(ligne -> {
            repository.delete(ligne);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
