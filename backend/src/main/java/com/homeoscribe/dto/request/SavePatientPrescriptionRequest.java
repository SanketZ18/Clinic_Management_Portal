package com.homeoscribe.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for saving (creating or updating) a patient's prescription.
 * If the patient already exists (matched by name + phone), a new PrescriptionEntry
 * is appended — existing data is never overwritten.
 */
@Data
public class SavePatientPrescriptionRequest {

    // ── Patient static / demographic fields ──────────────────────────────────
    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Age is required")
    private String age;

    private String gender;
    private String bloodGroup;

    @NotBlank(message = "Mobile number is required")
    private String phone;

    private String email;
    private String address;
    private String referredBy;

    // ── Visit / prescription fields ───────────────────────────────────────────
    private String visitType;          // New | Follow-up | Emergency
    private String chiefComplaint;
    private String diagnosis;
    private String presentHistory;
    private String pastHistory;
    private String familyHistory;

    // Generals
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

    @NotEmpty(message = "At least one remedy is required")
    @Valid
    private List<RemedyItem> remedies;

    private String followUpDays;
    private String nextVisitDate;
    private String doctorNotes;
}
