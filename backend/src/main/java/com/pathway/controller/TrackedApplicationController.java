
package com.pathway.controller;

import com.pathway.model.TrackedApplication;
import com.pathway.repo.TrackedApplicationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracked-applications")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175",
        "http://localhost:5177"
})
public class TrackedApplicationController {

    private final TrackedApplicationRepository repository;

    public TrackedApplicationController(
            TrackedApplicationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TrackedApplication> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public TrackedApplication create(
            @RequestBody TrackedApplication application) {
        application.setId(null);
        return repository.save(application);
    }

    @PutMapping("/{id}")
    public TrackedApplication update(
            @PathVariable Long id,
            @RequestBody TrackedApplication application) {
        application.setId(id);
        return repository.save(application);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
