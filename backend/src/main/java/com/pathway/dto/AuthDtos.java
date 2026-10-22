package com.pathway.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public class AuthDtos {
    public record RegisterRequest(@NotBlank @Size(max=100) String fullName, @Email @NotBlank String email, @NotBlank @Size(min=8,max=72) String password) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record AuthResponse(String token, String fullName, String email) {}
}
