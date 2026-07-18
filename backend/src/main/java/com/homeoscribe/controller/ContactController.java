package com.homeoscribe.controller;

import com.homeoscribe.dto.request.ContactRequest;
import com.homeoscribe.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@Slf4j
public class ContactController {

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> sendMessage(@Valid @RequestBody ContactRequest request) {
        // Log the contact message (SMTP can be configured via env vars in production)
        log.info("=== CONTACT FORM SUBMISSION ===");
        log.info("From: {} <{}>", request.getName(), request.getEmail());
        log.info("Phone: {}", request.getPhone());
        log.info("Subject: {}", request.getSubject());
        log.info("Message: {}", request.getMessage());
        log.info("================================");

        // In production: send email via JavaMailSender
        // For now, just log and confirm
        return ResponseEntity.ok(ApiResponse.success(
            "Your message has been received. We will get back to you within 24 hours."
        ));
    }
}
