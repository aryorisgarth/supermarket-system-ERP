package com.supermarket.producthistory.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.producthistory.dto.ProductCostHistoryResponseDTO;
import com.supermarket.producthistory.dto.ProductSalePriceHistoryResponseDTO;
import com.supermarket.producthistory.model.ProductCostHistoryReason;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;

public interface ProductHistoryService {

	Page<ProductCostHistoryResponseDTO> findCostHistory(Long productId, Integer supplierId, LocalDate from, LocalDate to,
			ProductCostHistoryReason reason, Pageable pageable);

	Page<ProductSalePriceHistoryResponseDTO> findSalePriceHistory(Long productId, LocalDate from, LocalDate to,
			ProductSalePriceHistoryReason reason, Pageable pageable);
}
