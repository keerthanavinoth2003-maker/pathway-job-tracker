package com.pathway.config;
import com.pathway.model.JobListing;
import com.pathway.repo.JobListingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;
@Configuration
public class SeedData {
    @Bean CommandLineRunner seedJobs(JobListingRepository repo) {
        return args -> {
            if(repo.count()>0) return;
            repo.saveAll(List.of(
                new JobListing("Junior Java Developer","Northstar Systems","Remote, US","Remote","Full-time","Entry level","$65k–$82k","Build REST APIs with Java and Spring Boot. Familiarity with SQL, Git and testing is helpful.","https://example.com/jobs"),
                new JobListing("Associate Backend Engineer","Brightpath Software","Austin, TX","Hybrid","Full-time","Entry level","$70k–$90k","Support backend services, write unit tests and collaborate with product engineers.","https://example.com/jobs"),
                new JobListing("Software Engineer I","Juniper Cloud","Remote, US","Remote","Full-time","Entry level","$75k–$95k","Contribute to Java services, API design, database queries and code reviews.","https://example.com/jobs"),
                new JobListing("Java / Spring Boot Intern","Cedar Labs","New York, NY","On-site","Internship","Internship","$28–$36/hr","Work with a mentor on REST endpoints, tests and relational data models.","https://example.com/jobs")
            ));
        };
    }
}
