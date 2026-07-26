package com.homeoscribe.controller;

import com.homeoscribe.dto.request.LoginRequest;
import com.homeoscribe.dto.request.RegisterRequest;
import com.homeoscribe.dto.request.SendOtpRequest;
import com.homeoscribe.dto.request.VerifyOtpRequest;
import com.homeoscribe.dto.request.ResetPasswordRequest;
import com.homeoscribe.dto.response.ApiResponse;
import com.homeoscribe.dto.response.AuthResponse;
import com.homeoscribe.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok(
            ApiResponse.success("Registration successful! Your account is now allowed to access the system.", authResponse)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(
            ApiResponse.success("Login successful!", authResponse)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("System is healthy and active", "OK"));
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendForgotPasswordOtp(
            @Valid @RequestBody SendOtpRequest request) {
        authService.sendForgotPasswordOtp(request);
        return ResponseEntity.ok(
            ApiResponse.success("OTP sent successfully to your registered email address. Enter the OTP to proceed.")
        );
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyForgotPasswordOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyForgotPasswordOtp(request);
        return ResponseEntity.ok(
            ApiResponse.success("OTP verified successfully. You may now reset your password.")
        );
    }

    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(
            ApiResponse.success("Password reset successfully! You can now log in with your new password.")
        );
    }
}
