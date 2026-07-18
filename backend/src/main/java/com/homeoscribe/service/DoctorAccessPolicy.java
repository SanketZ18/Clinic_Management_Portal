package com.homeoscribe.service;

import com.homeoscribe.model.Doctor;

public final class DoctorAccessPolicy {

    private DoctorAccessPolicy() {
    }

    public static boolean isSuperAdmin(Doctor doctor) {
        if (doctor == null) {
            return false;
        }

        String role = doctor.getRole();
        if (role == null) {
            return false;
        }

        String normalized = role.trim().replace('_', ' ').replaceAll("\\s+", " ");
        return normalized.equalsIgnoreCase("Super Admin");
    }

    public static boolean isAccessAllowed(Doctor doctor) {
        return doctor != null && (isSuperAdmin(doctor) || doctor.isActive());
    }
}
