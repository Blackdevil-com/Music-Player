package com.scorpix.music_player.config;

import com.scorpix.music_player.service.OAuth2SuccessHandler;
import com.scorpix.music_player.service.OAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final OAuth2UserService oauth2UserService;
    private final OAuth2SuccessHandler oauth2SuccessHandler;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            OAuth2UserService oauth2UserService,
            OAuth2SuccessHandler oauth2SuccessHandler
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.oauth2UserService = oauth2UserService;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public GET endpoints for music streaming and browsing
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/songs/**",
                                "/api/v1/playlists/**",
                                "/api/v1/artists/**",
                                "/api/v1/albums/**",
                                "/api/v1/spotify/**",
                                "/api/v1/files/**"
                        ).permitAll()
                        // OAuth2 and login endpoints
                        .requestMatchers(
                                "/login/**",
                                "/oauth2/**",
                                "/api/v1/auth/**"
                        ).permitAll()
                        // Only ADMIN has authority to delete songs or playlists
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/songs/**", "/api/v1/playlists/**").hasRole("ADMIN")
                        // All other operations require authentication
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(oauth2UserService)
                        )
                        .successHandler(oauth2SuccessHandler)
                )
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}