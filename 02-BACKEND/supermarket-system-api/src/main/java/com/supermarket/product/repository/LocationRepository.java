package com.supermarket.product.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.supermarket.product.entity.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
	Optional<Location> findByLocationCode(String locationCode);
	List<Location> findByIsPisoVenta(Boolean isPisoVenta);
}
