package com.supermarket.product.service;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.supermarket.product.dto.LocationRequestDTO;
import com.supermarket.product.dto.LocationResponseDTO;
import com.supermarket.product.dto.ProductLocationResponseDTO;

public interface LocationService {
	List<LocationResponseDTO> findAll();
	Page<LocationResponseDTO> findPage(String search, Pageable pageable);
	LocationResponseDTO findById(Long id);
	LocationResponseDTO create(LocationRequestDTO request);
	LocationResponseDTO update(Long id, LocationRequestDTO request);
	void deleteById(Long id);
	List<ProductLocationResponseDTO> getProductLocations(Long productId);
	void updateProductLocationStock(Long productId, Long locationId, BigDecimal stock);
	void transferStock(Long productId, Long fromLocationId, Long toLocationId, BigDecimal quantity);
	List<ProductLocationResponseDTO> getProductsByLocation(Long locationId);
	void removeProductLocation(Long productId, Long locationId);
}
