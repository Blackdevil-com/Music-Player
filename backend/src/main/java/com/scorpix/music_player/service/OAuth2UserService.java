package com.scorpix.music_player.service;

import com.scorpix.music_player.entity.Role;
import com.scorpix.music_player.entity.User;
import com.scorpix.music_player.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public OAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request)
            throws OAuth2AuthenticationException {

        // Get user information from Google
        OAuth2User oauth2User = super.loadUser(request);
        Map<String, Object> attributes = oauth2User.getAttributes();

        // Extract Google user information
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String googleId = (String) attributes.get("sub");

        // Check whether user already exists
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    // Update name or picture if changed
                    if (name != null) existingUser.setName(name);
                    if (picture != null) existingUser.setProfilePicture(picture);
                    if (googleId != null) existingUser.setGoogleId(googleId);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Create new user
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProfilePicture(picture);
                    newUser.setGoogleId(googleId);
                    newUser.setRole(Role.USER);
                    return userRepository.save(newUser);
                });

        user.setAttributes(attributes);
        return user;
    }
}