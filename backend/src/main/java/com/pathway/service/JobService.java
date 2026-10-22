
package com.pathway.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class JobService {

    private final RestClient restClient = RestClient.create();

    public JsonNode searchRemoteJobs(
            String q,
            String country,
            boolean worldwide,
            int page) {

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

        URI uri = builder.build().encode().toUri();

        return restClient.get()
                .uri(uri)
                .retrieve()
                .body(JsonNode.class);
    }
}
