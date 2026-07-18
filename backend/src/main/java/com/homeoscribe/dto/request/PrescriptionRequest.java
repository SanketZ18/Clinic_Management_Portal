package com.homeoscribe.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PrescriptionRequest {
    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Age is required")
    private String age;

    private String gender;
    private String bloodGroup;
    private String visitType;
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    private String chiefComplaint;

    @NotEmpty(message = "Prescription must contain at least one remedy")
    @Valid
    private List<RemedyItem> remedies;

    private String followUpDays;
    private String doctorNotes;
}
