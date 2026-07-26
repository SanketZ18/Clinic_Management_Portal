package com.homeoscribe.service;

import com.homeoscribe.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * EmailService — sends OTP emails via Resend HTTP API (HTTPS port 443).
 *
 * Why Resend instead of SMTP?
 *   Render free-tier blocks ALL outbound SMTP ports (25, 465, 587).
 *   Resend uses HTTPS API calls — never blocked by any cloud provider.
 *
 * Setup:
 *   1. Sign up free at https://resend.com
 *   2. Go to API Keys → Create API Key
 *   3. Add to Render env: RESEND_API_KEY = re_xxxxxxxxxxxxxxxx
 *   4. (Optional) Add custom domain to send as drsalunkhehomeopathy@gmail.com
 *       OR use the default "onboarding@resend.dev" until domain is verified
 */
@Service
@Slf4j
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${app.mail.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${app.mail.from-name:Salunkhe Clinic Portal}")
    private String fromName;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpEmail(String toEmail, String otp, String doctorName) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.error("RESEND_API_KEY is not configured. Cannot send email.");
            throw new ValidationException(
                "Email service is not configured on the server. Please contact the administrator."
            );
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey.trim());

            String fromAddress = String.format("%s <%s>", fromName, fromEmail);
            String htmlContent = buildOtpEmailContent(doctorName, otp);

            Map<String, Object> body = Map.of(
                "from",    fromAddress,
                "to",      new String[]{ toEmail },
                "subject", fromName + " — Password Reset Verification Code",
                "html",    htmlContent
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(RESEND_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("OTP email sent successfully to {} via Resend API", toEmail);
            } else {
                log.error("Resend API responded with status {}: {}", response.getStatusCode(), response.getBody());
                throw new ValidationException("Email delivery failed. Please try again in a few moments.");
            }

        } catch (ValidationException ve) {
            throw ve;
        } catch (org.springframework.web.client.HttpStatusCodeException httpEx) {
            String errorBody = httpEx.getResponseBodyAsString();
            log.error("Resend API HTTP Error [{}] body: {}", httpEx.getStatusCode(), errorBody);
            
            String msg = "Email service rejected the request.";
            if (errorBody.contains("\"message\":")) {
                try {
                    int start = errorBody.indexOf("\"message\":") + 10;
                    int end = errorBody.indexOf("\"", start + 1);
                    if (start > 10 && end > start) {
                        msg = errorBody.substring(start, end + 1).replaceAll("^\"|\"$", "");
                    }
                } catch (Exception ignored) {}
            }
            throw new ValidationException("Email provider error: " + msg);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} via Resend API: {}", toEmail, e.getMessage(), e);
            throw new ValidationException(
                "Failed to send OTP email. Please verify the email address and try again."
            );
        }
    }

    private String buildOtpEmailContent(String doctorName, String otp) {
        String name = (doctorName != null && !doctorName.isBlank()) ? doctorName : "Doctor";
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fc; margin: 0; padding: 20px; color: #333; }
                    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                    .header { background: linear-gradient(135deg, #1d4ed8 0%%, #0ea5e9 100%%); padding: 30px 24px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
                    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
                    .body { padding: 32px 28px; }
                    .greeting { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
                    .text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
                    .otp-box { background: #f0f6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
                    .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; font-family: monospace; margin: 0; }
                    .expiry-text { font-size: 12px; color: #64748b; margin-top: 8px; }
                    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <h1>Salunkhe Clinic Portal</h1>
                        <p>Doctor Portal — Password Reset Request</p>
                    </div>
                    <div class="body">
                        <div class="greeting">Hello, %s</div>
                        <div class="text">
                            We received a request to reset your password for your <strong>Salunkhe Clinic Portal</strong> account.
                            Use the 6-digit OTP code below to verify your identity:
                        </div>
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                            <div class="expiry-text">This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</div>
                        </div>
                        <div class="text" style="margin-bottom: 0;">
                            If you did not request a password reset, please ignore this email or contact support if you have concerns.
                        </div>
                    </div>
                    <div class="footer">
                        &copy; Salunkhe Clinic Portal. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, otp);
    }
}
