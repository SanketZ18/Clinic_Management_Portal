package com.homeoscribe.controller;

import com.homeoscribe.dto.request.PatientSearchRequest;
import com.homeoscribe.dto.request.SavePatientPrescriptionRequest;
import com.homeoscribe.dto.response.ApiResponse;
import com.homeoscribe.dto.response.PatientResponse;
import com.homeoscribe.dto.response.PatientVisitHistoryResponse;
import com.homeoscribe.exception.AuthException;
import com.homeoscribe.model.Doctor;
import com.homeoscribe.repository.DoctorRepository;
import com.homeoscribe.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
public class PatientController {

    private final PatientService patientService;
    private final DoctorRepository doctorRepository;

    // ── Search ────────────────────────────────────────────────────────────────

    /**
     * POST /api/patients/search
     * Search for an existing patient by name + phone within the authenticated doctor's scope.
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PatientResponse>> searchPatient(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PatientSearchRequest request) {

        String doctorId = resolveDoctorId(userDetails.getUsername());

        Optional<PatientResponse> result = patientService.searchPatient(
                doctorId, request.getPatientName(), request.getPhone());

        if (result.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Patient found", result.get()));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Patient not found", null));
        }
    }

    // ── Save Prescription ─────────────────────────────────────────────────────

    /**
     * POST /api/patients/save
     * Save a prescription. Creates new patient or appends to existing patient's prescriptions[].
     */
    @PostMapping("/save")
    public ResponseEntity<ApiResponse<PatientResponse>> savePatientPrescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SavePatientPrescriptionRequest request) {

        String doctorId = resolveDoctorId(userDetails.getUsername());
        PatientResponse saved = patientService.saveOrUpdatePatient(doctorId, request);
        log.info("Prescription saved for patient: {} by doctor: {}", request.getPatientName(), doctorId);
        return ResponseEntity.ok(ApiResponse.success("Prescription saved successfully", saved));
    }

    // ── Get All Patients ───────────────────────────────────────────────────────

    /**
     * GET /api/patients
     * Get all patients registered under the authenticated doctor.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getAllPatients(
            @AuthenticationPrincipal UserDetails userDetails) {

        String doctorId = resolveDoctorId(userDetails.getUsername());
        List<PatientResponse> patients = patientService.getPatientsForDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved", patients));
    }

    // ── Get by Date Range ─────────────────────────────────────────────────────

    /**
     * GET /api/patients/by-date-range?from=2026-07-01&to=2026-07-31
     * Returns patients who had at least one visit in the given date range.
     * Prescription entries returned are filtered to that range only.
     */
    @GetMapping("/by-date-range")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getByDateRange(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        String doctorId = resolveDoctorId(userDetails.getUsername());
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(LocalTime.MAX);

        List<PatientResponse> patients = patientService.getPatientsByDateRange(doctorId, fromDt, toDt);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved for date range", patients));
    }

    // ── Patient Visit History ─────────────────────────────────────────────────

    /**
     * GET /api/patients/history?patientName=John&phone=9876543210
     * Returns full visit history for a single patient (chronological).
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PatientVisitHistoryResponse>> getPatientHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String patientName,
            @RequestParam String phone) {

        String doctorId = resolveDoctorId(userDetails.getUsername());
        PatientVisitHistoryResponse history = patientService.getPatientHistory(doctorId, patientName, phone);
        return ResponseEntity.ok(ApiResponse.success("Patient history retrieved", history));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    /** Resolve the doctorId UUID from the JWT email principal */
    private String resolveDoctorId(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Authenticated doctor not found"));
        return doctor.getDoctorId();
    }
}
