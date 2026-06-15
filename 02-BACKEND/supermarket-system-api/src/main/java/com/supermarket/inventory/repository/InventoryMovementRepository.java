package com.supermarket.inventory.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.inventory.entity.InventoryMovement;
import com.supermarket.inventory.model.InventoryMovementType;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

	@EntityGraph(attributePaths = {"product", "user", "batch"})
	Page<InventoryMovement> findAll(Pageable pageable);

	@EntityGraph(attributePaths = {"product", "user", "batch"})
	List<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

	@EntityGraph(attributePaths = {"product", "user", "batch"})
	@Query("SELECT m FROM InventoryMovement m WHERE m.createdAt >= :from AND m.createdAt < :to ORDER BY m.createdAt DESC")
	List<InventoryMovement> findBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query(value = """
			SELECT m.created_at, p.name, m.movement_type, m.quantity, m.previous_stock, m.new_stock, u.full_name, m.unit_cost, m.total_cost
			FROM inventory_movements m
			JOIN products p ON p.id = m.product_id
			JOIN users u ON u.id = m.user_id
			WHERE m.created_at >= :from AND m.created_at < :to
			ORDER BY m.created_at DESC
			""", nativeQuery = true)
	List<Object[]> inventoryMovementsReportNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query("""
			SELECT m
			FROM InventoryMovement m
			JOIN FETCH m.product
			JOIN FETCH m.user
			LEFT JOIN FETCH m.batch
			WHERE m.product.id = :productId
			  AND m.createdAt >= :from
			  AND m.createdAt < :to
			ORDER BY m.createdAt ASC, m.id ASC
			""")
	List<InventoryMovement> findKardexByProductAndDateRange(
			@Param("productId") Long productId,
			@Param("from") LocalDateTime from,
			@Param("to") LocalDateTime to);

	List<InventoryMovement> findByMovementTypeOrderByCreatedAtDesc(InventoryMovementType type);
}
