package com.supermarket.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.seed")
public record AppSeedProperties(boolean enabled) {
}
