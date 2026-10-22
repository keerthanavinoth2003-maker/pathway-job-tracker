package com.pathway.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity @Table(name="job_applications")
public class JobApplication {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="user_id") private AppUser user;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="job_listing_id") private JobListing jobListing;
    @Column(nullable=false) private String company;
    @Column(nullable=false) private String jobTitle;
    private String jobUrl;
    private String location;
    private String workMode;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ApplicationStatus status = ApplicationStatus.APPLIED;
    private LocalDate appliedDate = LocalDate.now();
    private LocalDate followUpDate;
    @Column(length=2000) private String notes;
    @Column(nullable=false) private Instant createdAt = Instant.now();
    public JobApplication() {}
    public JobApplication(AppUser user,String company,String jobTitle,String jobUrl,String location,String workMode,ApplicationStatus status,LocalDate appliedDate,LocalDate followUpDate,String notes) {
        this.user=user;this.company=company;this.jobTitle=jobTitle;this.jobUrl=jobUrl;this.location=location;this.workMode=workMode;this.status=status==null?ApplicationStatus.APPLIED:status;this.appliedDate=appliedDate==null?LocalDate.now():appliedDate;this.followUpDate=followUpDate;this.notes=notes;
    }
    public Long getId(){return id;} public AppUser getUser(){return user;} public JobListing getJobListing(){return jobListing;}
    public String getCompany(){return company;} public String getJobTitle(){return jobTitle;} public String getJobUrl(){return jobUrl;}
    public String getLocation(){return location;} public String getWorkMode(){return workMode;} public ApplicationStatus getStatus(){return status;}
    public LocalDate getAppliedDate(){return appliedDate;} public LocalDate getFollowUpDate(){return followUpDate;} public String getNotes(){return notes;} public Instant getCreatedAt(){return createdAt;}
    public void update(String company,String jobTitle,String jobUrl,String location,String workMode,ApplicationStatus status,LocalDate appliedDate,LocalDate followUpDate,String notes) {
        this.company=company;this.jobTitle=jobTitle;this.jobUrl=jobUrl;this.location=location;this.workMode=workMode;this.status=status;this.appliedDate=appliedDate;this.followUpDate=followUpDate;this.notes=notes;
    }
}
