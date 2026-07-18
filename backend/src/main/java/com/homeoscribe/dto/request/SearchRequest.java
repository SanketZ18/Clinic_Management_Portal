package com.homeoscribe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SearchRequest {
    @NotBlank(message = "Query is required")
    @Size(min = 2, max = 500, message = "Query must be between 2 and 500 characters")
    private String query;

    private String engine; // "google" or "chatgpt" — frontend uses this for display only
}
