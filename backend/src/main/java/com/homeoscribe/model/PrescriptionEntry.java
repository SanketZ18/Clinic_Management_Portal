package com.homeoscribe.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Embedded (non-collection) document representing one prescription visit.
 * Stored as an element in Patient.prescriptions[].
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionEntry {

    /** ISO timestamp of the visit */
    private LocalDateTime visitDate;

    private String visitType;          // New | Follow-up | Emergency
    private String chiefComplaint;
    private String diagnosis;
    private String presentHistory;
    private String pastHistory;
    private String familyHistory;

    // Generals
    private String appetite;
    private String thirst;
    private String thermal;            // Ambithermal | Hot | Chilly
    private String sleep;
    private String stool;
    private String urine;
    private String perspiration;
    private String mentalGenerals;
    private String worse;
    private String better;
    private String characteristics;
    private String miasm;              // Psora | Sycosis | Syphilis | Tubercular

    private List<String> rubrics;

    /** One or more remedies prescribed at this visit */
    private List<RemedyEntry> remedies;

    private String followUpDays;
    private String nextVisitDate;
    private String doctorNotes;
}
