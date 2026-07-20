package com.homeoscribe.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PatientSearchRequest {

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Mobile number is required")
    private String phone;
}
