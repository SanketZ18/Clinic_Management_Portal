package com.homeoscribe.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Qualification is required")
    @Size(max = 200)
    private String qualification;

    @NotBlank(message = "Clinic name is required")
    @Size(max = 150)
    private String clinicName;

    @NotBlank(message = "Clinic address is required")
    @Size(max = 500)
    private String clinicAddress;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$")
    private String phone;

    @NotBlank(message = "License number is required")
    @Size(max = 50)
    private String licenseNumber;

    // Optional base64 signature image
    private String signatureBase64;
}
