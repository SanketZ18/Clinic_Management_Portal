package com.homeoscribe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:drsalunkhehomeopathy@gmail.com}")
    private String username;

    @Value("${spring.mail.password:tcapvicxxxjugmqa}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host != null ? host.trim() : "smtp.gmail.com");
        mailSender.setPort(port);
        mailSender.setUsername(username != null ? username.trim() : "drsalunkhehomeopathy@gmail.com");
        
        // Clean password by stripping all spaces (handles "tcap vicx xxju gmqa" cleanly)
        String cleanPassword = password != null ? password.replaceAll("\\s+", "") : "tcapvicxxxjugmqa";
        mailSender.setPassword(cleanPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        return mailSender;
    }
}
