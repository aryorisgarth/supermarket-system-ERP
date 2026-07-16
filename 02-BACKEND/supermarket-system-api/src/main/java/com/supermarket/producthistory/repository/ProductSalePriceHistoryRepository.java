package com.supermarket.producthistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.supermarket.producthistory.entity.ProductSalePriceHistory;

public interface ProductSalePriceHistoryRepository
		extends JpaRepository<ProductSalePriceHistory, Long>, JpaSpecificationExecutor<ProductSalePriceHistory> {
}
