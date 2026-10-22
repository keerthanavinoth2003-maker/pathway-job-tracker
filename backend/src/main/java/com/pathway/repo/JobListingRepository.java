package com.pathway.repo;
import com.pathway.model.JobListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface JobListingRepository extends JpaRepository<JobListing,Long> {
    @Query("select j from JobListing j where (:q is null or lower(j.title) like lower(concat('%',:q,'%')) or lower(j.company) like lower(concat('%',:q,'%')) or lower(coalesce(j.description,'')) like lower(concat('%',:q,'%'))) and (:mode is null or lower(j.workMode)=lower(:mode)) and (:location is null or lower(coalesce(j.location,'')) like lower(concat('%',:location,'%')))")
    List<JobListing> search(@Param("q") String q,@Param("mode") String mode,@Param("location") String location);
}
