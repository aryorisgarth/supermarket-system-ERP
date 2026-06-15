package com.supermarket.product.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.product.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

	@EntityGraph(attributePaths = {"category", "supplier", "taxCategory"})
	Page<Product> findAll(Pageable pageable);

	@EntityGraph(attributePaths = {"category", "supplier", "taxCategory"})
	@Query("""
			SELECT p FROM Product p
			LEFT JOIN p.category cat
			LEFT JOIN p.supplier sup
			WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(cat.name) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(sup.companyName) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(sup.contactName) LIKE LOWER(CONCAT('%', :search, '%')))
			AND (:categoryId IS NULL OR p.category.id = :categoryId)
			AND (:supplierId IS NULL OR p.supplier.id = :supplierId)
			AND (:lowStockOnly = false OR p.currentStock < p.minimumStock)
			""")
	Page<Product> searchInventory(
			@Param("search") String search,
			@Param("categoryId") Short categoryId,
			@Param("supplierId") Integer supplierId,
			@Param("lowStockOnly") boolean lowStockOnly,
			Pageable pageable);

	@EntityGraph(attributePaths = {"category", "supplier", "taxCategory"})
	List<Product> findByIsActiveTrueOrderByBarcodeAsc();

	@EntityGraph(attributePaths = {"category", "supplier", "taxCategory"})
	List<Product> findByCategoryIdOrderByBarcodeAsc(Short categoryId);

	@EntityGraph(attributePaths = {"category", "supplier", "taxCategory"})
	List<Product> findBySupplierIdOrderByBarcodeAsc(Integer supplierId);

	@EntityGraph(attributePaths = {"category", "supplier", "taxCategory"})
	@Query("SELECT p FROM Product p WHERE p.name LIKE CONCAT('%', :search, '%') OR p.barcode LIKE CONCAT('%', :search, '%')")
	List<Product> searchProducts(@Param("search") String search);

	@EntityGraph(attributePaths = {"category", "supplier", "taxCategory"})
	@Query("SELECT p FROM Product p WHERE p.currentStock < p.minimumStock ORDER BY p.barcode ASC")
	List<Product> findLowStockOrderByBarcodeAsc();

	List<Product> findAllByOrderByBarcodeAsc();

	Optional<Product> findByBarcode(String barcode);

	boolean existsByBarcode(String barcode);

	boolean existsByBarcodeAndIdNot(String barcode, Long id);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT p FROM Product p WHERE p.id = :id")
	Optional<Product> findByIdForUpdate(@Param("id") Long id);

	@Query(value = "SELECT COALESCE(SUM(p.current_stock * p.purchase_price), 0) FROM products p WHERE p.is_active = TRUE", nativeQuery = true)
	BigDecimal sumInventoryPurchaseValue();

	@Query(value = "SELECT COUNT(*) FROM products p WHERE p.current_stock <= p.minimum_stock AND p.is_active = TRUE", nativeQuery = true)
	long countCriticalStockProducts();

	@Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isActive = :isActive ORDER BY p.barcode ASC")
	List<Product> findByCategoryIdAndIsActive(@Param("categoryId") Short categoryId, @Param("isActive") Boolean isActive);

	@Query("SELECT p FROM Product p WHERE p.supplier.id = :supplierId AND p.isActive = :isActive ORDER BY p.barcode ASC")
	List<Product> findBySupplierIdAndIsActive(@Param("supplierId") Integer supplierId, @Param("isActive") Boolean isActive);

	@Query(value = "SELECT COUNT(*) FROM product_batches WHERE product_id = :productId", nativeQuery = true)
	long countBatchesByProductId(@Param("productId") Long productId);

	@Query(value = "SELECT COUNT(*) FROM sale_details WHERE product_id = :productId", nativeQuery = true)
	long countSalesByProductId(@Param("productId") Long productId);
	@Query(value = """
			SELECT p.barcode, p.name, p.current_stock, p.minimum_stock, c.name AS category
			FROM products p
			JOIN categories c ON c.id = p.category_id
			WHERE p.current_stock <= p.minimum_stock AND p.is_active = TRUE
			ORDER BY p.current_stock ASC
			""", nativeQuery = true)
	List<Object[]> findLowStockProductsNative();

	boolean existsByBrandId(Long brandId);
}

