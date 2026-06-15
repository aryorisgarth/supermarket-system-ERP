package com.supermarket.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.supermarket.product.entity.ProductUomConversion;

@Repository
public interface ProductUomConversionRepository extends JpaRepository<ProductUomConversion, Long> {

	Optional<ProductUomConversion> findByIdAndProductId(Long id, Long productId);

	Optional<ProductUomConversion> findByBarcode(String barcode);

	List<ProductUomConversion> findByProduct_IdOrderByLabelAsc(Long productId);
}
