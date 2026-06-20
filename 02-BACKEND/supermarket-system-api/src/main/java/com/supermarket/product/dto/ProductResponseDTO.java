package com.supermarket.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.supermarket.category.dto.CategoryResponseDTO;
import com.supermarket.supplier.dto.SupplierResponseDTO;
import com.supermarket.tax.dto.TaxCategoryResponseDTO;
import com.supermarket.brand.dto.BrandResponseDTO;

public record ProductResponseDTO(
	Long id,
	String barcode,
	String name,
	String description,
	BigDecimal purchasePrice,
	BigDecimal salePrice,
	BigDecimal currentStock,
	BigDecimal minimumStock,
	TaxCategoryResponseDTO taxCategory,
	Boolean isActive,
	CategoryResponseDTO category,
	SupplierResponseDTO supplier,
	List<ProductPurchasePackDTO> purchasePacks,
	String uomBase,
	List<ProductUomConversionResponseDTO> uomConversions,
	ProductUomConversionResponseDTO scannedConversion,
	Boolean requiresBatch,
	Boolean requiresExpiration,
	BrandResponseDTO brand,
	BigDecimal minStockExhibicion,
	LocalDateTime createdAt,
	LocalDateTime updatedAt,
	BigDecimal prefilledQuantity
) {
}
