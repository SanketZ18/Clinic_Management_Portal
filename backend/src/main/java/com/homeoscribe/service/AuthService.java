package com.homeoscribe.service;

import com.homeoscribe.dto.request.*;
import com.homeoscribe.dto.response.AuthResponse;
import com.homeoscribe.dto.response.DoctorProfileResponse;
import com.homeoscribe.exception.AuthException;
import com.homeoscribe.exception.DuplicateResourceException;
import com.homeoscribe.exception.ValidationException;
import com.homeoscribe.model.Doctor;
import com.homeoscribe.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        // Check duplicates
        if (doctorRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new DuplicateResourceException("Email already registered. Please login.");
        }
        if (doctorRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered.");
        }
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("License number already registered.");
        }

        Doctor doctor = Doctor.builder()
                .doctorId(UUID.randomUUID().toString())
                .fullName(request.getFullName())
                .qualification(request.getQualification())
                .clinicName(request.getClinicName())
                .clinicAddress(request.getClinicAddress())
                .phone(request.getPhone())
                .email(request.getEmail().toLowerCase())
                .licenseNumber(request.getLicenseNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("Doctor")
                .isActive(false)
                .subscriptionPlan("FREE")
                .build();

        doctor = doctorRepository.save(doctor);
        log.info("Doctor registered: {}", doctor.getEmail());
        return generateAuthResponse(doctor);
    }

    public AuthResponse login(LoginRequest request) {
        Doctor doctor = doctorRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!DoctorAccessPolicy.isAccessAllowed(doctor)) {
            if (doctor.getSubscriptionExpiry() != null && LocalDateTime.now().isAfter(doctor.getSubscriptionExpiry())) {
                throw new AuthException("Your 365-day subscription has expired. Please renew your plan to continue access.");
            }
            throw new AuthException("Access pending. Please contact the management team or Super Admin to grant access.");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail().toLowerCase(),
                    request.getPassword()
                )
            );
        } catch (BadCredentialsException e) {
            throw new AuthException("Invalid email or password");
        } catch (LockedException | DisabledException e) {
            if (doctor.getSubscriptionExpiry() != null && LocalDateTime.now().isAfter(doctor.getSubscriptionExpiry())) {
                throw new AuthException("Your 365-day subscription has expired. Please renew your plan to continue access.");
            }
            throw new AuthException("Access pending. Please contact the management team or Super Admin to grant access.");
        }

        // Update last login
        doctor.setLastLoginAt(LocalDateTime.now());
        doctorRepository.save(doctor);

        log.info("Doctor logged in: {}", doctor.getEmail());
        return generateAuthResponse(doctor);
    }

    private AuthResponse generateAuthResponse(Doctor doctor) {
        String accessToken = jwtService.generateAccessToken(doctor.getEmail(), doctor.getDoctorId(), doctor.getRole());
        return AuthResponse.of(accessToken, mapToProfileResponse(doctor));
    }

    public DoctorProfileResponse mapToProfileResponse(Doctor doctor) {
        return DoctorProfileResponse.builder()
                .id(doctor.getId())
                .doctorId(doctor.getDoctorId())
                .fullName(doctor.getFullName())
                .qualification(doctor.getQualification())
                .clinicName(doctor.getClinicName())
                .clinicAddress(doctor.getClinicAddress())
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .licenseNumber(doctor.getLicenseNumber())
                .signatureBase64(doctor.getSignatureBase64())
                .role(displayRole(doctor.getRole()))
                .isActive(DoctorAccessPolicy.isAccessAllowed(doctor))
                .subscriptionPlan(doctor.getSubscriptionPlan())
                .subscriptionExpiry(doctor.getSubscriptionExpiry())
                .createdAt(doctor.getCreatedAt())
                .lastLoginAt(doctor.getLastLoginAt())
                .build();
    }

    private String displayRole(String role) {
        if (role == null || role.isBlank()) {
            return "Doctor";
        }

        String normalized = role.trim().replace('_', ' ').replaceAll("\\s+", " ");
        if (normalized.equalsIgnoreCase("super admin")) {
            return "Super Admin";
        }
        return "Doctor";
    }

    private String toText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    public void sendForgotPasswordOtp(SendOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ValidationException("No doctor account found with this email address."));

        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));

        doctor.setResetOtp(otp);
        doctor.setResetOtpExpiry(LocalDateTime.now().plusMinutes(10));
        doctor.setResetOtpVerified(false);
        doctorRepository.save(doctor);

        emailService.sendOtpEmail(doctor.getEmail(), otp, doctor.getFullName());
        log.info("Password reset OTP generated and sent to email: {}", email);
    }

    public void verifyForgotPasswordOtp(VerifyOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ValidationException("No doctor account found with this email address."));

        if (doctor.getResetOtp() == null || doctor.getResetOtpExpiry() == null) {
            throw new ValidationException("No OTP request found. Please request a new OTP.");
        }

        if (LocalDateTime.now().isAfter(doctor.getResetOtpExpiry())) {
            throw new ValidationException("OTP has expired. Please request a new OTP.");
        }

        if (!doctor.getResetOtp().trim().equals(request.getOtp().trim())) {
            throw new ValidationException("Invalid OTP. Please check the 6-digit code sent to your email.");
        }

        doctor.setResetOtpVerified(true);
        doctorRepository.save(doctor);
        log.info("OTP verified successfully for doctor email: {}", email);
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match.");
        }

        if (request.getNewPassword().length() < 8 || !request.getNewPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$")) {
            throw new ValidationException("Password must be at least 8 characters long and contain uppercase, lowercase letter & number.");
        }

        String email = request.getEmail().toLowerCase().trim();
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ValidationException("No doctor account found with this email address."));

        if (doctor.getResetOtp() == null || !doctor.isResetOtpVerified() || !doctor.getResetOtp().trim().equals(request.getOtp().trim())) {
            throw new ValidationException("OTP is not verified. Please verify your OTP first.");
        }

        if (doctor.getResetOtpExpiry() != null && LocalDateTime.now().isAfter(doctor.getResetOtpExpiry())) {
            throw new ValidationException("OTP session has expired. Please request a new OTP.");
        }

        doctor.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        doctor.setResetOtp(null);
        doctor.setResetOtpExpiry(null);
        doctor.setResetOtpVerified(false);
        doctorRepository.save(doctor);

        log.info("Password successfully reset for doctor: {}", email);
    }
}
