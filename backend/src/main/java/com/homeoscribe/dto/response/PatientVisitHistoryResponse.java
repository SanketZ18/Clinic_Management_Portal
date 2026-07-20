package com.homeoscribe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response for the patient visit history endpoint.
 * Sorted by visitDate ascending (oldest first) so the PDF renders chronologically.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientVisitHistoryResponse {

    private String patientId;
    private String patientName;
    private String age;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String email;
    private String address;

    private int totalVisits;

    /** All prescriptions sorted oldest → newest */
    private List<PatientResponse.PrescriptionEntryResponse> prescriptions;

    private LocalDateTime firstVisit;
    private LocalDateTime lastVisit;
}
