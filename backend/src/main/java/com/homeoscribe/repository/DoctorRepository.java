package com.homeoscribe.repository;

import com.homeoscribe.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {
    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByPhone(String phone);
    Optional<Doctor> findByDoctorId(String doctorId);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByLicenseNumber(String licenseNumber);

    /**
     * Find doctors whose subscription has expired and who are still marked active.
     * Excludes super admins (role == 'Super Admin').
     * Used by the nightly cleanup scheduler to purge patient data automatically.
     */
    List<Doctor> findBySubscriptionExpiryBeforeAndIsActiveTrueAndRoleNot(LocalDateTime now, String role);
}
