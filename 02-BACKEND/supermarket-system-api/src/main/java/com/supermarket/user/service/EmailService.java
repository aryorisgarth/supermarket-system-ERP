package com.supermarket.user.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

	private final JavaMailSender mailSender;

	public void sendTemporaryPasswordEmail(String toEmail, String fullName, String tempPassword) {
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(toEmail);
			helper.setSubject("Bienvenido a SuperNova - Tus credenciales de acceso");

			String htmlContent = buildHtmlTemplate(fullName, toEmail, tempPassword);
			helper.setText(htmlContent, true);

			mailSender.send(message);
		} catch (MessagingException e) {
			throw new RuntimeException("Failed to send welcome email to " + toEmail, e);
		}
	}

	private String buildHtmlTemplate(String fullName, String email, String password) {
		return """
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<style>
					body {
						font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
						background-color: #f3f4f6;
						margin: 0;
						padding: 0;
						color: #1f2937;
					}
					.container {
						max-width: 600px;
						margin: 40px auto;
						background: #ffffff;
						border-radius: 16px;
						box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
						overflow: hidden;
						border: 1px solid #e5e7eb;
					}
					.header {
						background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
						color: #ffffff;
						padding: 30px;
						text-align: center;
					}
					.header h1 {
						margin: 0;
						font-size: 24px;
						font-weight: 700;
						letter-spacing: 0.5px;
					}
					.content {
						padding: 40px;
					}
					.welcome-text {
						font-size: 18px;
						line-height: 1.6;
						margin-bottom: 24px;
						color: #374151;
					}
					.welcome-text span {
						font-weight: bold;
						color: #1e3a8a;
					}
					.credentials-box {
						background-color: #f8fafc;
						border-left: 4px solid #3b82f6;
						padding: 24px;
						border-radius: 8px;
						margin-bottom: 30px;
					}
					.credential-item {
						margin-bottom: 12px;
						font-size: 16px;
					}
					.credential-item:last-child {
						margin-bottom: 0;
					}
					.label {
						font-weight: 600;
						color: #64748b;
						display: inline-block;
						width: 100px;
					}
					.value {
						color: #0f172a;
						font-family: 'Courier New', Courier, monospace;
						font-weight: bold;
						background-color: #e2e8f0;
						padding: 3px 8px;
						border-radius: 4px;
					}
					.btn-container {
						text-align: center;
						margin-top: 30px;
					}
					.btn {
						background-color: #3b82f6;
						color: #ffffff !important;
						padding: 14px 28px;
						text-decoration: none;
						border-radius: 8px;
						font-weight: 600;
						font-size: 16px;
						display: inline-block;
						box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
						transition: background-color 0.2s;
					}
					.footer {
						background-color: #f9fafb;
						padding: 24px;
						text-align: center;
						font-size: 13px;
						color: #6b7280;
						border-top: 1px solid #f3f4f6;
					}
					.warning {
						color: #d97706;
						font-weight: 500;
						margin-top: 8px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>Bienvenido a la Plataforma SuperNova</h1>
					</div>
					<div class="content">
						<div class="welcome-text">
							Hola <span>${fullName}</span>,
						</div>
						<p class="welcome-text" style="font-size: 16px;">
							Te damos una cordial bienvenida a nuestro equipo. Se ha creado tu cuenta en el sistema ERP de Supermercado SuperNova. A continuación, encontrarás tus credenciales temporales para acceder a la plataforma:
						</p>
						<div class="credentials-box">
							<div class="credential-item">
								<span class="label">Usuario:</span>
								<span class="value" style="font-family: inherit; font-weight: normal; background: none; padding: 0;">${email}</span>
							</div>
							<div class="credential-item">
								<span class="label">Contraseña:</span>
								<span class="value">${password}</span>
							</div>
						</div>
						<p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
							Por motivos de seguridad, te sugerimos cambiar tu contraseña inmediatamente después de iniciar sesión por primera vez.
						</p>
						<div class="btn-container">
							<a href="http:
						</div>
					</div>
					<div class="footer">
						Este es un mensaje automático enviado por el sistema. Por favor no respondas a este correo.
						<div class="warning">
							Si no solicitaste este acceso, comunícate de inmediato con soporte técnico.
						</div>
					</div>
				</div>
			</body>
			</html>
			""".replace("${fullName}", fullName).replace("${email}", email).replace("${password}", password);
	}
}
