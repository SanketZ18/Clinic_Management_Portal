package com.homeoscribe.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB collection: patients
 * One document per unique patient (uniqueness: patientName (case-insensitive) + phone).
 * All prescription visits are stored as an append-only array: prescriptions[].
 */
@Document(collection = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "name_phone_idx", def = "{'patientNameLower': 1, 'phone': 1}", unique = true)
public class Patient {

    @Id
    private String id;

    @Indexed(unique = true)
    private String patientId;          // UUID assigned on first creation

    // ── Static / Demographic Fields ──────────────────────────────────────────
    private String patientName;
    private String patientNameLower;   // lowercase copy used for case-insensitive unique index
    private String age;
    private String gender;
    private String bloodGroup;

    @Indexed
    private String phone;

    private String email;
    private String address;
    private String referredBy;

    // ── Ownership ─────────────────────────────────────────────────────────────
    /** doctorId (UUID) of the doctor who first registered this patient */
    private String createdByDoctorId;

    // ── Prescription History (append-only) ────────────────────────────────────
    @Builder.Default
    private List<PrescriptionEntry> prescriptions = new ArrayList<>();

    // ── Audit ─────────────────────────────────────────────────────────────────
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
