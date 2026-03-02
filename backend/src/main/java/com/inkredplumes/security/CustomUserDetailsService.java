package com.inkredplumes.security;

import com.inkredplumes.model.User;
import com.inkredplumes.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;



@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
              //  .password(user.getPassword())
                .password("{noop}" + user.getPassword()) // 👈 TRÈS IMPORTANT pour désactiver le hash
                .authorities("ROLE_" + user.getRole().toUpperCase()) // on mettra "admin", "author", etc.
                .build();
    }
}
