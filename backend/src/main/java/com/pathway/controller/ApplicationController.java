package com.pathway.controller;
import com.pathway.dto.ApplicationRequest;
import com.pathway.model.*;
import com.pathway.repo.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/api/applications")
public class ApplicationController {
    private final JobApplicationRepository applications; private final UserRepository users;
    public ApplicationController(JobApplicationRepository applications,UserRepository users){this.applications=applications;this.users=users;}
    @GetMapping public List<JobApplication> list(Authentication auth){return applications.findByUserEmailOrderByCreatedAtDesc(auth.getName());}
    @PostMapping public JobApplication create(@Valid @RequestBody ApplicationRequest r,Authentication auth) {
        AppUser user=users.findByEmail(auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return applications.save(new JobApplication(user,r.company().trim(),r.jobTitle().trim(),r.jobUrl(),r.location(),r.workMode(),r.status(),r.appliedDate(),r.followUpDate(),r.notes()));
    }
    @PutMapping("/{id}") public JobApplication update(@PathVariable Long id,@Valid @RequestBody ApplicationRequest r,Authentication auth) {
        JobApplication a=applications.findByIdAndUserEmail(id,auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Application not found."));
        a.update(r.company().trim(),r.jobTitle().trim(),r.jobUrl(),r.location(),r.workMode(),r.status()==null?ApplicationStatus.APPLIED:r.status(),r.appliedDate()==null?LocalDate.now():r.appliedDate(),r.followUpDate(),r.notes());
        return applications.save(a);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,Authentication auth) {
        JobApplication a=applications.findByIdAndUserEmail(id,auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Application not found."));
        applications.delete(a);
    }
}
