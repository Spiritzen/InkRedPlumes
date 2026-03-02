package com.inkredplumes.repository;
import java.util.List;
import com.inkredplumes.model.Livre;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

public interface LivreRepository extends JpaRepository<Livre, Integer> {
	List<Livre> findByAuteurId(Integer auteurId);

@Modifying
@Transactional
@Query(value = "DELETE FROM livre_categorie WHERE livreId = :livreId", nativeQuery = true)
void removeCategoriesByLivreId(@Param("livreId") Integer livreId);
}
