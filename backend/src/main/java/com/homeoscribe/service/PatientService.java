package com.homeoscribe.service;

import com.homeoscribe.dto.request.SavePatientPrescriptionRequest;
import com.homeoscribe.dto.response.PatientResponse;
import com.homeoscribe.dto.response.PatientVisitHistoryResponse;
import com.homeoscribe.exception.ValidationException;
import com.homeoscribe.model.*;
import com.homeoscribe.repository.DoctorPatientMapRepository;
import com.homeoscribe.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorPatientMapRepository doctorPatientMapRepository;

    // ── Search ────────────────────────────────────────────────────────────────

    /**
     * Search for an existing patient within this doctor's scope.
     * Both name AND phone must match exactly (case-insensitive for name).
     */
    public Optional<PatientResponse> searchPatient(String doctorId, String patientName, String phone) {
        String nameLower = patientName.trim().toLowerCase();
        String cleanPhone = phone.trim();

        Optional<Patient> patientOpt = patientRepository.findByPatientNameLowerAndPhone(nameLower, cleanPhone);

        if (patientOpt.isEmpty()) {
            return Optional.empty();
        }

        Patient patient = patientOpt.get();

        // Scope check: patient must belong to this doctor
        Optional<DoctorPatientMap> mapOpt = doctorPatientMapRepository.findByDoctorId(doctorId);
        if (mapOpt.isEmpty() || !mapOpt.get().getPatientIds().contains(patient.getPatientId())) {
            log.info("Patient found but not scoped to doctor {}: patient {}", doctorId, patient.getPatientId());
            return Optional.empty();
        }

        return Optional.of(mapToPatientResponse(patient));
    }

    // ── Save / Upsert ─────────────────────────────────────────────────────────

    /**
     * Save a prescription for a patient.
     * - If the patient doesn't exist → create a new Patient document.
     * - If the patient already exists → append a new PrescriptionEntry to prescriptions[].
     * - Always upsert the DoctorPatientMap to register this patient under the doctor.
     */
    public PatientResponse saveOrUpdatePatient(String doctorId, SavePatientPrescriptionRequest request) {
        String nameLower = request.getPatientName().trim().toLowerCase();
        String cleanPhone = request.getPhone().trim();

        Optional<Patient> existingOpt = patientRepository.findByPatientNameLowerAndPhone(nameLower, cleanPhone);

        Patient patient;
        if (existingOpt.isPresent()) {
            patient = existingOpt.get();
            log.info("Existing patient found: {}. Appending new prescription.", patient.getPatientId());
            
            // Update demographics with latest info
            patient.setAge(request.getAge());
            patient.setGender(request.getGender());
            patient.setBloodGroup(request.getBloodGroup());
            patient.setEmail(request.getEmail());
            patient.setAddress(request.getAddress());
            patient.setReferredBy(request.getReferredBy());
            
            // Append new prescription — never overwrite old data
            patient.getPrescriptions().add(buildPrescriptionEntry(request));
        } else {
            log.info("New patient: {}. Creating patient record.", request.getPatientName());
            patient = Patient.builder()
                    .patientId(UUID.randomUUID().toString())
                    .patientName(request.getPatientName().trim())
                    .patientNameLower(nameLower)
                    .age(request.getAge())
                    .gender(request.getGender())
                    .bloodGroup(request.getBloodGroup())
                    .phone(cleanPhone)
                    .email(request.getEmail())
                    .address(request.getAddress())
                    .referredBy(request.getReferredBy())
                    .createdByDoctorId(doctorId)
                    .prescriptions(new ArrayList<>(List.of(buildPrescriptionEntry(request))))
                    .build();
        }

        patient = patientRepository.save(patient);

        // Upsert DoctorPatientMap — ensure one record per doctor, patientId added to array
        upsertDoctorPatientMap(doctorId, patient.getPatientId());

        return mapToPatientResponse(patient);
    }

    // ── Get All Patients for Doctor ────────────────────────────────────────────

    public List<PatientResponse> getPatientsForDoctor(String doctorId) {
        Optional<DoctorPatientMap> mapOpt = doctorPatientMapRepository.findByDoctorId(doctorId);
        if (mapOpt.isEmpty() || mapOpt.get().getPatientIds().isEmpty()) {
            return Collections.emptyList();
        }

        return patientRepository.findByPatientIdIn(mapOpt.get().getPatientIds())
                .stream()
                .map(this::mapToPatientResponse)
                .collect(Collectors.toList());
    }

    // ── Get Patients Filtered by Date Range ────────────────────────────────────

    /**
     * Returns patients who had at least one visit in the given date range.
     * The response only includes prescription entries within the range.
     */
    public List<PatientResponse> getPatientsByDateRange(String doctorId, LocalDateTime from, LocalDateTime to) {
        Optional<DoctorPatientMap> mapOpt = doctorPatientMapRepository.findByDoctorId(doctorId);
        if (mapOpt.isEmpty() || mapOpt.get().getPatientIds().isEmpty()) {
            return Collections.emptyList();
        }

        List<Patient> patients = patientRepository.findByPatientIdIn(mapOpt.get().getPatientIds());

        return patients.stream()
                .map(p -> filterPrescriptionsByDateRange(p, from, to))
                .filter(r -> r.getTotalVisits() > 0)
                .collect(Collectors.toList());
    }

    // ── Patient Visit History ──────────────────────────────────────────────────

    /**
     * Returns full visit history for a patient (sorted oldest → newest).
     * Validates the patient belongs to this doctor.
     */
    public PatientVisitHistoryResponse getPatientHistory(String doctorId, String patientName, String phone) {
        String nameLower = patientName.trim().toLowerCase();

        Optional<Patient> patientOpt = patientRepository.findByPatientNameLowerAndPhone(nameLower, phone.trim());
        if (patientOpt.isEmpty()) {
            throw new ValidationException("No patient found with the given name and mobile number");
        }

        Patient patient = patientOpt.get();

        // Scope check
        Optional<DoctorPatientMap> mapOpt = doctorPatientMapRepository.findByDoctorId(doctorId);
        if (mapOpt.isEmpty() || !mapOpt.get().getPatientIds().contains(patient.getPatientId())) {
            throw new ValidationException("Patient not found in your records");
        }

        List<PatientResponse.PrescriptionEntryResponse> sorted = patient.getPrescriptions().stream()
                .sorted(Comparator.comparing(PrescriptionEntry::getVisitDate))
                .map(this::mapToPrescriptionEntryResponse)
                .collect(Collectors.toList());

        LocalDateTime firstVisit = sorted.isEmpty() ? null : patient.getPrescriptions().stream()
                .map(PrescriptionEntry::getVisitDate).min(Comparator.naturalOrder()).orElse(null);
        LocalDateTime lastVisit = sorted.isEmpty() ? null : patient.getPrescriptions().stream()
                .map(PrescriptionEntry::getVisitDate).max(Comparator.naturalOrder()).orElse(null);

        return PatientVisitHistoryResponse.builder()
                .patientId(patient.getPatientId())
                .patientName(patient.getPatientName())
                .age(patient.getAge())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .totalVisits(sorted.size())
                .prescriptions(sorted)
                .firstVisit(firstVisit)
                .lastVisit(lastVisit)
                .build();
    }

    // ── Delete Patient ─────────────────────────────────────────────────────────

    /**
     * Delete an individual patient by patientId.
     * Verifies the patient belongs to the authenticated doctor.
     */
    public void deletePatient(String doctorId, String patientId) {
        Optional<Patient> patientOpt = patientRepository.findByPatientId(patientId);
        if (patientOpt.isEmpty()) {
            throw new ValidationException("Patient not found");
        }

        // Scope check
        Optional<DoctorPatientMap> mapOpt = doctorPatientMapRepository.findByDoctorId(doctorId);
        if (mapOpt.isEmpty() || !mapOpt.get().getPatientIds().contains(patientId)) {
            throw new ValidationException("Patient not found in your records");
        }

        // Remove from doctor map
        DoctorPatientMap map = mapOpt.get();
        map.getPatientIds().remove(patientId);
        doctorPatientMapRepository.save(map);

        // Remove patient document
        patientRepository.delete(patientOpt.get());
        log.info("Patient {} deleted by doctor {}", patientId, doctorId);
    }

    /**
     * Bulk delete patients by a list of patientIds.
     * Only deletes patients scoped to the authenticated doctor.
     */
    public int deletePatientsBulk(String doctorId, List<String> patientIds) {
        if (patientIds == null || patientIds.isEmpty()) {
            return 0;
        }

        Optional<DoctorPatientMap> mapOpt = doctorPatientMapRepository.findByDoctorId(doctorId);
        if (mapOpt.isEmpty() || mapOpt.get().getPatientIds().isEmpty()) {
            return 0;
        }

        DoctorPatientMap map = mapOpt.get();
        List<String> scopedIdsToDelete = patientIds.stream()
                .filter(map.getPatientIds()::contains)
                .distinct()
                .collect(Collectors.toList());

        if (scopedIdsToDelete.isEmpty()) {
            return 0;
        }

        List<Patient> patientsToDelete = patientRepository.findByPatientIdIn(scopedIdsToDelete);
        patientRepository.deleteAll(patientsToDelete);

        map.getPatientIds().removeAll(scopedIdsToDelete);
        doctorPatientMapRepository.save(map);

        log.info("Bulk deleted {} patients for doctor {}", scopedIdsToDelete.size(), doctorId);
        return scopedIdsToDelete.size();
    }

    // ── Private Helpers ────────────────────────────────────────────────────────

    private PrescriptionEntry buildPrescriptionEntry(SavePatientPrescriptionRequest request) {
        List<RemedyEntry> remedyEntries = request.getRemedies() == null ? List.of() :
                request.getRemedies().stream()
                        .map(r -> RemedyEntry.builder()
                                .remedyName(r.getRemedyName())
                                .potency(r.getPotency())
                                .dose(r.getDose())
                                .frequency(r.getFrequency())
                                .build())
                        .collect(Collectors.toList());

        return PrescriptionEntry.builder()
                .visitDate(LocalDateTime.now())
                .visitType(request.getVisitType())
                .chiefComplaint(request.getChiefComplaint())
                .diagnosis(request.getDiagnosis())
                .presentHistory(request.getPresentHistory())
                .pastHistory(request.getPastHistory())
                .familyHistory(request.getFamilyHistory())
                .appetite(request.getAppetite())
                .thirst(request.getThirst())
                .thermal(request.getThermal())
                .sleep(request.getSleep())
                .stool(request.getStool())
                .urine(request.getUrine())
                .perspiration(request.getPerspiration())
                .mentalGenerals(request.getMentalGenerals())
                .worse(request.getWorse())
                .better(request.getBetter())
                .characteristics(request.getCharacteristics())
                .miasm(request.getMiasm())
                .rubrics(request.getRubrics())
                .remedies(remedyEntries)
                .followUpDays(request.getFollowUpDays())
                .nextVisitDate(request.getNextVisitDate())
                .doctorNotes(request.getDoctorNotes())
                .build();
    }

    private void upsertDoctorPatientMap(String doctorId, String patientId) {
        Optional<DoctorPatientMap> mapOpt = doctorPatientMapRepository.findByDoctorId(doctorId);
        DoctorPatientMap map;
        if (mapOpt.isPresent()) {
            map = mapOpt.get();
            if (!map.getPatientIds().contains(patientId)) {
                map.getPatientIds().add(patientId);
                doctorPatientMapRepository.save(map);
            }
        } else {
            map = DoctorPatientMap.builder()
                    .doctorId(doctorId)
                    .patientIds(new ArrayList<>(List.of(patientId)))
                    .build();
            doctorPatientMapRepository.save(map);
        }
    }

    private PatientResponse filterPrescriptionsByDateRange(Patient patient, LocalDateTime from, LocalDateTime to) {
        List<PatientResponse.PrescriptionEntryResponse> filtered = patient.getPrescriptions().stream()
                .filter(p -> p.getVisitDate() != null
                        && !p.getVisitDate().isBefore(from)
                        && !p.getVisitDate().isAfter(to))
                .map(this::mapToPrescriptionEntryResponse)
                .sorted(Comparator.comparing(PatientResponse.PrescriptionEntryResponse::getVisitDate))
                .collect(Collectors.toList());

        PatientResponse response = mapToPatientResponse(patient);
        response.setPrescriptions(filtered);
        response.setTotalVisits(filtered.size());
        return response;
    }

    public PatientResponse mapToPatientResponse(Patient patient) {
        List<PatientResponse.PrescriptionEntryResponse> entries = patient.getPrescriptions() == null
                ? Collections.emptyList()
                : patient.getPrescriptions().stream()
                .map(this::mapToPrescriptionEntryResponse)
                .collect(Collectors.toList());

        return PatientResponse.builder()
                .patientId(patient.getPatientId())
                .patientName(patient.getPatientName())
                .age(patient.getAge())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .referredBy(patient.getReferredBy())
                .createdByDoctorId(patient.getCreatedByDoctorId())
                .prescriptions(entries)
                .totalVisits(entries.size())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .build();
    }

    private PatientResponse.PrescriptionEntryResponse mapToPrescriptionEntryResponse(PrescriptionEntry entry) {
        List<PatientResponse.RemedyEntryResponse> remedyResponses = entry.getRemedies() == null ? List.of() :
                entry.getRemedies().stream()
                        .map(r -> PatientResponse.RemedyEntryResponse.builder()
                                .remedyName(r.getRemedyName())
                                .potency(r.getPotency())
                                .dose(r.getDose())
                                .frequency(r.getFrequency())
                                .build())
                        .collect(Collectors.toList());

        return PatientResponse.PrescriptionEntryResponse.builder()
                .visitDate(entry.getVisitDate())
                .visitType(entry.getVisitType())
                .chiefComplaint(entry.getChiefComplaint())
                .diagnosis(entry.getDiagnosis())
                .presentHistory(entry.getPresentHistory())
                .pastHistory(entry.getPastHistory())
                .familyHistory(entry.getFamilyHistory())
                .appetite(entry.getAppetite())
                .thirst(entry.getThirst())
                .thermal(entry.getThermal())
                .sleep(entry.getSleep())
                .stool(entry.getStool())
                .urine(entry.getUrine())
                .perspiration(entry.getPerspiration())
                .mentalGenerals(entry.getMentalGenerals())
                .worse(entry.getWorse())
                .better(entry.getBetter())
                .characteristics(entry.getCharacteristics())
                .miasm(entry.getMiasm())
                .rubrics(entry.getRubrics())
                .remedies(remedyResponses)
                .followUpDays(entry.getFollowUpDays())
                .nextVisitDate(entry.getNextVisitDate())
                .doctorNotes(entry.getDoctorNotes())
                .build();
    }
}
