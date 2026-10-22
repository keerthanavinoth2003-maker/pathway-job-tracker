package com.pathway.repo;
import com.pathway.model.JobApplication;
import com.pathway.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface JobApplicationRepository extends JpaRepository<JobApplication,Long> {
    List<JobApplication> findByUserEmailOrderByCreatedAtDesc(String email);
    Optional<JobApplication> findByIdAndUserEmail(Long id,String email);
    long countByUserEmail(String email);
    long countByUserEmailAndStatus(String email, ApplicationStatus status);
}
