package com.trackit.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trackit.model.User;
import com.trackit.repository.UserRepository;
import com.trackit.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            UserDetailsService userDetailsService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            logger.info("Received registration request for username: {}", request.get("username"));
            
            String username = request.get("username");
            String password = request.get("password");
            String email = request.get("email");

            // Validate input
            if (username == null || username.trim().isEmpty()) {
                logger.warn("Registration failed: Username is required");
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (password == null || password.trim().isEmpty()) {
                logger.warn("Registration failed: Password is required");
                return ResponseEntity.badRequest().body("Password is required");
            }
            if (email == null || email.trim().isEmpty()) {
                logger.warn("Registration failed: Email is required");
                return ResponseEntity.badRequest().body("Email is required");
            }

            // Validate username length
            if (username.length() < 3) {
                logger.warn("Registration failed: Username too short");
                return ResponseEntity.badRequest().body("Username must be at least 3 characters long");
            }

            // Validate password length
            if (password.length() < 6) {
                logger.warn("Registration failed: Password too short");
                return ResponseEntity.badRequest().body("Password must be at least 6 characters long");
            }

            // Validate email format
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                logger.warn("Registration failed: Invalid email format");
                return ResponseEntity.badRequest().body("Invalid email format");
            }

            // Check if username exists
            if (userRepository.existsByUsername(username)) {
                logger.warn("Registration failed: Username already exists");
                return ResponseEntity.badRequest().body("Username already exists");
            }

            // Check if email exists
            if (userRepository.existsByEmail(email)) {
                logger.warn("Registration failed: Email already exists");
                return ResponseEntity.badRequest().body("Email already exists");
            }

            // Creating  new user
            User user = new User();
            user.setUsername(username);
            String encodedPassword = passwordEncoder.encode(password);
            logger.info("Password encoded successfully for user: {}", username);
            user.setPassword(encodedPassword);
            user.setEmail(email);
            userRepository.save(user);
            
            logger.info("User registered successfully: {}", username);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            logger.error("Registration error: ", e);
            return ResponseEntity.badRequest().body("An error occurred during registration: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            logger.info("Received login request for username: {}", username);

            if (username == null || password == null) {
                logger.warn("Login failed: Username or password is null");
                return ResponseEntity.badRequest().body("Username and password are required");
            }

            // Checking for user exists or not
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                logger.warn("Login failed: User not found - {}", username);
                return ResponseEntity.badRequest().body("Invalid username or password");
            }
            logger.info("User found in database: {}", username);
            
            // Log the stored password hash (for debugging only)
            logger.info("Stored password hash: {}", user.getPassword());
            
            // Verify password
            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
            logger.info("Password match result: {}", passwordMatches);
            
            if (!passwordMatches) {
                logger.warn("Login failed: Password does not match for user: {}", username);
                return ResponseEntity.badRequest().body("Invalid username or password");
            }

            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
                );
                logger.info("User authenticated successfully: {}", username);
            } catch (Exception e) {
                logger.warn("Login failed: Invalid credentials for user: {}. Error: {}", username, e.getMessage());
                return ResponseEntity.badRequest().body("Invalid username or password");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            String token = jwtUtil.generateToken(userDetails);

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("username", username);

            logger.info("Login successful for user: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login error: ", e);
            return ResponseEntity.badRequest().body("An error occurred during login: " + e.getMessage());
        }
    }
} 