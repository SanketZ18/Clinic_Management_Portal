package com.homeoscribe.controller;

import com.homeoscribe.dto.request.ChangePasswordRequest;
import com.homeoscribe.dto.request.UpdateProfileRequest;
import com.homeoscribe.dto.response.ApiResponse;
import com.homeoscribe.dto.response.DoctorProfileResponse;
import com.homeoscribe.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        DoctorProfileResponse profile = doctorService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {

        DoctorProfileResponse profile = doctorService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @PutMapping("/profile/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {

        doctorService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @PutMapping("/profile/signature")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateSignature(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        String signatureBase64 = body.get("signatureBase64");
        DoctorProfileResponse profile = doctorService.updateSignature(userDetails.getUsername(), signatureBase64);
        return ResponseEntity.ok(ApiResponse.success("Signature updated successfully", profile));
    }
}
