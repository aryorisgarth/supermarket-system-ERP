package com.supermarket.producthistory.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.producthistory.dto.ProductCostHistoryResponseDTO;
import com.supermarket.producthistory.dto.ProductSalePriceHistoryResponseDTO;
import com.supermarket.producthistory.model.ProductCostHistoryReason;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;
import com.supermarket.producthistory.service.ProductHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class ProductHistoryController {

	private final ProductHistoryService productHistoryService;

	@GetMapping("/costs")
	public ResponseEntity<Page<ProductCostHistoryResponseDTO>> getCostHistory(
			@RequestParam(required = false) Long productId,
			@RequestParam(required = false) Integer supplierId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
			@RequestParam(required = false) ProductCostHistoryReason reason,
			@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
		return ResponseEntity.ok(productHistoryService.findCostHistory(productId, supplierId, from, to, reason, pageable));
	}

	@GetMapping("/sale-prices")
	public ResponseEntity<Page<ProductSalePriceHistoryResponseDTO>> getSalePriceHistory(
			@RequestParam(required = false) Long productId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
			@RequestParam(required = false) ProductSalePriceHistoryReason reason,
			@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
		return ResponseEntity.ok(productHistoryService.findSalePriceHistory(productId, from, to, reason, pageable));
	}
}
