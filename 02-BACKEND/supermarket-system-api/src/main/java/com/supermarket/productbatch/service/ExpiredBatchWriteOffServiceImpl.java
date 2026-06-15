package com.supermarket.productbatch.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.product.entity.Product;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.productbatch.dto.ExpiredWriteOffResultDTO;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpiredBatchWriteOffServiceImpl implements ExpiredBatchWriteOffService {

	private final ProductBatchRepository productBatchRepository;
	private final ProductRepository productRepository;
	private final InventoryLedger inventoryLedger;

	@Override
	@Transactional
	public ExpiredWriteOffResultDTO writeOffExpired(User actor) {
		if (actor == null) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "System user not available for write-off");
		}

		List<ProductBatch> expired = productBatchRepository.findActiveExpired(LocalDate.now());
		int batchesProcessed = 0;
		BigDecimal totalQuantity = BigDecimal.ZERO;

		for (ProductBatch batch : expired) {
			BigDecimal quantity = batch.getCurrentQuantity();
			if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
				continue;
			}

			Product product = productRepository.findByIdForUpdate(batch.getProduct().getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

			inventoryLedger.record(
					actor,
					product,
					batch,
					InventoryMovementType.EXPIRED,
					quantity,
					(byte) -1,
					batch.getId(),
					null,
					"PRODUCT_BATCH",
					product.getPurchasePrice(),
					"Baja automatica por vencimiento lote " + batch.getBatchCode());

			batchesProcessed++;
			totalQuantity = totalQuantity.add(quantity);
		}

		log.info("Expired write-off completed: {} batches, {} units", batchesProcessed, totalQuantity);
		return new ExpiredWriteOffResultDTO(batchesProcessed, totalQuantity);
	}
}
