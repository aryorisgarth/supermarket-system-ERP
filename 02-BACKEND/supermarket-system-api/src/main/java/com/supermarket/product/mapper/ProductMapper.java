package com.supermarket.product.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.supermarket.category.dto.CategoryResponseDTO;
import com.supermarket.product.dto.ProductPurchasePackDTO;
import com.supermarket.product.dto.ProductRequestDTO;
import com.supermarket.product.dto.ProductResponseDTO;
import com.supermarket.product.dto.ProductUomConversionResponseDTO;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductPurchasePack;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.product.repository.ProductPurchasePackRepository;
import com.supermarket.supplier.dto.SupplierResponseDTO;
import com.supermarket.tax.dto.TaxCategoryResponseDTO;
import com.supermarket.brand.dto.BrandResponseDTO;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductMapper {

	private final ProductPurchasePackRepository productPurchasePackRepository;

	public Product toEntity(ProductRequestDTO dto) {
		Product product = new Product();
		apply(product, dto);
		return product;
	}

	public ProductResponseDTO toResponse(Product entity) {
		List<ProductPurchasePackDTO> packs = productPurchasePackRepository
				.findByProductIdOrderBySortOrderAscLabelAsc(entity.getId())
				.stream()
				.map(this::toPackDto)
				.toList();

		CategoryResponseDTO categoryResponse = new CategoryResponseDTO(
			entity.getCategory().getId(),
			entity.getCategory().getName(),
			entity.getCategory().getDescription(),
			entity.getCategory().getDefaultRequiresBatch(),
			entity.getCategory().getDefaultRequiresExpiration()
		);

		SupplierResponseDTO supplierResponse = new SupplierResponseDTO(
			entity.getSupplier().getId(),
			entity.getSupplier().getCompanyName(),
			entity.getSupplier().getContactName(),
			entity.getSupplier().getPhone(),
			entity.getSupplier().getEmail(),
			entity.getSupplier().getAddress(),
			entity.getSupplier().getCreatedAt()
		);

		TaxCategoryResponseDTO taxResponse = null;
		if (entity.getTaxCategory() != null) {
			taxResponse = new TaxCategoryResponseDTO(
				entity.getTaxCategory().getId(),
				entity.getTaxCategory().getName(),
				entity.getTaxCategory().getPercentage(),
				entity.getTaxCategory().getIsActive()
			);
		}

		List<ProductUomConversionResponseDTO> uomConversions = entity.getUomConversions() != null
				? entity.getUomConversions().stream().map(this::toConversionDto).toList()
				: List.of();

		BrandResponseDTO brandResponse = null;
		if (entity.getBrand() != null) {
			brandResponse = new BrandResponseDTO(
				entity.getBrand().getId(),
				entity.getBrand().getName(),
				entity.getBrand().getIsActive(),
				entity.getBrand().getCreatedAt(),
				entity.getBrand().getUpdatedAt()
			);
		}

		return new ProductResponseDTO(
			entity.getId(),
			entity.getBarcode(),
			entity.getName(),
			entity.getDescription(),
			entity.getPurchasePrice(),
			entity.getSalePrice(),
			entity.getCurrentStock(),
			entity.getMinimumStock(),
			taxResponse,
			entity.getIsActive(),
			categoryResponse,
			supplierResponse,
			packs,
			entity.getUomBase(),
			uomConversions,
			null,
			entity.getRequiresBatch(),
			entity.getRequiresExpiration(),
			brandResponse,
			entity.getMinStockExhibicion(),
			entity.getCreatedAt(),
			entity.getUpdatedAt(),
			null
		);
	}

	public ProductUomConversionResponseDTO toConversionDto(ProductUomConversion conversion) {
		if (conversion == null) {
			return null;
		}
		return new ProductUomConversionResponseDTO(
				conversion.getId(),
				conversion.getBarcode(),
				conversion.getLabel(),
				conversion.getFactor(),
				conversion.getSalePrice(),
				conversion.getIsPurchaseDefault(),
				conversion.getIsSaleDefault());
	}

	public ProductPurchasePackDTO toPackDto(ProductPurchasePack pack) {
		return new ProductPurchasePackDTO(
				pack.getId(),
				pack.getLabel(),
				pack.getFactor(),
				pack.getIsDefault(),
				pack.getSortOrder());
	}

	public void apply(Product entity, ProductRequestDTO dto) {
		entity.setBarcode(dto.getBarcode());
		entity.setName(dto.getName());
		entity.setDescription(dto.getDescription());
		entity.setPurchasePrice(dto.getPurchasePrice());
		entity.setSalePrice(dto.getSalePrice());
		entity.setCurrentStock(dto.getCurrentStock());
		entity.setMinimumStock(dto.getMinimumStock());
		entity.setIsActive(dto.getIsActive());
		entity.setRequiresBatch(dto.getRequiresBatch() != null ? dto.getRequiresBatch() : false);
		entity.setRequiresExpiration(dto.getRequiresExpiration() != null ? dto.getRequiresExpiration() : false);
		if (dto.getMinStockExhibicion() != null) {
			entity.setMinStockExhibicion(dto.getMinStockExhibicion());
		}
	}
}
