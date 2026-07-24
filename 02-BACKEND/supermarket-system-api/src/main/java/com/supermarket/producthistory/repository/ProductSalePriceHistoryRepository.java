package com.supermarket.producthistory.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.supermarket.producthistory.entity.ProductSalePriceHistory;

public interface ProductSalePriceHistoryRepository
		extends JpaRepository<ProductSalePriceHistory, Long>, JpaSpecificationExecutor<ProductSalePriceHistory> {

	@Query("""
			SELECT h FROM ProductSalePriceHistory h
			JOIN FETCH h.product p
			LEFT JOIN FETCH p.category
			LEFT JOIN FETCH p.brand
			WHERE h.createdAt >= :from AND h.createdAt < :to
			ORDER BY h.createdAt DESC
			""")
	List<ProductSalePriceHistory> findByCreatedAtBetweenOrderByCreatedAtDesc(
			@Param("from") LocalDateTime from,
			@Param("to") LocalDateTime to);
}
