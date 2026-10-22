package com.pathway.controller;
import com.pathway.model.ApplicationStatus;
import com.pathway.repo.JobApplicationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final JobApplicationRepository apps;
    public DashboardController(JobApplicationRepository apps){this.apps=apps;}
    @GetMapping("/stats") public Map<String,Long> stats(Authentication a) {
        String email=a.getName();
        return Map.of("total",apps.countByUserEmail(email),"interviews",apps.countByUserEmailAndStatus(email,ApplicationStatus.INTERVIEW),
            "offers",apps.countByUserEmailAndStatus(email,ApplicationStatus.OFFER),"rejected",apps.countByUserEmailAndStatus(email,ApplicationStatus.REJECTED));
    }
}
