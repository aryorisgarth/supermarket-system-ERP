package com.supermarket.productbatch.scheduler;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.supermarket.productbatch.dto.ExpiredWriteOffResultDTO;
import com.supermarket.productbatch.service.ExpiredBatchWriteOffService;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.inventory.expired-write-off-enabled", havingValue = "true", matchIfMissing = true)
public class ExpiredBatchScheduler {

	private static final String SYSTEM_USER_EMAIL = "admin@supermarket.local";

	private final ExpiredBatchWriteOffService expiredBatchWriteOffService;
	private final UserRepository userRepository;

	@Scheduled(cron = "${app.inventory.expired-write-off-cron:0 0 1 * * *}")
	public void writeOffExpiredBatchesDaily() {
		User systemUser = userRepository.findByEmailWithRole(SYSTEM_USER_EMAIL).orElse(null);
		if (systemUser == null) {
			log.warn("Scheduled expired write-off skipped: system user {} not found", SYSTEM_USER_EMAIL);
			return;
		}

		ExpiredWriteOffResultDTO result = expiredBatchWriteOffService.writeOffExpired(systemUser);
		if (result.batchesProcessed() > 0) {
			log.info("Scheduled expired write-off: {} lotes, {} unidades", result.batchesProcessed(),
					result.totalQuantityWrittenOff());
		}
	}
}
