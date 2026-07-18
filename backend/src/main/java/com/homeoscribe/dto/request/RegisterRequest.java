package com.homeoscribe.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Qualification is required")
    @Size(max = 200, message = "Qualification too long")
    private String qualification;

    @NotBlank(message = "Clinic name is required")
    @Size(max = 150, message = "Clinic name too long")
    private String clinicName;

    @NotBlank(message = "Clinic address is required")
    @Size(max = 500, message = "Address too long")
    private String clinicAddress;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "License number is required")
    @Size(max = 50, message = "License number too long")
    private String licenseNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Password must contain at least one uppercase, one lowercase letter, and one number"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
