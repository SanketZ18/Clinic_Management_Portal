package com.homeoscribe.repository;

import com.homeoscribe.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {

    /** Find a patient by exact name (case-insensitive via lowercase copy) + phone */
    Optional<Patient> findByPatientNameLowerAndPhone(String patientNameLower, String phone);

    /** Check if patient already exists */
    boolean existsByPatientNameLowerAndPhone(String patientNameLower, String phone);

    /** Fetch all patients whose UUIDs are in the provided list (for a doctor's scope) */
    List<Patient> findByPatientIdIn(List<String> patientIds);

    Optional<Patient> findByPatientId(String patientId);
}
