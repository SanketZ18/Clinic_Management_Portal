package com.homeoscribe.model;

import lombok.*;

/**
 * Embedded document — one remedy prescribed in a visit.
 * Used inside PrescriptionEntry.remedies[].
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemedyEntry {
    private String remedyName;
    private String potency;
    private String dose;
    private String frequency;
}
