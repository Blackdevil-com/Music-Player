package com.scorpix.music_player.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails, OAuth2User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String name;
    private String profilePicture;
    private String googleId;

    @Enumerated(EnumType.STRING)
    private Role role;
    private LocalDateTime createAt;


    @PrePersist
    public void onCreate() { 
        this.createAt = LocalDateTime.now(); 
        if (this.role == null) {
            this.role = Role.USER;
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Role effectiveRole = role != null ? role : Role.USER;
        return List.of(() -> "ROLE_" + effectiveRole.name());
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Transient
    private Map<String, Object> attributes;
    @Override
    public Map<String, Object> getAttributes() {
        return attributes != null ? attributes : Collections.emptyMap();
    }
}
