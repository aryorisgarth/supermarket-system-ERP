package com.supermarket.product.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.supermarket.product.entity.ProductLocation;

@Repository
public interface ProductLocationRepository extends JpaRepository<ProductLocation, Long> {
	Optional<ProductLocation> findByProductIdAndLocationId(Long productId, Long locationId);
	List<ProductLocation> findByProductId(Long productId);
	List<ProductLocation> findByLocationId(Long locationId);
}
