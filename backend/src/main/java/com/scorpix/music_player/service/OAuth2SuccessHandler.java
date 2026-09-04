package com.scorpix.music_player.service;

import com.scorpix.music_player.entity.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/auth/callback}")
    private String defaultRedirectUri;

    public OAuth2SuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws ServletException, IOException {

        // Get authenticated user
        User user = (User) authentication.getPrincipal();

        // Generate JWT
        String token = jwtService.generateToken(user);

        // Determine the frontend callback URL dynamically
        String targetRedirectUri = defaultRedirectUri;

        // 1. Check if frontend set a cookie for its exact origin/callback
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("frontend_redirect_uri".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    try {
                        String decoded = URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8);
                        if (decoded.startsWith("http://localhost:") || decoded.startsWith("http://127.0.0.1:")) {
                            targetRedirectUri = decoded;
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        // Clean up the cookie
        Cookie deleteCookie = new Cookie("frontend_redirect_uri", "");
        deleteCookie.setPath("/");
        deleteCookie.setMaxAge(0);
        response.addCookie(deleteCookie);

        // Redirect to React frontend callback with token
        String targetUrl = targetRedirectUri + "?token=" + token;

        response.sendRedirect(targetUrl);
    }
}