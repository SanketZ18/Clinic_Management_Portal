package com.homeoscribe.controller;

import com.homeoscribe.dto.request.PrescriptionRequest;
import com.homeoscribe.dto.response.ApiResponse;
import com.homeoscribe.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping("/send-email")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendEmail(
            @Valid @RequestBody PrescriptionRequest request) {
        
        String jobId = UUID.randomUUID().toString();
        prescriptionService.sendPrescriptionEmailAsync(jobId, request);

        return ResponseEntity.ok(ApiResponse.success(
                "Prescription processing started. Email will be sent in background.",
                Map.of("jobId", jobId, "status", "PROCESSING")
        ));
    }

    @GetMapping("/status/{jobId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getStatus(@PathVariable String jobId) {
        String status = prescriptionService.getJobStatus(jobId);
        return ResponseEntity.ok(ApiResponse.success(
                "Job status retrieved.",
                Map.of("jobId", jobId, "status", status)
        ));
    }
}
