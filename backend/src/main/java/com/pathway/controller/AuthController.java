package com.pathway.controller;
import com.pathway.dto.AuthDtos.*;
import com.pathway.model.AppUser;
import com.pathway.repo.UserRepository;
import com.pathway.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt;
    public AuthController(UserRepository users,PasswordEncoder encoder,JwtService jwt){this.users=users;this.encoder=encoder;this.jwt=jwt;}
    @PostMapping("/register") public AuthResponse register(@Valid @RequestBody RegisterRequest r) {
        String email=r.email().trim().toLowerCase();
        if(users.existsByEmail(email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"An account with this email already exists.");
        AppUser u=users.save(new AppUser(r.fullName().trim(),email,encoder.encode(r.password())));
        return new AuthResponse(jwt.generate(u.getEmail()),u.getFullName(),u.getEmail());
    }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r) {
        AppUser u=users.findByEmail(r.email().trim().toLowerCase()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password."));
        if(!encoder.matches(r.password(),u.getPasswordHash())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password.");
        return new AuthResponse(jwt.generate(u.getEmail()),u.getFullName(),u.getEmail());
    }
    @GetMapping("/me") public Map<String,String> me(org.springframework.security.core.Authentication a) { return Map.of("email",a.getName()); }
}
