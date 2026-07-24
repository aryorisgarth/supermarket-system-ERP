package com.supermarket.product.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.supermarket.product.entity.ProductLocation;

@Repository
public interface ProductLocationRepository extends JpaRepository<ProductLocation, Long> {
	Optional<ProductLocation> findByProductIdAndLocationId(Long productId, Long locationId);
	List<ProductLocation> findByProductId(Long productId);

	@Query("""
			SELECT pl FROM ProductLocation pl
			JOIN FETCH pl.location
			WHERE pl.product.id IN :productIds
			""")
	List<ProductLocation> findByProductIdIn(@Param("productIds") List<Long> productIds);

	@Query("""
			SELECT pl FROM ProductLocation pl
			JOIN FETCH pl.product
			JOIN FETCH pl.location
			WHERE pl.location.id = :locationId
			""")
	List<ProductLocation> findByLocationId(@Param("locationId") Long locationId);

	@Query("""
			SELECT COALESCE(SUM(pl.stock), 0)
			FROM ProductLocation pl
			WHERE pl.product.id = :productId
			  AND pl.location.isPisoVenta = true
			""")
	BigDecimal sumExhibitionStockByProductId(@Param("productId") Long productId);
}
