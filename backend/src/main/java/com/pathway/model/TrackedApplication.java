
package com.pathway.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tracked_applications")
public class TrackedApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;
    private String title;
    private String location;
    private String status;
    private LocalDate appliedDate;
    private LocalDate followUpDate;

    private LocalDate interviewDate;
    private String interviewStatus;

    private LocalDate assessmentDeadline;
    private String assessmentStatus;

    @Column(length = 2000)
    private String notes;

    public TrackedApplication() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public LocalDate getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDate interviewDate) {
        this.interviewDate = interviewDate;
    }

    public String getInterviewStatus() { return interviewStatus; }
    public void setInterviewStatus(String interviewStatus) {
        this.interviewStatus = interviewStatus;
    }

    public LocalDate getAssessmentDeadline() { return assessmentDeadline; }
    public void setAssessmentDeadline(LocalDate assessmentDeadline) {
        this.assessmentDeadline = assessmentDeadline;
    }

    public String getAssessmentStatus() { return assessmentStatus; }
    public void setAssessmentStatus(String assessmentStatus) {
        this.assessmentStatus = assessmentStatus;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
