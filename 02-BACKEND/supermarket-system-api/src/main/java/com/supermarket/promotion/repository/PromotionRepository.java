package com.supermarket.promotion.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.promotion.entity.Promotion;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

	Page<Promotion> findAllByOrderByStartDateDesc(Pageable pageable);

	@Query("""
			SELECT p FROM Promotion p
			LEFT JOIN p.product prod
			LEFT JOIN p.category cat
			WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(prod.name) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(cat.name) LIKE LOWER(CONCAT('%', :search, '%')))
			AND (:activeOnly = false OR p.isActive = true)
			AND (:inactiveOnly = false OR p.isActive = false)
			""")
	Page<Promotion> searchPage(
			@Param("search") String search,
			@Param("activeOnly") boolean activeOnly,
			@Param("inactiveOnly") boolean inactiveOnly,
			Pageable pageable);

	@Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.startDate <= :today AND p.endDate >= :today "
			+ "AND (p.product.id = :productId OR p.category.id = :categoryId) "
			+ "ORDER BY p.type ASC")
	List<Promotion> findActiveForProduct(
			@Param("productId") Long productId,
			@Param("categoryId") Long categoryId,
			@Param("today") LocalDate today);

	@Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.startDate <= :today AND p.endDate >= :today "
			+ "AND p.expiryDaysTrigger IS NOT NULL "
			+ "ORDER BY p.type ASC")
	List<Promotion> findExpiryTriggered(@Param("today") LocalDate today);
}
