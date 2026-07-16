package com.supermarket.producthistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.supermarket.producthistory.entity.ProductCostHistory;

public interface ProductCostHistoryRepository
		extends JpaRepository<ProductCostHistory, Long>, JpaSpecificationExecutor<ProductCostHistory> {
}
