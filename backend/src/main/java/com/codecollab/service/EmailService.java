package com.codecollab.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from.email:${RESEND_FROM_EMAIL:CodeCollab <onboarding@resend.dev>}}")
    private String fromEmail;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    private String resolveApiKey() {
        if (resendApiKey != null && !resendApiKey.trim().isBlank()) {
            return resendApiKey.trim();
        }
        String key = System.getenv("RESEND_API_KEY");
        if (key != null && !key.trim().isBlank()) return key.trim();

        key = System.getProperty("RESEND_API_KEY");
        if (key != null && !key.trim().isBlank()) return key.trim();

        return "";
    }

    public boolean sendOtpEmail(String toEmail, String otp) {
        String apiKey = resolveApiKey();
        boolean isResendConfigured = !apiKey.isBlank();

        // 1. Terminal Output: ALWAYS display the OTP clearly in terminal so local dev / testing is seamless
        System.out.println("\n" + "=".repeat(62));
        System.out.println(" 🚀 [CodeCollab Auth] EMAIL LOGIN OTP DISPATCHED");
        System.out.println(" 📧 Recipient: " + toEmail);
        System.out.println(" 🔑 OTP Code:  " + otp);
        System.out.println(" ⏱️ Valid for:  5 Minutes");
        if (isResendConfigured) {
            System.out.println(" 📤 Delivery:  Sending real email via Resend API...");
        } else {
            System.out.println(" ℹ️ Delivery:  Resend API key not set (Local Terminal Mode)");
        }
        System.out.println("=".repeat(62) + "\n");

        if (!isResendConfigured) {
            return true;
        }

        // 2. Dispatch real email via Resend
        try {
            String htmlBody = buildOtpHtmlTemplate(otp);

            Map<String, Object> payload = Map.of(
                    "from", fromEmail,
                    "to", List.of(toEmail),
                    "subject", "Your CodeCollab Verification Code: " + otp,
                    "html", htmlBody
            );

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("✅ [Resend] Email successfully delivered to " + toEmail);
                return true;
            } else {
                System.err.println("⚠️ [Resend] Failed to send email (Status " + response.statusCode() + "): " + response.body());
                System.out.println("💡 [Dev Info] You can still use the OTP printed above in the terminal to log in.");
                return false;
            }
        } catch (Exception e) {
            System.err.println("⚠️ [Resend Error] " + e.getMessage());
            System.out.println("💡 [Dev Info] You can still use the OTP printed above in the terminal to log in.");
            return false;
        }
    }

    private String buildOtpHtmlTemplate(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; }
                .container { max-width: 480px; margin: 0 auto; background-color: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px; text-align: center; }
                .logo { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 24px; font-family: monospace; }
                .code-box { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #818cf8; background-color: #09090b; border: 1px solid rgba(129, 140, 248, 0.3); border-radius: 12px; padding: 18px 24px; margin: 28px 0; font-family: monospace; }
                .text { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 8px; }
                .footer { font-size: 11px; color: #71717a; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">&lt;/&gt; CodeCollab</div>
                <h2 style="color: #ffffff; margin: 0 0 12px 0; font-size: 20px;">Your Verification Code</h2>
                <p class="text">Use the 6-digit code below to securely sign in to your CodeCollab workspace.</p>
                <div class="code-box">%s</div>
                <p class="text">This code will expire in <strong>5 minutes</strong>.</p>
                <p class="text" style="font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
                <div class="footer">
                  CodeCollab &bull; Real-time collaborative coding and whiteboard
                </div>
              </div>
            </body>
            </html>
            """.formatted(otp);
    }
}
