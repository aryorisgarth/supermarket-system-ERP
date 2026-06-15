package com.supermarket.product.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import com.supermarket.exception.ConflictException;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.product.dto.ProductRequestDTO;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.category.repository.CategoryRepository;
import com.supermarket.supplier.repository.SupplierRepository;
import com.supermarket.tax.repository.TaxCategoryRepository;
import com.supermarket.product.mapper.ProductMapper;
import com.supermarket.product.repository.ProductUomConversionRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductServiceImpl Unit Tests")
class ProductServiceImplTest {

	@Mock private ProductRepository productRepository;
	@Mock private CategoryRepository categoryRepository;
	@Mock private SupplierRepository supplierRepository;
	@Mock private TaxCategoryRepository taxCategoryRepository;
	@Mock private ProductMapper productMapper;
	@Mock private ProductUomConversionRepository productUomConversionRepository;

	@InjectMocks
	private ProductServiceImpl productService;

	@Test
	@DisplayName("create lanza CONFLICT si el código de barras ya existe")
	void create_duplicateBarcode_throwsConflict() {
		ProductRequestDTO request = sampleRequest();
		when(productRepository.existsByBarcode("7501234567890")).thenReturn(true);

		ConflictException ex = assertThrows(ConflictException.class,
				() -> productService.create(request));

		assertEquals(HttpStatus.CONFLICT, ex.getStatus());
		verify(productRepository, never()).save(any());
	}

	@Test
	@DisplayName("findById lanza NOT_FOUND si el producto no existe")
	void findById_notFound_throwsNotFound() {
		when(productRepository.findById(99L)).thenReturn(Optional.empty());

		ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
				() -> productService.findById(99L));

		assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
	}

	private static ProductRequestDTO sampleRequest() {
		ProductRequestDTO dto = new ProductRequestDTO();
		dto.setBarcode("7501234567890");
		dto.setName("Arroz 1kg");
		dto.setPurchasePrice(new BigDecimal("10.00"));
		dto.setSalePrice(new BigDecimal("15.00"));
		dto.setCurrentStock(new BigDecimal("100"));
		dto.setMinimumStock(new BigDecimal("5"));
		dto.setCategoryId((short) 1);
		dto.setSupplierId(1);
		dto.setTaxCategoryId(1);
		return dto;
	}
}
