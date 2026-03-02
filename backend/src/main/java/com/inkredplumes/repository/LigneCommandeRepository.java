package com.inkredplumes.repository;

import com.inkredplumes.model.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Integer> {
}