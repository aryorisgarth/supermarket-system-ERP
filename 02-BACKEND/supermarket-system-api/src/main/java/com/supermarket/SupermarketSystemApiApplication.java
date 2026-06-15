package com.supermarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.supermarket.billing.config.BillingProperties;
import com.supermarket.config.AppCorsProperties;
import com.supermarket.config.AppSeedProperties;
import com.supermarket.config.JwtProperties;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableConfigurationProperties({ JwtProperties.class, AppSeedProperties.class, AppCorsProperties.class,
		BillingProperties.class })
public class SupermarketSystemApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SupermarketSystemApiApplication.class, args);
	}

}
