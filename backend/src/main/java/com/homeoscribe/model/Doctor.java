package com.homeoscribe.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    private String id;

    @Indexed(unique = true)
    private String doctorId;         // UUID for prescription headers

    private String fullName;
    private String qualification;
    private String clinicName;
    private String clinicAddress;

    @Indexed(unique = true)
    private String phone;

    @Indexed(unique = true)
    private String email;

    private String licenseNumber;
    private String passwordHash;
    private String signatureBase64;  // Base64 encoded signature image
    @Builder.Default
    private String role = "Doctor";

    @Builder.Default
    private boolean isActive = false;

    @Builder.Default
    private String subscriptionPlan = "FREE";  // FREE | PAID
    private LocalDateTime subscriptionExpiry;   // null for FREE

    private LocalDateTime lastLoginAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
