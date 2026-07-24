package com.homeoscribe.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Qualification is required")
    @Size(min = 2, max = 200, message = "Qualification must be between 2 and 200 characters")
    private String qualification;

    @NotBlank(message = "Clinic name is required")
    @Size(min = 3, max = 150, message = "Clinic name must be between 3 and 150 characters")
    private String clinicName;

    @NotBlank(message = "Clinic address is required")
    @Size(min = 5, max = 500, message = "Clinic address must be at least 5 characters")
    private String clinicAddress;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number must be a valid 10-15 digit number")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "License number is required")
    @Size(min = 3, max = 50, message = "License number must be at least 3 characters")
    private String licenseNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
