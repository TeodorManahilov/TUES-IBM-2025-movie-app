package com.example.movie.service;

import com.example.movie.exception.UserAlreadyLoggedIn;
import com.example.movie.exception.UserAlreadyLoggedOut;
import jakarta.servlet.http.HttpSession;
import com.example.movie.exception.UserExistsException;
import com.example.movie.exception.UserNotFoundException;
import com.example.movie.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.movie.model.User;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private HttpSession session;

    public User createUser(User user) {
        return userRepo.save(user);
    }

    public Optional<User> getUserById(Long id) {
        return userRepo.findById(id);
    }

    public ResponseEntity<String> signup(User u) throws UserExistsException {
        if(isLoggedIn()) {
            throw new UserAlreadyLoggedIn("User already logged in");
        }

        PasswordEncoder encoder = new BCryptPasswordEncoder();

        if (userRepo.findByUsername(u.getUsername()) != null) {
            throw new UserExistsException("User already exists");
        }

        u.setPassword(encoder.encode(u.getPassword()));

        session.setAttribute("userId", u.getId());
        session.setAttribute("username", u.getUsername());

        createUser(u);
        return ResponseEntity.ok("Signup successful");
    }

    public ResponseEntity<String> login(User u)
            throws UserNotFoundException, UserAlreadyLoggedIn {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        if(isLoggedIn()) {
            throw new UserAlreadyLoggedIn("User already logged in");
        }

        User dbUser = userRepo.findByUsername(u.getUsername());
        if (dbUser == null) {
            throw new UserNotFoundException("No user with that username found");
        }

        boolean check = encoder.matches(u.getPassword(), dbUser.getPassword());

        session.setAttribute("userId", dbUser.getId());
        session.setAttribute("username", dbUser.getUsername());

        return ResponseEntity.ok("Login successful");
    }

    public ResponseEntity<String> logout() throws UserAlreadyLoggedOut {
        if(!isLoggedIn()) {
            throw new UserAlreadyLoggedOut("User already logged out");
        }

        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    public boolean isLoggedIn() {
        return session.getAttribute("userId") != null;
    }

    public Optional<User> getCurrentUser() {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return Optional.empty();
        }

        return userRepo.findById(userId);
    }
}
