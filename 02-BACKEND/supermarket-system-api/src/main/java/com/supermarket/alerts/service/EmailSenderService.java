package com.supermarket.alerts.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSenderService {

	private final JavaMailSender mailSender;

	public void sendHtmlEmail(String to, String subject, String bodyText, String severity) {
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(to);
			helper.setSubject(subject);

			
			String severityColor = "#3b82f6"; 
			if ("CRITICAL".equalsIgnoreCase(severity)) {
				severityColor = "#ef4444"; 
			} else if ("WARNING".equalsIgnoreCase(severity)) {
				severityColor = "#f59e0b"; 
			}

			String htmlContent = """
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
						.card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
						.header { background: %s; padding: 20px; text-align: center; color: #ffffff; }
						.header h2 { margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
						.content { padding: 24px; line-height: 1.6; }
						.message-box { background-color: #f1f5f9; border-left: 4px solid %s; padding: 16px; border-radius: 8px; font-weight: 600; margin: 18px 0; }
						.footer { padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; background: #fafafa; }
					</style>
				</head>
				<body>
					<div class="card">
						<div class="header">
							<h2>Alerta de Sistema</h2>
						</div>
						<div class="content">
							<p>Estimado usuario,</p>
							<p>Se ha generado una notificación automática en el sistema <strong>SuperNova POS</strong>:</p>
							<div class="message-box">
								%s
							</div>
							<p style="font-size: 12px; color: #64748b;">Para más detalles, inicie sesión en la plataforma y vaya al módulo correspondiente.</p>
						</div>
						<div class="footer">
							Este es un correo automático, por favor no responda a este mensaje.<br>
							&copy; 2026 Supermarket System - SuperNova Enterprise.
						</div>
					</div>
				</body>
				</html>
				""".formatted(severityColor, severityColor, bodyText);

			helper.setText(htmlContent, true);
			mailSender.send(message);
			log.info("Correo enviado exitosamente a {}", to);
		} catch (Exception e) {
			log.error("Fallo al enviar correo a {}: {}", to, e.getMessage(), e);
		}
	}
}
