
package com.pathway.security;

import com.pathway.repo.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository users;

    public JwtAuthFilter(JwtService jwtService, UserRepository users) {
        this.jwtService = jwtService;
        this.users = users;
    }

    // Skip JWT filtering for browser CORS preflight requests
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            try {
                String token = header.substring(7);
                String email = jwtService.extractEmail(token);

                if (SecurityContextHolder.getContext().getAuthentication() == null
                        && users.existsByEmail(email)) {

                    var principal = User.withUsername(email)
                            .password("")
                            .authorities("USER")
                            .build();

                    var authentication =
                            new UsernamePasswordAuthenticationToken(
                                    principal,
                                    null,
                                    principal.getAuthorities()
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}
