package com.homeoscribe.controller;

import com.homeoscribe.dto.request.SearchRequest;
import com.homeoscribe.dto.response.ApiResponse;
import com.homeoscribe.service.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final SearchService searchService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> search(
            @Valid @RequestBody SearchRequest request) throws Exception {

        // Runs on searchTaskExecutor — isolated from Tomcat/login threads
        CompletableFuture<String> future = searchService.buildSearchUrl(request);

        // Wait up to 10 seconds for the search URL (or external API response)
        String url = future.get(10, TimeUnit.SECONDS);

        return ResponseEntity.ok(ApiResponse.success(
                "Search URL generated",
                Map.of("url", url, "query", request.getQuery(), "engine", request.getEngine() != null ? request.getEngine() : "google")
        ));
    }
}
