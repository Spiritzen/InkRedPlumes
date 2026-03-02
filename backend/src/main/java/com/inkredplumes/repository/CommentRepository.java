package com.inkredplumes.repository;

import com.inkredplumes.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    Optional<Comment> findTopByLivreIdOrderByNoteDescDateCommentaireDesc(Long livreId);
}
