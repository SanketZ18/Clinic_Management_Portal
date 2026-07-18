package com.homeoscribe.service;

import com.homeoscribe.dto.request.PrescriptionRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class PrescriptionService {

    // In-memory store for async task statuses
    private final Map<String, String> jobStatuses = new ConcurrentHashMap<>();

    public String getJobStatus(String jobId) {
        return jobStatuses.getOrDefault(jobId, "NOT_FOUND");
    }

    @Async("prescriptionTaskExecutor")
    public void sendPrescriptionEmailAsync(String jobId, PrescriptionRequest request) {
        log.info("Starting async PDF generation and email for patient: {} [Job ID: {}]", request.getPatientName(), jobId);
        jobStatuses.put(jobId, "PROCESSING");

        try {
            // 1. Simulate PDF Generation
            log.info("Generating Prescription PDF in background (rx-async thread)...");
            Thread.sleep(2000); // simulate PDF creation delay

            // 2. Simulate SMTP Email Sending
            log.info("Sending Prescription email to patient: {}...", request.getEmail());
            Thread.sleep(1500); // simulate network latency for SMTP server

            jobStatuses.put(jobId, "COMPLETED");
            log.info("Async prescription processing completed successfully for Job ID: {}", jobId);

        } catch (InterruptedException e) {
            log.error("Async job interrupted for Job ID: {}", jobId, e);
            jobStatuses.put(jobId, "FAILED");
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Error processing async prescription for Job ID: {}", jobId, e);
            jobStatuses.put(jobId, "FAILED");
        }
    }
}
