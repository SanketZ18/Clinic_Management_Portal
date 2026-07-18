package com.homeoscribe.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DoctorAccessRequest {

    @NotNull(message = "Access status is required")
    private Boolean isActive;
}
