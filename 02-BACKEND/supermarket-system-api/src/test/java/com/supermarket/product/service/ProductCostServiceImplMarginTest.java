package com.supermarket.product.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.supermarket.producthistory.repository.ProductCostHistoryRepository;

@ExtendWith(MockitoExtension.class)
class ProductCostServiceImplMarginTest {

	@Mock
	private ProductCostHistoryRepository productCostHistoryRepository;

	@InjectMocks
	private ProductCostServiceImpl productCostService;

	private BigDecimal cost;
	private BigDecimal sale;

	@BeforeEach
	void setUp() {
		cost = new BigDecimal("68.9404");
		sale = new BigDecimal("100.0000");
	}

	@Test
	void calculateMarkupPercent_aceiteIdealExample() {
		BigDecimal markup = productCostService.calculateMarkupPercent(sale, cost);
		assertNotNull(markup);
		// (100 - 68.9404) / 68.9404 × 100 con escala 4 → 45.0500 → UI 45.05%
		assertEquals(new BigDecimal("45.0500"), markup);
		assertEquals("45.05", markup.setScale(2, RoundingMode.HALF_UP).toPlainString());
	}

	@Test
	void calculateMarginPercent_aceiteIdealExample() {
		BigDecimal margin = productCostService.calculateMarginPercent(sale, cost);
		assertNotNull(margin);
		// (100 - 68.9404) / 100 × 100 con escala 4 → 31.0600 → UI 31.06%
		assertEquals(new BigDecimal("31.0600"), margin);
		assertEquals("31.06", margin.setScale(2, RoundingMode.HALF_UP).toPlainString());
	}

	@Test
	void suggestedSalePrice_stillUsesMarkupOverCost() {
		BigDecimal suggested = productCostService.calculateSuggestedSalePrice(cost, new BigDecimal("20"));
		assertEquals(new BigDecimal("82.7285"), suggested);
	}
}
