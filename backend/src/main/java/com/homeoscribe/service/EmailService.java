package com.homeoscribe.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:drsalunkhehomeopathy@gmail.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:Salunkhe Clinic Portal}")
    private String fromName;

    public void sendOtpEmail(String toEmail, String otp, String doctorName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(fromName + " — Password Reset Verification Code");

            String htmlContent = buildOtpEmailContent(doctorName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP email. Please ensure your email is correct and try again.");
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
                    .body { padding: 32px 28px; text-align: center; }
                    .greeting { font-size: 16px; font-weight: 600; color: #1e293b; text-align: left; margin-bottom: 16px; }
                    .text { font-size: 14px; color: #475569; line-height: 1.6; text-align: left; margin-bottom: 24px; }
                    .otp-box { background: #f0f6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
                    .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace; margin: 0; }
                    .expiry-text { font-size: 12px; color: #64748b; margin-top: 8px; }
                    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <h1>Salunkhe Clinic Portal</h1>
                        <p>Doctor Portal Password Reset Request</p>
                    </div>
                    <div class="body">
                        <div class="greeting">Hello,  %s,</div>
                        <div class="text">
                            We received a request to reset your password for your <strong>Salunkhe Clinic Portal</strong> account. Use the 6-digit OTP code below to verify your identity:
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
