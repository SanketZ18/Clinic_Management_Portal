package com.homeoscribe.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homeoscribe.dto.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    // Key: "ip:type" -> Bucket4j Bucket
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        // Determine bucket type and key
        String bucketKey;
        Bucket bucket;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            // Strict: 5 requests per minute for login/register
            bucketKey = clientIp + ":auth";
            bucket = buckets.computeIfAbsent(bucketKey, k -> buildAuthBucket());
        } else if (path.startsWith("/api/search")) {
            // Moderate: 20 requests per minute for AI/search endpoints
            bucketKey = clientIp + ":search";
            bucket = buckets.computeIfAbsent(bucketKey, k -> buildSearchBucket());
        } else {
            // General: 60 requests per minute for everything else
            bucketKey = clientIp + ":general";
            bucket = buckets.computeIfAbsent(bucketKey, k -> buildGeneralBucket());
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            long waitSeconds = bucket.getAvailableTokens() >= 0 ? 0 : 60;
            log.warn("Rate limit exceeded for IP: {} on URI: {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.addHeader("Retry-After", String.valueOf(waitSeconds));
            ApiResponse<Void> apiResponse = ApiResponse.error(
                    "Too many requests. Please slow down and try again in a moment."
            );
            new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
        }
    }

    // 5 requests per minute, with burst up to 5
    private Bucket buildAuthBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    // 20 requests per minute, with burst up to 20
    private Bucket buildSearchBucket() {
        Bandwidth limit = Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    // 60 requests per minute, refilled at 2 tokens/sec for smooth flow
    private Bucket buildGeneralBucket() {
        Bandwidth limit = Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
