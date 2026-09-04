package com.scorpix.music_player.config;

import com.scorpix.music_player.entity.User;
import com.scorpix.music_player.repository.UserRepository;
import com.scorpix.music_player.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Read Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. Check whether header contains Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract JWT
        String token = authHeader.substring(7);

        try {
            // 4. Extract email from JWT
            String email = jwtService.extractEmail(token);

            // 5. Check if user is not already authenticated
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Find user in database
                User user = userRepository.findByEmail(email).orElse(null);

                // 7. Validate token and user
                if (user != null && jwtService.isTokenValid(token)) {

                    // 8. Create authentication object
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    user.getAuthorities()
                            );

                    // 9. Put authentication into SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

        } catch (Exception e) {
            // Invalid JWT → don't authenticate
        }

        // 10. Continue request
        filterChain.doFilter(request, response);
    }
}
