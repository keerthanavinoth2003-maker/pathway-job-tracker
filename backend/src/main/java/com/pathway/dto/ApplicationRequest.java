package com.pathway.dto;
import com.pathway.model.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
public record ApplicationRequest(@NotBlank @Size(max=160) String company, @NotBlank @Size(max=160) String jobTitle,
 String jobUrl, String location, String workMode, ApplicationStatus status, LocalDate appliedDate, LocalDate followUpDate, @Size(max=2000) String notes) {}
