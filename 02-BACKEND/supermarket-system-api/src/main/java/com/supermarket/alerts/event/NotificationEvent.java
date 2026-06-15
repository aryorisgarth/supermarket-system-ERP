package com.supermarket.alerts.event;

import org.springframework.context.ApplicationEvent;

import lombok.Getter;

@Getter
public class NotificationEvent extends ApplicationEvent {
	private static final long serialVersionUID = 1L;

	private final String alertType;
	private final String severity;
	private final String title;
	private final String message;
	private final String actionPath;

	public NotificationEvent(Object source, String alertType, String severity, String title, String message, String actionPath) {
		super(source);
		this.alertType = alertType;
		this.severity = severity;
		this.title = title;
		this.message = message;
		this.actionPath = actionPath;
	}
}
