package com.supermarket.product.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;


import com.supermarket.product.dto.ProductRequestDTO;
import com.supermarket.product.dto.ProductResponseDTO;

public interface ProductService {

	Page<ProductResponseDTO> findAll(Pageable pageable);

	Page<ProductResponseDTO> findInventory(String search, Short categoryId, Integer supplierId, boolean lowStockOnly, Pageable pageable);

	List<ProductResponseDTO> findActive();

	List<ProductResponseDTO> findByCategory(Short categoryId);

	List<ProductResponseDTO> findBySupplier(Integer supplierId);

	List<ProductResponseDTO> findLowStock();

	List<ProductResponseDTO> searchProducts(String search);

	ProductResponseDTO findByBarcode(String barcode);

	ProductResponseDTO findById(Long id);

	ProductResponseDTO create(ProductRequestDTO request);

	ProductResponseDTO update(Long id, ProductRequestDTO request);

	void deleteById(Long id);

	void toggleStatus(Long id);

	void updateStock(Long id, BigDecimal quantity);
}
