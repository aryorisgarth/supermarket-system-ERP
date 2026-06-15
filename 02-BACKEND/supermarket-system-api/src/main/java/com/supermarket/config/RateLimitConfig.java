package com.supermarket.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitConfig implements HandlerInterceptor {

	private static final int LOGIN_REQUESTS_PER_MINUTE = 5;
	private static final int REFRESH_REQUESTS_PER_MINUTE = 10;
	private static final int GENERAL_REQUESTS_PER_MINUTE = 100;

	private final Map<String, RateLimitEntry> loginLimits = new ConcurrentHashMap<>();
	private final Map<String, RateLimitEntry> refreshLimits = new ConcurrentHashMap<>();
	private final Map<String, RateLimitEntry> generalLimits = new ConcurrentHashMap<>();

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		String clientIp = getClientIp(request);
		String uri = request.getRequestURI();

		RateLimitEntry entry;
		int limit;

		if (uri.contains("/auth/login")) {
			entry = loginLimits.computeIfAbsent(clientIp, k -> new RateLimitEntry(LOGIN_REQUESTS_PER_MINUTE));
			limit = LOGIN_REQUESTS_PER_MINUTE;
		} else if (uri.contains("/auth/refresh")) {
			entry = refreshLimits.computeIfAbsent(clientIp, k -> new RateLimitEntry(REFRESH_REQUESTS_PER_MINUTE));
			limit = REFRESH_REQUESTS_PER_MINUTE;
		} else {
			entry = generalLimits.computeIfAbsent(clientIp, k -> new RateLimitEntry(GENERAL_REQUESTS_PER_MINUTE));
			limit = GENERAL_REQUESTS_PER_MINUTE;
		}

		if (!entry.tryConsume()) {
			response.setStatus(429);
			response.setContentType("application/json");
			response.getWriter().write("{\"message\": \"Too many requests. Please try again later.\"}");
			return false;
		}

		response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
		response.setHeader("X-RateLimit-Remaining", String.valueOf(entry.getRemaining()));
		response.setHeader("X-RateLimit-Reset", String.valueOf(entry.getSecondsUntilReset()));

		return true;
	}

	private String getClientIp(HttpServletRequest request) {
		String xfHeader = request.getHeader("X-Forwarded-For");
		if (xfHeader == null) {
			return request.getRemoteAddr();
		}
		return xfHeader.split(",")[0];
	}

	private static class RateLimitEntry {
		private final int maxRequests;
		private final AtomicInteger requestCount;
		private LocalDateTime windowStart;

		public RateLimitEntry(int maxRequests) {
			this.maxRequests = maxRequests;
			this.requestCount = new AtomicInteger(0);
			this.windowStart = LocalDateTime.now();
		}

		public synchronized boolean tryConsume() {
			LocalDateTime now = LocalDateTime.now();
			long secondsSinceStart = ChronoUnit.SECONDS.between(windowStart, now);

			if (secondsSinceStart >= 60) {
				requestCount.set(0);
				windowStart = now;
			}

			if (requestCount.get() < maxRequests) {
				requestCount.incrementAndGet();
				return true;
			}

			return false;
		}

		public int getRemaining() {
			return Math.max(0, maxRequests - requestCount.get());
		}

		public long getSecondsUntilReset() {
			long secondsSinceStart = ChronoUnit.SECONDS.between(windowStart, LocalDateTime.now());
			return Math.max(0, 60 - secondsSinceStart);
		}
	}
}
