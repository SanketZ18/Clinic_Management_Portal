package com.homeoscribe.service;

import com.homeoscribe.dto.request.ChangePasswordRequest;
import com.homeoscribe.dto.response.DoctorProfileResponse;
import com.homeoscribe.dto.request.UpdateProfileRequest;
import com.homeoscribe.exception.AuthException;
import com.homeoscribe.exception.DuplicateResourceException;
import com.homeoscribe.exception.ValidationException;
import com.homeoscribe.model.Doctor;
import com.homeoscribe.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @Cacheable(value = "doctorProfiles", key = "#email.toLowerCase()")
    public DoctorProfileResponse getProfile(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Doctor not found"));
        return authService.mapToProfileResponse(doctor);
    }

    @CacheEvict(value = "doctorProfiles", key = "#email.toLowerCase()")
    public DoctorProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Doctor not found"));

        // Check phone uniqueness if changed
        if (doctor.getPhone() == null || !doctor.getPhone().equals(request.getPhone())) {
            if (doctorRepository.existsByPhone(request.getPhone())) {
                throw new DuplicateResourceException("Phone number already in use");
            }
        }

        // Check license number uniqueness if changed
        if (doctor.getLicenseNumber() == null || !doctor.getLicenseNumber().equals(request.getLicenseNumber())) {
            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new DuplicateResourceException("License number already in use");
            }
        }

        doctor.setFullName(request.getFullName());
        doctor.setQualification(request.getQualification());
        doctor.setClinicName(request.getClinicName());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setPhone(request.getPhone());
        doctor.setLicenseNumber(request.getLicenseNumber());

        if (request.getSignatureBase64() != null && !request.getSignatureBase64().isBlank()) {
            doctor.setSignatureBase64(request.getSignatureBase64());
        }

        doctor = doctorRepository.save(doctor);
        log.info("Profile updated for: {}", email);
        return authService.mapToProfileResponse(doctor);
    }

    @CacheEvict(value = "doctorProfiles", key = "#email.toLowerCase()")
    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new ValidationException("New passwords do not match");
        }

        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Doctor not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), doctor.getPasswordHash())) {
            throw new AuthException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), doctor.getPasswordHash())) {
            throw new ValidationException("New password must be different from current password");
        }

        doctor.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        doctorRepository.save(doctor);
        log.info("Password changed for: {}", email);
    }

    @CacheEvict(value = "doctorProfiles", key = "#email.toLowerCase()")
    public DoctorProfileResponse updateSignature(String email, String signatureBase64) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Doctor not found"));
        doctor.setSignatureBase64(signatureBase64);
        doctor = doctorRepository.save(doctor);
        return authService.mapToProfileResponse(doctor);
    }

    public List<DoctorProfileResponse> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .sorted(Comparator.comparing(Doctor::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(authService::mapToProfileResponse)
                .toList();
    }

    @CacheEvict(value = "doctorProfiles", key = "#result.email.toLowerCase()", condition = "#result != null")
    public DoctorProfileResponse updateDoctorAccess(String adminEmail, String doctorId, boolean isActive) {
        Doctor admin = doctorRepository.findByEmail(adminEmail.toLowerCase())
                .orElseThrow(() -> new AuthException("Doctor not found"));
        if (!DoctorAccessPolicy.isSuperAdmin(admin)) {
            throw new AuthException("Only super admin can manage doctor access");
        }

        Doctor target = doctorRepository.findByDoctorId(doctorId)
                .orElseThrow(() -> new AuthException("Doctor not found"));

        if (DoctorAccessPolicy.isSuperAdmin(target)) {
            throw new ValidationException("Super admin access is always allowed");
        }

        if (admin.getId() != null && admin.getId().equals(target.getId()) && !isActive) {
            throw new ValidationException("You cannot deactivate your own super admin account");
        }

        target.setActive(isActive);
        target = doctorRepository.save(target);
        log.info("Doctor access updated: {} -> {}", target.getEmail(), isActive);
        return authService.mapToProfileResponse(target);
    }
}
