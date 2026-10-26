
package com.pathway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Locale;

@Service
public class JobService {

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    public JsonNode searchRemoteJobs(
            String q,
            String country,
            boolean worldwide,
            int page) {

        ArrayNode combined = mapper.createArrayNode();

        // Source 1: Himalayas - remote jobs
        try {
            UriComponentsBuilder builder =
                    UriComponentsBuilder
                            .fromUriString(
                                    "https://himalayas.app/jobs/api/search")
                            .queryParam("sort", "recent")
                            .queryParam("page", Math.max(page, 1));

            if (q != null && !q.isBlank()) {
                builder.queryParam("q", q.trim());
            }

            if (country != null && !country.isBlank()) {
                builder.queryParam("country", country.trim());
            }

            if (worldwide) {
                builder.queryParam("worldwide", true);
            }

            JsonNode response = restClient.get()
                    .uri(builder.build().encode().toUri())
                    .retrieve()
                    .body(JsonNode.class);

            JsonNode jobs = response == null
                    ? null : response.path("jobs");

            if (jobs != null && jobs.isArray()) {
                for (JsonNode job : jobs) {
                    ObjectNode item = mapper.createObjectNode();

                    item.put("id", text(job, "guid"));
                    item.put("guid", text(job, "guid"));
                    item.put("title", text(job, "title"));
                    item.put("companyName", text(job, "companyName"));
                    item.put("location", location(job));
                    item.put("employmentType",
                            text(job, "employmentType"));
                    item.put("excerpt", text(job, "excerpt"));
                    item.put("description", text(job, "description"));
                    item.put("applicationLink",
                            text(job, "applicationLink"));
                    item.put("url", text(job, "applicationLink"));
                    item.put("source", "Himalayas");
                    item.put("workMode", "Remote");

                    copyIfPresent(job, item, "minSalary");
                    copyIfPresent(job, item, "maxSalary");
                    copyIfPresent(job, item, "currency");
                    copyIfPresent(job, item, "pubDate");

                    combined.add(item);
                }
            }
        } catch (Exception ex) {
            // Keep other job sources available if this source fails.
        }

        // Source 2: Arbeitnow - remote and location-based listings
        try {
            String url =
                    "https://www.arbeitnow.com/api/job-board-api?page="
                            + Math.max(page, 1);

            JsonNode response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(JsonNode.class);

            JsonNode jobs = response == null
                    ? null : response.path("data");

            if (jobs != null && jobs.isArray()) {
                for (JsonNode job : jobs) {
                    String title = text(job, "title");
                    String company = text(job, "company_name");
                    String description = text(job, "description");
                    String location = text(job, "location");
                    String jobUrl = text(job, "url");
                    String mode = detectMode(job, description);

                    if (q != null && !q.isBlank()) {
                        String searchable = (
                                title + " " + company + " "
                                + description + " " + location
                        ).toLowerCase(Locale.ROOT);

                        if (!searchable.contains(
                                q.trim().toLowerCase(Locale.ROOT))) {
                            continue;
                        }
                    }

                    if (country != null && !country.isBlank()
                            && !location.toLowerCase(Locale.ROOT)
                            .contains(country.trim()
                                    .toLowerCase(Locale.ROOT))) {
                        continue;
                    }

                    ObjectNode item = mapper.createObjectNode();

                    String id = text(job, "slug");
                    if (id.isBlank()) {
                        id = jobUrl;
                    }

                    item.put("id", "arbeitnow-" + id);
                    item.put("guid", "arbeitnow-" + id);
                    item.put("title", title);
                    item.put("companyName", company);
                    item.put("location", location);
                    item.put("employmentType", "Not specified");
                    item.put("excerpt", description);
                    item.put("description", description);
                    item.put("applicationLink", jobUrl);
                    item.put("url", jobUrl);
                    item.put("source", "Arbeitnow");
                    item.put("workMode", mode);

                    JsonNode remote = job.path("remote");
                    if (remote.isBoolean()) {
                        item.put("remote", remote.asBoolean());
                    }

                    combined.add(item);
                }
            }
        } catch (Exception ex) {
            // If Arbeitnow is unavailable, keep Himalayas results.
        }

        ObjectNode result = mapper.createObjectNode();
        result.set("jobs", combined);
        result.put("page", Math.max(page, 1));
        result.put("sources", "Himalayas, Arbeitnow");

        return result;
    }

    private String detectMode(JsonNode job, String description) {
        String text = (
                text(job, "title") + " "
                + text(job, "location") + " "
                + description + " "
                + job.path("tags").toString()
        ).toLowerCase(Locale.ROOT);

        if (text.contains("hybrid")) {
            return "Hybrid";
        }

        if (job.path("remote").asBoolean(false)) {
            return "Remote";
        }

        if (text.contains("on-site")
                || text.contains("onsite")
                || text.contains("on site")
                || text.contains("in-office")
                || text.contains("in office")
                || text.contains("office-based")
                || text.contains("office based")) {
            return "On-site";
        }

        return "Not specified";
    }

    private String location(JsonNode job) {
        JsonNode restrictions = job.path("locationRestrictions");

        if (restrictions.isArray()) {
            StringBuilder result = new StringBuilder();

            for (JsonNode item : restrictions) {
                if (!result.isEmpty()) {
                    result.append(", ");
                }
                result.append(item.asText());
            }

            if (!result.isEmpty()) {
                return result.toString();
            }
        }

        return "Worldwide";
    }

    private String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull()
                ? "" : value.asText("");
    }

    private void copyIfPresent(
            JsonNode source,
            ObjectNode target,
            String field) {

        JsonNode value = source.path(field);

        if (!value.isMissingNode() && !value.isNull()) {
            target.set(field, value.deepCopy());
        }
    }
}
