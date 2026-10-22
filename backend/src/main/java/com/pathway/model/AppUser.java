package com.pathway.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="app_users")
public class AppUser {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true, length=180) private String email;
    @Column(nullable=false) private String passwordHash;
    @Column(nullable=false, length=100) private String fullName;
    @Column(nullable=false) private Instant createdAt = Instant.now();
    protected AppUser() {}
    public AppUser(String fullName, String email, String passwordHash) { this.fullName=fullName; this.email=email.toLowerCase(); this.passwordHash=passwordHash; }
    public Long getId(){return id;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;}
    public String getFullName(){return fullName;} public Instant getCreatedAt(){return createdAt;}
}
