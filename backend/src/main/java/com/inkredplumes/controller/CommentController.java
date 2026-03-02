package com.inkredplumes.controller;

import java.util.List;
import java.util.Optional;

import com.inkredplumes.model.Comment;
import com.inkredplumes.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Integer id) {
        Optional<Comment> comment = commentRepository.findById(id);
        return comment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Comment createComment(@RequestBody Comment newComment) {
        return commentRepository.save(newComment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Integer id, @RequestBody Comment updatedComment) {
        return commentRepository.findById(id).map(comment -> {
            comment.setContenu(updatedComment.getContenu());
            comment.setNote(updatedComment.getNote());
            comment.setDateCommentaire(updatedComment.getDateCommentaire());
            comment.setUserId(updatedComment.getUserId());
            comment.setLivreId(updatedComment.getLivreId());
            return ResponseEntity.ok(commentRepository.save(comment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer id) {
        return commentRepository.findById(id).map(comment -> {
            commentRepository.delete(comment);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Meilleur commentaire pour un livre (note + date)
    @GetMapping("/livres/{livreId}/top-comment")
    public ResponseEntity<Comment> getTopComment(@PathVariable Long livreId) {
        return commentRepository.findTopByLivreIdOrderByNoteDescDateCommentaireDesc(livreId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
