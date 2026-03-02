package com.inkredplumes.repository;
import java.util.Optional;
import com.inkredplumes.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
	Optional<User> findByEmail(String email);
}