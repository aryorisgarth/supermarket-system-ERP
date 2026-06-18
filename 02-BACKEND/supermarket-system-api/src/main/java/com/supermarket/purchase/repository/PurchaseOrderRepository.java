package com.supermarket.purchase.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.supermarket.purchase.entity.PurchaseOrder;
import com.supermarket.purchase.model.PurchaseOrderStatus;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

	Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

	List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(PurchaseOrderStatus status);

	@EntityGraph(attributePaths = {"supplier"})
	@Query("""
			SELECT p FROM PurchaseOrder p LEFT JOIN p.supplier s
			WHERE (:status IS NULL OR p.status = :status)
			AND (:supplierId IS NULL OR s.id = :supplierId)
			AND (:search IS NULL OR LOWER(p.orderNumber) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(p.notes) LIKE LOWER(CONCAT('%', :search, '%')))
			""")
	Page<PurchaseOrder> searchPage(
			@Param("status") PurchaseOrderStatus status,
			@Param("supplierId") Long supplierId,
			@Param("search") String search,
			Pageable pageable);

	@Query("SELECT p FROM PurchaseOrder p LEFT JOIN FETCH p.items i LEFT JOIN FETCH i.product WHERE p.id = :id")
	Optional<PurchaseOrder> findByIdWithItems(Long id);

	@Query("""
			SELECT COALESCE(SUM(p.subtotal), 0)
			FROM PurchaseOrder p
			WHERE p.status = com.supermarket.purchase.model.PurchaseOrderStatus.RECEIVED
			  AND p.receivedAt >= :from
			  AND p.receivedAt < :to
			""")
	BigDecimal sumReceivedPurchasesBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	long countByStatusAndCreatedAtBetween(PurchaseOrderStatus status, LocalDateTime start, LocalDateTime end);

	@Query(value = """
			SELECT b.name, COUNT(DISTINCT p.id) AS purchases_count, SUM(i.line_total) AS total
			FROM purchase_order_items i
			JOIN products pr ON pr.id = i.product_id
			JOIN brands b ON b.id = pr.brand_id
			JOIN purchase_orders p ON p.id = i.purchase_order_id
			WHERE p.status = 'RECEIVED' AND p.received_at >= :from AND p.received_at < :to
			GROUP BY b.id, b.name
			ORDER BY total DESC
			""", nativeQuery = true)
	List<Object[]> purchasesByBrandNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
