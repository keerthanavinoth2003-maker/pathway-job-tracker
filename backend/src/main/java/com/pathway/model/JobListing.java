package com.pathway.model;

import jakarta.persistence.*;

@Entity @Table(name="job_listings")
public class JobListing {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String company;
    private String location;
    private String workMode;
    private String employmentType;
    private String experienceLevel;
    private String salaryRange;
    @Column(length=4000) private String description;
    private String applyUrl;
    public JobListing() {}
    public JobListing(String title,String company,String location,String workMode,String employmentType,String experienceLevel,String salaryRange,String description,String applyUrl) {
        this.title=title;this.company=company;this.location=location;this.workMode=workMode;this.employmentType=employmentType;this.experienceLevel=experienceLevel;this.salaryRange=salaryRange;this.description=description;this.applyUrl=applyUrl;
    }
    public Long getId(){return id;} public String getTitle(){return title;} public String getCompany(){return company;}
    public String getLocation(){return location;} public String getWorkMode(){return workMode;} public String getEmploymentType(){return employmentType;}
    public String getExperienceLevel(){return experienceLevel;} public String getSalaryRange(){return salaryRange;}
    public String getDescription(){return description;} public String getApplyUrl(){return applyUrl;}
}
