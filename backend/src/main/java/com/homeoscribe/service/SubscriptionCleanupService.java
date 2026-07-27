package com.homeoscribe.service;

import com.homeoscribe.model.Doctor;
import com.homeoscribe.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * SubscriptionCleanupService — nightly scheduled task.
 *
 * Runs every day at midnight (00:00:00 server time).
 * Finds all non-super-admin doctors whose subscription has expired and:
 *   1. Deletes all patient records linked to each expired doctor.
 *   2. Clears the DoctorPatientMap for that doctor (clean slate for renewal).
 *   3. Marks the doctor as inactive and sets subscriptionPlan to "EXPIRED".
 *
 * This keeps MongoDB from accumulating stale patient data for accounts that
 * are no longer active, preventing database overload over time.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionCleanupService {

    private final DoctorRepository doctorRepository;
    private final PatientService patientService;

    /**
     * Scheduled cleanup job — fires every day at midnight (00:00:00 server time).
     * Cron format: second minute hour day-of-month month day-of-week
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanupExpiredDoctorData() {
        LocalDateTime now = LocalDateTime.now();
        log.info("[SubscriptionCleanup] Starting nightly cleanup at {}", now);

        // Find all active non-super-admin doctors whose subscription has expired
        List<Doctor> expiredDoctors = doctorRepository
                .findBySubscriptionExpiryBeforeAndIsActiveTrueAndRoleNot(now, "Super Admin");

        if (expiredDoctors.isEmpty()) {
            log.info("[SubscriptionCleanup] No expired subscriptions found. Nothing to clean up.");
            return;
        }

        log.info("[SubscriptionCleanup] Found {} expired doctor subscription(s). Starting data purge.",
                expiredDoctors.size());

        int totalPatientsDeleted = 0;

        for (Doctor doctor : expiredDoctors) {
            String doctorId = doctor.getDoctorId();
            String email = doctor.getEmail();

            try {
                // 1. Purge all patient records (documents + mapping) for this doctor
                int deletedCount = patientService.purgePatientDataForDoctor(doctorId);
                totalPatientsDeleted += deletedCount;

                // 2. Mark doctor as inactive, set plan to EXPIRED
                doctor.setActive(false);
                doctor.setSubscriptionPlan("EXPIRED");
                doctorRepository.save(doctor);

                log.info("[SubscriptionCleanup] Doctor '{}' ({}): {} patient record(s) purged. Account marked EXPIRED.",
                        email, doctorId, deletedCount);

            } catch (Exception e) {
                // Log error and continue with remaining doctors — don't abort entire cleanup run
                log.error("[SubscriptionCleanup] Error purging data for doctor '{}' ({}): {}",
                        email, doctorId, e.getMessage(), e);
            }
        }

        log.info("[SubscriptionCleanup] Cleanup complete. Total patient records purged across all expired doctors: {}",
                totalPatientsDeleted);
    }
}
