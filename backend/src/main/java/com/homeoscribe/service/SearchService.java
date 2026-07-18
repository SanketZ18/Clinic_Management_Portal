package com.homeoscribe.service;

import com.homeoscribe.dto.request.SearchRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class SearchService {

    /**
     * Runs on the dedicated "searchTaskExecutor" thread pool — completely isolated
     * from the core Tomcat web threads. A slow Google/ChatGPT API call will
     * never block a doctor login or prescription generation.
     */
    @Async("searchTaskExecutor")
    public CompletableFuture<String> buildSearchUrl(SearchRequest request) {
        log.info("Building search URL on search-async thread for query: {}", request.getQuery());

        String encodedQuery = java.net.URLEncoder.encode(request.getQuery(), java.nio.charset.StandardCharsets.UTF_8);
        String url;

        if ("chatgpt".equalsIgnoreCase(request.getEngine())) {
            url = "https://chatgpt.com/?q=" + encodedQuery;
        } else {
            // Default to Google
            url = "https://www.google.com/search?q=" + encodedQuery;
        }

        // In a real integration you would call the external API here:
        //   - Google Custom Search API
        //   - OpenAI API
        // Any latency here is isolated to searchTaskExecutor, never Tomcat threads.
        return CompletableFuture.completedFuture(url);
    }
}
