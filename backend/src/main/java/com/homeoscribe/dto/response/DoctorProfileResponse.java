package com.homeoscribe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileResponse {
    private String id;
    private String doctorId;
    private String fullName;
    private String qualification;
    private String clinicName;
    private String clinicAddress;
    private String phone;
    private String email;
    private String licenseNumber;
    private String signatureBase64;
    private String role;
    @JsonProperty("isActive")
    private boolean isActive;
    private String subscriptionPlan;
    private LocalDateTime subscriptionExpiry;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
