package com.homeoscribe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB collection: doctor_patient_map
 *
 * Exactly ONE document per doctor.
 * When a new patient is added, their patientId is pushed into patientIds[].
 * Total documents in this collection == total doctors registered.
 */
@Document(collection = "doctor_patient_map")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPatientMap {

    @Id
    private String id;

    @Indexed(unique = true)
    private String doctorId;           // UUID of the doctor

    @Builder.Default
    private List<String> patientIds = new ArrayList<>();  // list of patient UUIDs
}
