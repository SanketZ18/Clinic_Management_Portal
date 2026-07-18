package com.homeoscribe.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RemedyItem {
    @NotBlank(message = "Remedy name is required")
    private String remedyName;
    private String potency;
    private String dose;
    private String frequency;
}
