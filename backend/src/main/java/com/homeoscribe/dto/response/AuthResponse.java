package com.homeoscribe.dto.response;

public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private DoctorProfileResponse doctor;

    public AuthResponse() {
    }

    public AuthResponse(String accessToken, String tokenType, DoctorProfileResponse doctor) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.doctor = doctor;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public DoctorProfileResponse getDoctor() {
        return doctor;
    }

    public void setDoctor(DoctorProfileResponse doctor) {
        this.doctor = doctor;
    }

    public static AuthResponse of(String accessToken, DoctorProfileResponse doctor) {
        return new AuthResponse(accessToken, "Bearer", doctor);
    }
}
