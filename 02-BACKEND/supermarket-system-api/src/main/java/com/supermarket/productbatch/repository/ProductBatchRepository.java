package com.supermarket.productbatch.repository;

import java.time.LocalDate;
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

import com.supermarket.productbatch.entity.ProductBatch;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {

	List<ProductBatch> findByProductIdOrderByExpirationDateAsc(Long productId);

	@EntityGraph(attributePaths = {"product"})
	@Query("""
			SELECT b FROM ProductBatch b JOIN b.product p
			WHERE (:search IS NULL OR LOWER(b.batchCode) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')))
			AND (:expiryState IS NULL OR :expiryState = 'all'
				OR (:expiryState = 'expired' AND b.currentQuantity > 0 AND b.expirationDate < :today)
				OR (:expiryState = 'critical' AND b.currentQuantity > 0 AND b.expirationDate >= :today AND b.expirationDate <= :in7)
				OR (:expiryState = 'warning' AND b.currentQuantity > 0 AND b.expirationDate > :in7 AND b.expirationDate <= :in15)
				OR (:expiryState = 'notice' AND b.currentQuantity > 0 AND b.expirationDate > :in15 AND b.expirationDate <= :in30)
				OR (:expiryState = 'ok' AND b.currentQuantity > 0 AND b.expirationDate > :in30))
			""")
	Page<ProductBatch> searchPage(
			@Param("search") String search,
			@Param("expiryState") String expiryState,
			@Param("today") LocalDate today,
			@Param("in7") LocalDate in7,
			@Param("in15") LocalDate in15,
			@Param("in30") LocalDate in30,
			Pageable pageable);

	Optional<ProductBatch> findByIdAndProductId(Long id, Long productId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT b FROM ProductBatch b WHERE b.id = :id AND b.product.id = :productId")
	Optional<ProductBatch> findByIdAndProductIdForUpdate(@Param("id") Long id, @Param("productId") Long productId);

	boolean existsByBatchCodeIgnoreCase(String batchCode);

	boolean existsByBatchCodeIgnoreCaseAndIdNot(String batchCode, Long id);

	@Query("SELECT b FROM ProductBatch b WHERE b.product.id = :productId AND b.expirationDate <= :until ORDER BY b.expirationDate ASC")
	List<ProductBatch> findByProductIdAndExpirationDateBeforeEqual(@Param("productId") Long productId,
			@Param("until") LocalDate until);

	@Query(value = "SELECT COUNT(*) FROM sale_details WHERE batch_id = :batchId", nativeQuery = true)
	long countSaleDetailsByBatchId(@Param("batchId") Long batchId);

	@Query("SELECT b FROM ProductBatch b WHERE b.product.id = :productId AND b.batchCode LIKE CONCAT('%', :search, '%') ORDER BY b.expirationDate ASC")
	List<ProductBatch> searchByProduct(@Param("productId") Long productId, @Param("search") String search);

	@Query("SELECT b FROM ProductBatch b WHERE b.currentQuantity > 0 AND b.expirationDate <= :until ORDER BY b.expirationDate ASC")
	List<ProductBatch> findActiveExpiringUntil(@Param("until") LocalDate until);

	@Query("SELECT b FROM ProductBatch b WHERE b.currentQuantity > 0 AND b.expirationDate < :today ORDER BY b.expirationDate ASC")
	List<ProductBatch> findActiveExpired(@Param("today") LocalDate today);

	@Query("SELECT COUNT(b) FROM ProductBatch b WHERE b.currentQuantity > 0 AND b.product.id = :productId AND b.expirationDate >= :today")
	long countSellableBatches(@Param("productId") Long productId, @Param("today") LocalDate today);

	@Query("SELECT COUNT(b) FROM ProductBatch b WHERE b.currentQuantity > 0 AND b.product.id = :productId")
	long countBatchesWithStock(@Param("productId") Long productId);
}
