package com.ecom.notification.application.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String customerName, String orderId, String totalAmount) {
        logger.info("Starting asynchronous email delivery for Order ID {} to {}", orderId, toEmail);
        try {
            // Read HTML template from resources
            InputStream is = getClass().getResourceAsStream("/templates/order-confirmation.html");
            if (is == null) {
                logger.error("Email template not found at /templates/order-confirmation.html");
                return;
            }

            String htmlTemplate;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                htmlTemplate = reader.lines().collect(Collectors.joining("\n"));
            }

            // Replace dynamic placeholders
            String emailBody = htmlTemplate
                    .replace("{{customerName}}", customerName)
                    .replace("{{orderId}}", orderId)
                    .replace("{{totalAmount}}", totalAmount);

            // Prepare MimeMessage for HTML support
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Premium Order Confirmed! - AnuMart");
            helper.setText(emailBody, true); // true enables HTML body
            helper.setFrom(fromEmail);

            mailSender.send(mimeMessage);
            logger.info("Asynchronous email for Order ID {} successfully sent to {}", orderId, toEmail);

        } catch (Exception e) {
            logger.error("Failed to send order confirmation email for Order ID {} to {}", orderId, toEmail, e);
        }
    }
}
