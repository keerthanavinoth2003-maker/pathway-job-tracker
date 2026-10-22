
package com.pathway.repo;

import com.pathway.model.TrackedApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackedApplicationRepository
        extends JpaRepository<TrackedApplication, Long> {
}
