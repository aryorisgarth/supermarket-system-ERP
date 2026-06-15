package com.supermarket.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.supermarket.product.entity.ProductPurchasePack;

public interface ProductPurchasePackRepository extends JpaRepository<ProductPurchasePack, Long> {

	List<ProductPurchasePack> findByProductIdOrderBySortOrderAscLabelAsc(Long productId);

	Optional<ProductPurchasePack> findByIdAndProductId(Long id, Long productId);

	void deleteByProductId(Long productId);
}
