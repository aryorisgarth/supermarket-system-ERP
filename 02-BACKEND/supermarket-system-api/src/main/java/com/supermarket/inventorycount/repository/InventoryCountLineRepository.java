package com.supermarket.inventorycount.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.supermarket.inventorycount.entity.InventoryCountLine;

@Repository
public interface InventoryCountLineRepository extends JpaRepository<InventoryCountLine, Long> {

	Optional<InventoryCountLine> findBySessionIdAndProductId(Long sessionId, Long productId);

	Optional<InventoryCountLine> findBySessionIdAndProductIdAndBatchId(Long sessionId, Long productId, Long batchId);

	Optional<InventoryCountLine> findBySessionIdAndProductIdAndBatchIsNull(Long sessionId, Long productId);
}
