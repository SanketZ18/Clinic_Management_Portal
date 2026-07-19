package com.homeoscribe.controller;

import com.homeoscribe.dto.request.DoctorAccessRequest;
import com.homeoscribe.dto.response.ApiResponse;
import com.homeoscribe.dto.response.DoctorProfileResponse;
import com.homeoscribe.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminDoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorProfileResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", doctorService.getAllDoctors()));
    }

    @PutMapping("/{doctorId}/access")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateAccess(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String doctorId,
            @Valid @RequestBody DoctorAccessRequest request) {

        DoctorProfileResponse updated = doctorService.updateDoctorAccess(userDetails.getUsername(), doctorId, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success("Doctor access updated successfully", updated));
    }

    @DeleteMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<String>> deleteDoctor(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String doctorId) {

        doctorService.deleteDoctor(userDetails.getUsername(), doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully", doctorId));
    }
}
