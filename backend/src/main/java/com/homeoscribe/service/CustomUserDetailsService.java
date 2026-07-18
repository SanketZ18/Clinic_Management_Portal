package com.homeoscribe.service;

import com.homeoscribe.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final DoctorRepository doctorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return doctorRepository.findByEmail(email.toLowerCase())
                .map(doctor -> org.springframework.security.core.userdetails.User.builder()
                        .username(doctor.getEmail())
                        .password(doctor.getPasswordHash())
                        .roles(resolveRole(doctor.getRole()))
                        .accountLocked(!DoctorAccessPolicy.isAccessAllowed(doctor))
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Doctor not found with email: " + email));
    }

    private String resolveRole(String role) {
        if (role == null) {
            return "DOCTOR";
        }

        String normalized = role.trim().toUpperCase().replace(' ', '_');
        return normalized.contains("SUPER_ADMIN") ? "SUPER_ADMIN" : "DOCTOR";
    }
}
