package com.inkredplumes.repository;

import com.inkredplumes.model.LivreStats;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LivreStatsRepository extends JpaRepository<LivreStats, Integer> {
    List<LivreStats> findByAuteurId(Integer auteurId);
}