package com.supermarket.inventorycount.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.alerts.service.SystemAlertService;
import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.inventorycount.dto.InventoryCountScanRequestDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionResponseDTO;
import com.supermarket.inventorycount.entity.InventoryCountLine;
import com.supermarket.inventorycount.entity.InventoryCountSession;
import com.supermarket.inventorycount.mapper.InventoryCountMapper;
import com.supermarket.inventorycount.model.InventoryCountStatus;
import com.supermarket.inventorycount.repository.InventoryCountLineRepository;
import com.supermarket.inventorycount.repository.InventoryCountSessionRepository;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.product.repository.ProductUomConversionRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryCountServiceImpl Unit Tests")
class InventoryCountServiceImplTest {

	@Mock private InventoryCountSessionRepository sessionRepository;
	@Mock private InventoryCountLineRepository lineRepository;
	@Mock private ProductRepository productRepository;
	@Mock private InventoryCountMapper inventoryCountMapper;
	@Mock private InventoryLedger inventoryLedger;
	@Mock private SystemAlertService systemAlertService;
	@Mock private ProductUomConversionRepository productUomConversionRepository;

	@InjectMocks
	private InventoryCountServiceImpl inventoryCountService;

	@Test
	@DisplayName("scan(): escanea unidad base por defecto si no existe conversión UOM")
	void scan_baseUnitDefault_ok() {
		Long sessionId = 1L;
		InventoryCountScanRequestDTO request = new InventoryCountScanRequestDTO("750123", BigDecimal.ONE);

		InventoryCountSession session = new InventoryCountSession();
		session.setId(sessionId);
		session.setStatus(InventoryCountStatus.OPEN);
		session.setLines(new ArrayList<>());

		Product product = new Product();
		product.setId(10L);
		product.setBarcode("750123");
		product.setName("Leche 1L");
		product.setCurrentStock(new BigDecimal("10.0000"));

		
		when(sessionRepository.findByIdWithDetails(sessionId)).thenReturn(Optional.of(session));
		when(productUomConversionRepository.findByBarcode("750123")).thenReturn(Optional.empty());
		when(productRepository.findByBarcode("750123")).thenReturn(Optional.of(product));
		when(lineRepository.findBySessionIdAndProductIdAndBatchIsNull(sessionId, 10L)).thenReturn(Optional.empty());
		
		InventoryCountLine newLine = new InventoryCountLine();
		newLine.setCountedQuantity(BigDecimal.ZERO);
		newLine.setSystemQuantity(BigDecimal.ZERO);
		newLine.setProduct(product);
		when(lineRepository.save(any(InventoryCountLine.class))).thenReturn(newLine);

		
		inventoryCountService.scan(sessionId, request);

		
		verify(lineRepository, atLeastOnce()).save(argThat(line -> 
				new BigDecimal("1.0000").compareTo(line.getCountedQuantity()) == 0 &&
				line.getUomConversion() == null
		));
	}

	@Test
	@DisplayName("scan(): resuelve empaque secundario UOM multiplicando por el factor")
	void scan_uomConversion_resolvesFactor() {
		Long sessionId = 1L;
		
		InventoryCountScanRequestDTO request = new InventoryCountScanRequestDTO("750123-24", BigDecimal.ONE);

		InventoryCountSession session = new InventoryCountSession();
		session.setId(sessionId);
		session.setStatus(InventoryCountStatus.OPEN);
		session.setLines(new ArrayList<>());

		Product product = new Product();
		product.setId(10L);
		product.setBarcode("750123");
		product.setName("Agua Mineral 600ml");

		ProductUomConversion conversion = new ProductUomConversion();
		conversion.setId(101L);
		conversion.setProduct(product);
		conversion.setFactor(new BigDecimal("24.0000"));
		conversion.setLabel("FARDO X24");
		conversion.setBarcode("750123-24");

		
		when(sessionRepository.findByIdWithDetails(sessionId)).thenReturn(Optional.of(session));
		when(productUomConversionRepository.findByBarcode("750123-24")).thenReturn(Optional.of(conversion));
		when(lineRepository.findBySessionIdAndProductIdAndBatchIsNull(sessionId, 10L)).thenReturn(Optional.empty());

		InventoryCountLine newLine = new InventoryCountLine();
		newLine.setCountedQuantity(BigDecimal.ZERO);
		newLine.setSystemQuantity(BigDecimal.ZERO);
		newLine.setProduct(product);
		when(lineRepository.save(any(InventoryCountLine.class))).thenReturn(newLine);

		
		inventoryCountService.scan(sessionId, request);

		
		verify(lineRepository, atLeastOnce()).save(argThat(line -> 
				new BigDecimal("24.0000").compareTo(line.getCountedQuantity()) == 0 &&
				conversion.equals(line.getUomConversion())
		));
	}

	@Test
	@DisplayName("scan(): lanza BAD_REQUEST si el delta de cantidad es negativo o cero")
	void scan_negativeDelta_throwsBadRequest() {
		Long sessionId = 1L;
		InventoryCountScanRequestDTO request = new InventoryCountScanRequestDTO("750123", BigDecimal.ZERO);

		InventoryCountSession session = new InventoryCountSession();
		session.setId(sessionId);
		session.setStatus(InventoryCountStatus.OPEN);

		Product product = new Product();
		product.setId(10L);
		product.setBarcode("750123");

		when(sessionRepository.findByIdWithDetails(sessionId)).thenReturn(Optional.of(session));
		when(productUomConversionRepository.findByBarcode("750123")).thenReturn(Optional.empty());
		when(productRepository.findByBarcode("750123")).thenReturn(Optional.of(product));

		ResponseStatusException ex = assertThrows(ResponseStatusException.class,
				() -> inventoryCountService.scan(sessionId, request));

		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
	}
}
