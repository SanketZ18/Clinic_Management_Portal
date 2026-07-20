package com.homeoscribe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Full patient response including all prescriptions — used for auto-fill and history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {

    private String patientId;
    private String patientName;
    private String age;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String email;
    private String address;
    private String referredBy;
    private String createdByDoctorId;

    private List<PrescriptionEntryResponse> prescriptions;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Convenience: total number of visits */
    private int totalVisits;

    // ── Embedded prescription entry ──────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionEntryResponse {
        private LocalDateTime visitDate;
        private String visitType;
        private String chiefComplaint;
        private String diagnosis;
        private String presentHistory;
        private String pastHistory;
        private String familyHistory;
        private String appetite;
        private String thirst;
        private String thermal;
        private String sleep;
        private String stool;
        private String urine;
        private String perspiration;
        private String mentalGenerals;
        private String worse;
        private String better;
        private String characteristics;
        private String miasm;
        private List<String> rubrics;
        private List<RemedyEntryResponse> remedies;
        private String followUpDays;
        private String nextVisitDate;
        private String doctorNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RemedyEntryResponse {
        private String remedyName;
        private String potency;
        private String dose;
        private String frequency;
    }
}
