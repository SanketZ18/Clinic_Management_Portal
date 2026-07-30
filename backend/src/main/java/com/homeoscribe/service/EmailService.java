package com.homeoscribe.service;

import com.homeoscribe.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * EmailService — supports:
 *   1. Resend HTTP API (if RESEND_API_KEY is configured — required for Render cloud)
 *   2. Brevo HTTP API (if BREVO_API_KEY is configured — works on Render cloud)
 *   3. Gmail / Custom SMTP (if SPRING_MAIL_USERNAME & SPRING_MAIL_PASSWORD are configured)
 */
@Service
@Slf4j
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    @Value("${app.mail.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${app.mail.from-name:Salunkhe Clinic Portal}")
    private String fromName;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpEmail(String toEmail, String otp, String doctorName) {
        // Priority 1: Resend HTTP API (Recommended for cloud hosting like Render/AWS as HTTPS port 443 is never blocked)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            try {
                sendViaResendApi(toEmail, otp, doctorName);
                return;
            } catch (Exception e) {
                log.warn("Resend API delivery attempt failed: {}. Checking SMTP fallback...", e.getMessage());
            }
        }

        // Priority 2: Brevo HTTP API (HTTPS/443 works on cloud hosts such as Render)
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevoApi(toEmail, otp, doctorName);
            return;
        }

        // Priority 3: JavaMailSender (Gmail / Custom SMTP; may be blocked by cloud hosts)
        if (javaMailSender != null && smtpUsername != null && !smtpUsername.isBlank() && smtpPassword != null && !smtpPassword.isBlank()) {
            try {
                sendViaSmtp(toEmail, otp, doctorName);
                return;
            } catch (Exception e) {
                log.error("SMTP delivery failed: {}", e.getMessage());
                throw new ValidationException(
                    "SMTP email delivery failed (" + e.getMessage() + "). Note: Cloud hosts (Render/AWS) block SMTP port 587. Please add RESEND_API_KEY to your environment variables."
                );
            }
        }

        // If neither is configured, raise a clear error
        log.error("Email service error: Missing email credentials in environment variables.");
        throw new ValidationException(
            "Email credentials missing. Please configure RESEND_API_KEY, BREVO_API_KEY, or SPRING_MAIL_USERNAME & SPRING_MAIL_PASSWORD in environment variables."
        );
    }

    private void sendViaBrevoApi(String toEmail, String otp, String doctorName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
            headers.set("api-key", brevoApiKey.trim());

            Map<String, Object> sender = Map.of(
                "name", fromName,
                "email", fromEmail
            );
            Map<String, Object> recipient = Map.of("email", toEmail);
            Map<String, Object> body = Map.of(
                "sender", sender,
                "to", java.util.List.of(recipient),
                "subject", fromName + " — Password Reset Verification Code",
                "htmlContent", buildOtpEmailContent(doctorName, otp)
            );

            ResponseEntity<Map> response = restTemplate.postForEntity(
                BREVO_API_URL,
                new HttpEntity<>(body, headers),
                Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new ValidationException("Brevo rejected the email request: " + response.getStatusCode());
            }
            log.info("OTP email sent successfully to {} via Brevo API", toEmail);
        } catch (ValidationException ve) {
            throw ve;
        } catch (org.springframework.web.client.HttpStatusCodeException httpEx) {
            String responseBody = httpEx.getResponseBodyAsString();
            log.error("Brevo API HTTP Error [{}] body: {}", httpEx.getStatusCode(), responseBody);
            throw new ValidationException(
                "Brevo rejected the email (" + httpEx.getStatusCode().value() + "): "
                    + extractBrevoMessage(responseBody)
            );
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} via Brevo API: {}", toEmail, e.getMessage(), e);
            throw new ValidationException("Failed to send email through Brevo. Please try again later.");
        }
    }

    private String extractBrevoMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "empty response from Brevo";
        }
        Matcher matcher = Pattern.compile("\\\"message\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"").matcher(responseBody);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return responseBody.length() > 240 ? responseBody.substring(0, 240) : responseBody;
    }

    private void sendViaResendApi(String toEmail, String otp, String doctorName) {
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
            
            String msg = "Email provider rejected request.";
            if (errorBody != null && errorBody.contains("\"message\":")) {
                try {
                    int start = errorBody.indexOf("\"message\":") + 10;
                    int end = errorBody.indexOf("\"", start + 1);
                    if (start > 10 && end > start) {
                        msg = errorBody.substring(start, end + 1).replaceAll("^\"|\"$", "");
                    }
                } catch (Exception ignored) {}
            }
            throw new ValidationException("Email service error: " + msg);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} via Resend API: {}", toEmail, e.getMessage(), e);
            throw new ValidationException(
                "Failed to send OTP email. Please verify the email address and try again."
            );
        }
    }

    private void sendViaSmtp(String toEmail, String otp, String doctorName) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(smtpUsername, fromName);
            helper.setTo(toEmail);
            helper.setSubject(fromName + " — Password Reset Verification Code");
            helper.setText(buildOtpEmailContent(doctorName, otp), true);

            javaMailSender.send(message);
            log.info("OTP email sent successfully to {} via SMTP", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email via SMTP to {}: {}", toEmail, e.getMessage(), e);
            throw new ValidationException("Failed to send email via SMTP server: " + e.getMessage());
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
