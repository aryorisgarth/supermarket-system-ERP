package com.supermarket.user.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

	private static final Logger log = LoggerFactory.getLogger(EmailService.class);

	private final JavaMailSender mailSender;

	@Value("${spring.mail.username:}")
	private String mailUsername;

	/**
	 * @return true si el correo se envió; false si falló (no lanza excepción).
	 */
	public boolean sendTemporaryPasswordEmail(String toEmail, String fullName, String tempPassword) {
		return sendCredentialEmail(
				toEmail,
				fullName,
				tempPassword,
				"Bienvenido a SuperNova - Tus credenciales de acceso",
				"Se creó tu cuenta en el ERP SuperNova. Credenciales temporales:"
		);
	}

	public boolean sendPasswordResetEmail(String toEmail, String fullName, String tempPassword) {
		return sendCredentialEmail(
				toEmail,
				fullName,
				tempPassword,
				"SuperNova - Recuperación de contraseña",
				"Solicitaste recuperar el acceso. Usa esta contraseña temporal e inicia sesión:"
		);
	}

	private boolean sendCredentialEmail(String toEmail, String fullName, String tempPassword, String subject, String intro) {
		if (!StringUtils.hasText(mailUsername)) {
			log.warn("SMTP no configurado (spring.mail.username vacío). No se envía correo a {}", toEmail);
			return false;
		}
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setFrom(mailUsername);
			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(buildHtmlTemplate(fullName, toEmail, tempPassword, intro), true);

			mailSender.send(message);
			return true;
		} catch (Exception e) {
			log.error("No se pudo enviar correo a {}: {}", toEmail, e.getMessage());
			return false;
		}
	}

	private String buildHtmlTemplate(String fullName, String email, String password, String intro) {
		String safeName = fullName != null ? fullName : "";
		String safeIntro = intro != null ? intro : "";
		return """
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<style>
					body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; color: #1f2937; }
					.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
					.header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 30px; text-align: center; }
					.content { padding: 40px; }
					.credentials-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px; margin-bottom: 30px; }
					.label { font-weight: 600; color: #64748b; display: inline-block; width: 100px; }
					.value { color: #0f172a; font-family: 'Courier New', Courier, monospace; font-weight: bold; background-color: #e2e8f0; padding: 3px 8px; border-radius: 4px; }
					.footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #f3f4f6; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header"><h1>SuperNova</h1></div>
					<div class="content">
						<p>Hola <strong>${fullName}</strong>,</p>
						<p>${intro}</p>
						<div class="credentials-box">
							<div><span class="label">Usuario:</span> ${email}</div>
							<div style="margin-top:12px"><span class="label">Contraseña:</span> <span class="value">${password}</span></div>
						</div>
						<p style="font-size:14px;color:#6b7280">Cambia la contraseña al iniciar sesión.</p>
					</div>
					<div class="footer">Mensaje automático del sistema SuperNova.</div>
				</div>
			</body>
			</html>
			""".replace("${fullName}", safeName)
				.replace("${intro}", safeIntro)
				.replace("${email}", email)
				.replace("${password}", password);
	}
}
