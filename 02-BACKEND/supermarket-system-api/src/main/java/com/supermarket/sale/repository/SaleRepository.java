package com.supermarket.sale.repository;

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
import org.springframework.stereotype.Repository;

import com.supermarket.sale.entity.Sale;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.sale.model.SaleStatus;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

	boolean existsByInvoiceNumberIgnoreCase(String invoiceNumber);

	@EntityGraph(attributePaths = {"customer", "user", "details", "details.product", "details.batch"})
	Optional<Sale> findById(Long id);

	@EntityGraph(attributePaths = {"customer", "user", "details", "details.product", "details.batch"})
	Optional<Sale> findByInvoiceNumberIgnoreCase(String invoiceNumber);

	@EntityGraph(attributePaths = {"customer", "user"})
	List<Sale> findByCustomerIdOrderBySaleDateDesc(Long customerId);

	@Query("SELECT MAX(s.saleDate) FROM Sale s WHERE s.customer.id = :customerId AND s.status = com.supermarket.sale.model.SaleStatus.PAID")
	java.time.LocalDateTime findLastPurchaseDateByCustomerId(@Param("customerId") Long customerId);

	@EntityGraph(attributePaths = {"customer", "user"})
	@Query("""
			SELECT s FROM Sale s
			JOIN s.user u
			LEFT JOIN s.customer c
			WHERE (:search IS NULL OR LOWER(s.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
			AND (:userId IS NULL OR u.id = :userId)
			AND (:status IS NULL OR s.status = :status)
			AND (CAST(:fromDate AS timestamp) IS NULL OR s.saleDate >= :fromDate)
			AND (CAST(:toDate AS timestamp) IS NULL OR s.saleDate <= :toDate)
			""")
	Page<Sale> searchPage(
			@Param("search") String search,
			@Param("userId") Long userId,
			@Param("status") SaleStatus status,
			@Param("fromDate") LocalDateTime fromDate,
			@Param("toDate") LocalDateTime toDate,
			Pageable pageable);

	List<Sale> findAllByOrderBySaleDateDesc();

	@EntityGraph(attributePaths = {"customer", "user"})
	Page<Sale> findAllByOrderBySaleDateDesc(Pageable pageable);

	List<Sale> findByStatusOrderBySaleDateDesc(SaleStatus status);

	@Query("SELECT s FROM Sale s WHERE s.saleDate >= :from AND s.saleDate < :to AND s.status = :status ORDER BY s.saleDate DESC")
	List<Sale> findBySaleDateBetweenAndStatus(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
			@Param("status") SaleStatus status);

	@Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate >= :from AND s.saleDate < :to AND s.status = :status")
	long countBySaleDateBetweenAndStatus(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
			@Param("status") SaleStatus status);

	@Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate >= :from AND s.saleDate < :to AND s.status = :status")
	BigDecimal sumTotalAmountBySaleDateBetweenAndStatus(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
			@Param("status") SaleStatus status);

	@Query(value = """
			SELECT
				(SELECT COALESCE(SUM(s.total_amount), 0)
				 FROM sales s
				 WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to) AS total_sales,
				(SELECT COUNT(s.id)
				 FROM sales s
				 WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to) AS sales_count,
				(SELECT COALESCE(SUM(COALESCE(d.unit_cost, 0) * d.quantity), 0)
				 FROM sale_details d
				 JOIN sales s ON s.id = d.sale_id
				 WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to) AS total_cost
			""", nativeQuery = true)
	Object[] salesKpisNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query(value = """
			SELECT p.id, p.name, SUM(d.quantity) AS qty, SUM(d.subtotal + (d.subtotal * d.tax_applied / 100)) AS revenue
			FROM sale_details d
			JOIN products p ON p.id = d.product_id
			JOIN sales s ON s.id = d.sale_id
			WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to
			GROUP BY p.id, p.name
			ORDER BY qty DESC
			LIMIT :limit
			""", nativeQuery = true)
	List<Object[]> findTopProductsNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
			@Param("limit") int limit);

	@Query(value = """
			SELECT p.id,
			       p.barcode,
			       p.name,
			       COALESCE(SUM(CASE WHEN s.id IS NOT NULL THEN d.quantity ELSE 0 END), 0) AS quantity_sold,
			       COALESCE(SUM(d.subtotal + (d.subtotal * d.tax_applied / 100)), 0) AS revenue,
			       COALESCE(SUM(COALESCE(d.unit_cost, 0) * d.quantity), 0) AS cost,
			       COALESCE(SUM(d.subtotal - (COALESCE(d.unit_cost, 0) * d.quantity)), 0) AS gross_profit
			FROM sale_details d
			JOIN products p ON p.id = d.product_id
			JOIN sales s ON s.id = d.sale_id
			WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to
			GROUP BY p.id, p.barcode, p.name
			ORDER BY gross_profit DESC, revenue DESC
			""", nativeQuery = true)
	List<Object[]> productPerformanceNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query(value = """
			SELECT p.id,
			       p.barcode,
			       p.name,
			       COALESCE(SUM(CASE WHEN s.id IS NOT NULL THEN d.quantity ELSE 0 END), 0) AS quantity_sold,
			       p.current_stock
			FROM products p
			LEFT JOIN sale_details d ON d.product_id = p.id
			LEFT JOIN sales s ON s.id = d.sale_id
				AND s.status = 'PAID'
				AND s.sale_date >= :from
				AND s.sale_date < :to
			WHERE p.is_active = TRUE
			GROUP BY p.id, p.barcode, p.name, p.current_stock
			ORDER BY quantity_sold ASC, p.current_stock DESC
			""", nativeQuery = true)
	List<Object[]> inventoryTurnoverNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query(value = """
			SELECT sp.payment_method,
			       COUNT(sp.id) AS payment_count,
			       COALESCE(SUM(sp.amount), 0) AS total_amount
			FROM sale_payments sp
			JOIN sales s ON s.id = sp.sale_id
			WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to
			GROUP BY sp.payment_method
			ORDER BY total_amount DESC
			""", nativeQuery = true)
	List<Object[]> salesByPaymentMethodNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query(value = """
			SELECT DATE(s.sale_date) AS day, SUM(s.total_amount) AS total
			FROM sales s
			WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to
			GROUP BY DATE(s.sale_date)
			ORDER BY day
			""", nativeQuery = true)
	List<Object[]> sumPaidSalesByDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query(value = """
			SELECT u.full_name, COUNT(s.id) AS count, SUM(s.total_amount) AS total
			FROM sales s
			JOIN users u ON u.id = s.user_id
			WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to
			GROUP BY u.id, u.full_name
			ORDER BY total DESC
			""", nativeQuery = true)
	List<Object[]> sumSalesByUserNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query(value = """
			SELECT c.full_name, c.document_id, COUNT(s.id) AS visits, SUM(s.total_amount) AS spent
			FROM sales s
			JOIN customers c ON c.id = s.customer_id
			WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to
			GROUP BY c.id, c.full_name, c.document_id
			ORDER BY spent DESC
			LIMIT 20
			""", nativeQuery = true)
	List<Object[]> customerRankingNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query("SELECT SUM(sp.amount) FROM SalePayment sp WHERE sp.sale.session.id = :sessionId AND sp.paymentMethod = com.supermarket.sale.model.PaymentMethod.CASH AND sp.sale.status = com.supermarket.sale.model.SaleStatus.PAID")
	BigDecimal sumCashPaymentsBySessionId(@Param("sessionId") Long sessionId);

	@Query("SELECT SUM(sp.amount) FROM SalePayment sp WHERE sp.sale.session.id = :sessionId AND sp.paymentMethod = :paymentMethod AND sp.sale.status = com.supermarket.sale.model.SaleStatus.PAID")
	BigDecimal sumPaymentsBySessionIdAndMethod(@Param("sessionId") Long sessionId, @Param("paymentMethod") PaymentMethod paymentMethod);

	@Query("SELECT SUM(s.changeAmount) FROM Sale s WHERE s.session.id = :sessionId AND s.status = com.supermarket.sale.model.SaleStatus.PAID")
	BigDecimal sumChangeAmountBySessionId(@Param("sessionId") Long sessionId);

	@Query("SELECT COALESCE(SUM(sp.amount), 0) FROM SalePayment sp WHERE sp.sale.saleDate >= :from AND sp.sale.saleDate < :to AND sp.sale.status = com.supermarket.sale.model.SaleStatus.PAID AND sp.paymentMethod = :method")
	BigDecimal sumPaymentsByDateBetweenAndMethod(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("method") PaymentMethod method);

	@Query(value = """
			SELECT b.name, COUNT(s.id) AS sales_count, SUM(d.subtotal + (d.subtotal * d.tax_applied / 100)) AS total
			FROM sale_details d
			JOIN products p ON p.id = d.product_id
			JOIN brands b ON b.id = p.brand_id
			JOIN sales s ON s.id = d.sale_id
			WHERE s.status = 'PAID' AND s.sale_date >= :from AND s.sale_date < :to
			GROUP BY b.id, b.name
			ORDER BY total DESC
			""", nativeQuery = true)
	List<Object[]> salesByBrandNative(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
