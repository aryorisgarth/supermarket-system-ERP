package com.supermarket.product.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.supermarket.category.entity.Category;
import com.supermarket.category.repository.CategoryRepository;
import com.supermarket.exception.BadRequestException;
import com.supermarket.exception.ConflictException;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.exception.UnauthorizedException;
import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.product.dto.ProductPurchasePackRequestDTO;
import com.supermarket.product.dto.ProductRequestDTO;
import com.supermarket.product.dto.ProductResponseDTO;
import com.supermarket.product.dto.ProductUomConversionResponseDTO;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductPurchasePack;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.product.mapper.ProductMapper;
import com.supermarket.product.repository.ProductPurchasePackRepository;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.product.repository.ProductUomConversionRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.supplier.repository.SupplierRepository;
import com.supermarket.tax.entity.TaxCategory;
import com.supermarket.tax.repository.TaxCategoryRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.brand.entity.Brand;
import com.supermarket.brand.repository.BrandRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

	private final ProductRepository productRepository;
	private final ProductPurchasePackRepository productPurchasePackRepository;
	private final CategoryRepository categoryRepository;
	private final SupplierRepository supplierRepository;
	private final TaxCategoryRepository taxCategoryRepository;
	private final ProductMapper productMapper;
	private final UserRepository userRepository;
	private final InventoryLedger inventoryLedger;
	private final ProductUomConversionRepository productUomConversionRepository;
	private final BrandRepository brandRepository;

	@Override
	public org.springframework.data.domain.Page<ProductResponseDTO> findAll(org.springframework.data.domain.Pageable pageable) {
		return productRepository.findAll(pageable).map(productMapper::toResponse);
	}

	@Override
	public Page<ProductResponseDTO> findInventory(String search, Short categoryId, Integer supplierId,
			boolean lowStockOnly, Pageable pageable) {
		String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
		return productRepository
				.searchInventory(normalizedSearch, categoryId, supplierId, lowStockOnly, pageable)
				.map(productMapper::toResponse);
	}

	@Override
	public List<ProductResponseDTO> findActive() {
		return productRepository.findByIsActiveTrueOrderByBarcodeAsc().stream()
				.map(productMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductResponseDTO> findByCategory(Short categoryId) {
		return productRepository.findByCategoryIdOrderByBarcodeAsc(categoryId).stream()
				.map(productMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductResponseDTO> findBySupplier(Integer supplierId) {
		return productRepository.findBySupplierIdOrderByBarcodeAsc(supplierId).stream()
				.map(productMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductResponseDTO> findLowStock() {
		return productRepository.findLowStockOrderByBarcodeAsc().stream()
				.map(productMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductResponseDTO> searchProducts(String search) {
		return productRepository.searchProducts(search).stream()
				.map(productMapper::toResponse)
				.toList();
	}

	@Override
	public ProductResponseDTO findByBarcode(String barcode) {
		var uomOpt = productUomConversionRepository.findByBarcode(barcode.trim());
		if (uomOpt.isPresent()) {
			ProductUomConversion conversion = uomOpt.get();
			Product product = conversion.getProduct();
			ProductResponseDTO response = productMapper.toResponse(product);
			ProductUomConversionResponseDTO scanned = productMapper.toConversionDto(conversion);
			return new ProductResponseDTO(
				response.id(),
				response.barcode(),
				response.name(),
				response.description(),
				response.purchasePrice(),
				response.salePrice(),
				response.currentStock(),
				response.minimumStock(),
				response.taxCategory(),
				response.isActive(),
				response.category(),
				response.supplier(),
				response.purchasePacks(),
				response.uomBase(),
				response.uomConversions(),
				scanned,
				response.requiresBatch(),
				response.requiresExpiration(),
				response.brand(),
				response.minStockExhibicion(),
				response.createdAt(),
				response.updatedAt()
			);
		}

		Product product = productRepository.findByBarcode(barcode.trim())
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));
		return productMapper.toResponse(product);
	}

	@Override
	public ProductResponseDTO findById(Long id) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));
		return productMapper.toResponse(product);
	}

	@Override
	@Transactional
	public ProductResponseDTO create(ProductRequestDTO request) {
		normalize(request);
		
		if (productRepository.existsByBarcode(request.getBarcode())) {
			throw new ConflictException("Product barcode already exists");
		}

		Category category = categoryRepository.findById(request.getCategoryId())
				.orElseThrow(() -> new BadRequestException("Category not found"));

		Supplier supplier = supplierRepository.findById(request.getSupplierId())
				.orElseThrow(() -> new BadRequestException("Supplier not found"));

		TaxCategory taxCategory = taxCategoryRepository.findById(request.getTaxCategoryId())
				.orElseThrow(() -> new BadRequestException("Tax category not found"));

		Brand brand = null;
		if (request.getBrandId() != null) {
			brand = brandRepository.findById(request.getBrandId())
					.orElseThrow(() -> new BadRequestException("Brand not found"));
		}

		Product product = productMapper.toEntity(request);
		product.setCategory(category);
		product.setSupplier(supplier);
		product.setTaxCategory(taxCategory);
		product.setBrand(brand);
		
		if (request.getRequiresBatch() == null) {
			product.setRequiresBatch(category.getDefaultRequiresBatch() != null ? category.getDefaultRequiresBatch() : false);
		} else {
			product.setRequiresBatch(request.getRequiresBatch());
		}
		
		if (request.getRequiresExpiration() == null) {
			product.setRequiresExpiration(category.getDefaultRequiresExpiration() != null ? category.getDefaultRequiresExpiration() : false);
		} else {
			product.setRequiresExpiration(request.getRequiresExpiration());
		}

		product.setCreatedAt(LocalDateTime.now());
		product.setUpdatedAt(LocalDateTime.now());

		Product saved = productRepository.save(product);
		syncPurchasePacks(saved, request.getPurchasePacks());
		return productMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public ProductResponseDTO update(Long id, ProductRequestDTO request) {
		normalize(request);
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		String barcode = request.getBarcode();
		if (!product.getBarcode().equals(barcode) && productRepository.existsByBarcodeAndIdNot(barcode, id)) {
			throw new ConflictException("Product barcode already exists");
		}

		Category category = categoryRepository.findById(request.getCategoryId())
				.orElseThrow(() -> new BadRequestException("Category not found"));

		Supplier supplier = supplierRepository.findById(request.getSupplierId())
				.orElseThrow(() -> new BadRequestException("Supplier not found"));

		TaxCategory taxCategory = taxCategoryRepository.findById(request.getTaxCategoryId())
				.orElseThrow(() -> new BadRequestException("Tax category not found"));

		Brand brand = null;
		if (request.getBrandId() != null) {
			brand = brandRepository.findById(request.getBrandId())
					.orElseThrow(() -> new BadRequestException("Brand not found"));
		}

		productMapper.apply(product, request);
		product.setCategory(category);
		product.setSupplier(supplier);
		product.setTaxCategory(taxCategory);
		product.setBrand(brand);
		
		if (request.getRequiresBatch() == null) {
			product.setRequiresBatch(category.getDefaultRequiresBatch() != null ? category.getDefaultRequiresBatch() : false);
		} else {
			product.setRequiresBatch(request.getRequiresBatch());
		}
		
		if (request.getRequiresExpiration() == null) {
			product.setRequiresExpiration(category.getDefaultRequiresExpiration() != null ? category.getDefaultRequiresExpiration() : false);
		} else {
			product.setRequiresExpiration(request.getRequiresExpiration());
		}

		product.setUpdatedAt(LocalDateTime.now());

		Product saved = productRepository.save(product);
		syncPurchasePacks(saved, request.getPurchasePacks());
		return productMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Long id) {
		if (!productRepository.existsById(id)) {
			throw new ResourceNotFoundException("Product not found");
		}

		if (productRepository.countBatchesByProductId(id) > 0) {
			throw new ConflictException(
					"Product cannot be deleted because it has associated batches");
		}

		if (productRepository.countSalesByProductId(id) > 0) {
			throw new ConflictException(
					"Product cannot be deleted because it has associated sales");
		}

		try {
			productRepository.deleteById(id);
		} catch (DataIntegrityViolationException ex) {
			throw new ConflictException(
					"Product cannot be deleted due to related data in database");
		}
	}

	@Override
	@Transactional
	public void toggleStatus(Long id) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		product.setIsActive(!product.getIsActive());
		product.setUpdatedAt(LocalDateTime.now());
		productRepository.save(product);
	}

	@Override
	@Transactional
	public void updateStock(Long id, BigDecimal quantity) {
		Product product = productRepository.findByIdForUpdate(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		if (quantity.compareTo(BigDecimal.ZERO) < 0) {
			throw new BadRequestException("Stock quantity cannot be negative");
		}

		BigDecimal delta = quantity.subtract(product.getCurrentStock());
		if (delta.compareTo(BigDecimal.ZERO) == 0) {
			return;
		}
		byte factor = delta.compareTo(BigDecimal.ZERO) > 0 ? (byte) 1 : (byte) -1;
		inventoryLedger.record(currentUser(), product, null, InventoryMovementType.ADJUSTMENT, delta.abs(),
				factor, product.getId(), null, "PRODUCT_STOCK_UPDATE", product.getPurchasePrice(), "Manual stock update");
	}

	private User currentUser() {
		return userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new UnauthorizedException("User not found"));
	}

	private static void normalize(ProductRequestDTO request) {
		request.setBarcode(request.getBarcode().trim());
		request.setName(request.getName().trim());
		if (request.getDescription() != null) {
			String d = request.getDescription().trim();
			request.setDescription(d.isEmpty() ? null : d);
		}
	}

	private void syncPurchasePacks(Product product, List<ProductPurchasePackRequestDTO> packs) {
		
		productPurchasePackRepository.deleteByProductId(product.getId());
		productPurchasePackRepository.flush();

		List<ProductPurchasePackRequestDTO> source = packs == null || packs.isEmpty()
				? defaultPackRequest()
				: packs;

		boolean hasDefault = source.stream().anyMatch(p -> Boolean.TRUE.equals(p.getIsDefault()));
		List<ProductPurchasePack> entities = new ArrayList<>();
		Set<String> seenLabels = new HashSet<>();
		for (int i = 0; i < source.size(); i++) {
			ProductPurchasePackRequestDTO dto = source.get(i);
			if (dto.getLabel() == null || dto.getLabel().isBlank()) {
				continue;
			}
			if (dto.getFactor() == null || dto.getFactor().compareTo(BigDecimal.ZERO) <= 0) {
				throw new BadRequestException("Purchase pack factor must be greater than zero");
			}
			String label = dto.getLabel().trim().toUpperCase();
			if (!seenLabels.add(label)) {
				continue;
			}
			ProductPurchasePack pack = new ProductPurchasePack();
			pack.setProduct(product);
			pack.setLabel(label);
			pack.setFactor(dto.getFactor());
			pack.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : i);
			pack.setIsDefault(hasDefault ? Boolean.TRUE.equals(dto.getIsDefault()) : i == 0);
			entities.add(pack);
		}
		if (entities.isEmpty()) {
			ProductPurchasePack pack = new ProductPurchasePack();
			pack.setProduct(product);
			pack.setLabel("UN");
			pack.setFactor(BigDecimal.ONE);
			pack.setIsDefault(true);
			pack.setSortOrder(0);
			entities.add(pack);
		}
		if (entities.stream().noneMatch(p -> Boolean.TRUE.equals(p.getIsDefault()))) {
			entities.get(0).setIsDefault(true);
		}
		productPurchasePackRepository.saveAll(entities);

		Map<String, String> barcodesByLabel = new HashMap<>();
		if (source != null) {
			for (ProductPurchasePackRequestDTO dto : source) {
				if (dto.getLabel() != null) {
					barcodesByLabel.put(dto.getLabel().trim().toUpperCase(), dto.getBarcode());
				}
			}
		}

		syncProductUomConversions(product, entities, barcodesByLabel);
	}

	private void syncProductUomConversions(Product product, List<ProductPurchasePack> entities, Map<String, String> barcodesByLabel) {
		List<ProductUomConversion> existing = productUomConversionRepository
				.findByProduct_IdOrderByLabelAsc(product.getId());

		
		Set<String> newLabels = new HashSet<>();
		newLabels.add("UN");
		for (ProductPurchasePack pack : entities) {
			if (pack.getLabel() != null) {
				newLabels.add(pack.getLabel().trim().toUpperCase());
			}
		}

		List<ProductUomConversion> toDelete = new ArrayList<>();
		Map<String, ProductUomConversion> byLabel = new HashMap<>();
		for (ProductUomConversion conversion : existing) {
			String labelUpper = conversion.getLabel().toUpperCase();
			if (!newLabels.contains(labelUpper)) {
				toDelete.add(conversion);
			} else {
				byLabel.putIfAbsent(labelUpper, conversion);
			}
		}

		List<ProductUomConversion> toSave = new ArrayList<>();
		Set<String> seenLabels = new HashSet<>();
		boolean hasDefaultPack = entities.stream().anyMatch(p -> Boolean.TRUE.equals(p.getIsDefault()));

		ProductUomConversion base = byLabel.get("UN");
		if (base == null) {
			base = new ProductUomConversion();
			base.setProduct(product);
			base.setLabel("UN");
			base.setCreatedAt(LocalDateTime.now());
		}
		
		String customBaseBarcode = barcodesByLabel != null ? barcodesByLabel.get("UN") : null;
		if (customBaseBarcode != null && !customBaseBarcode.trim().isEmpty()) {
			base.setBarcode(customBaseBarcode.trim());
		} else {
			base.setBarcode(product.getBarcode());
		}
		base.setFactor(BigDecimal.ONE);
		base.setSalePrice(product.getSalePrice());
		base.setIsSaleDefault(true);
		base.setIsPurchaseDefault(!hasDefaultPack || entities.stream()
				.filter(p -> p.getLabel().equalsIgnoreCase("UN"))
				.anyMatch(p -> Boolean.TRUE.equals(p.getIsDefault())));
		base.setUpdatedAt(LocalDateTime.now());
		toSave.add(base);
		seenLabels.add("UN");

		for (ProductPurchasePack pack : entities) {
			if (pack.getLabel().equalsIgnoreCase("UN")) {
				continue;
			}
			String label = pack.getLabel().toUpperCase();
			if (!seenLabels.add(label)) {
				continue;
			}
			ProductUomConversion conv = byLabel.get(label);
			if (conv == null) {
				conv = new ProductUomConversion();
				conv.setProduct(product);
				conv.setLabel(label);
				conv.setCreatedAt(LocalDateTime.now());
			}
			String customBarcode = barcodesByLabel != null ? barcodesByLabel.get(label) : null;
			if (customBarcode != null && !customBarcode.trim().isEmpty()) {
				conv.setBarcode(customBarcode.trim());
			} else {
				String factorStr = pack.getFactor().stripTrailingZeros().toPlainString();
				conv.setBarcode(product.getBarcode() + "-" + factorStr);
			}
			conv.setFactor(pack.getFactor());
			conv.setSalePrice(product.getSalePrice().multiply(pack.getFactor())
					.setScale(4, RoundingMode.HALF_UP));
			conv.setIsPurchaseDefault(hasDefaultPack && Boolean.TRUE.equals(pack.getIsDefault()));
			conv.setIsSaleDefault(false);
			conv.setUpdatedAt(LocalDateTime.now());
			toSave.add(conv);
		}

		try {
			if (!toDelete.isEmpty()) {
				productUomConversionRepository.deleteAll(toDelete);
				productUomConversionRepository.flush();
			}
			productUomConversionRepository.saveAll(toSave);
			productUomConversionRepository.flush();
		} catch (DataIntegrityViolationException ex) {
			throw new ConflictException(
					"No se pudo actualizar las presentaciones del producto porque están vinculadas a ventas, compras, movimientos de inventario o el código de barras está duplicado.");
		}
	}

	private List<ProductPurchasePackRequestDTO> defaultPackRequest() {
		ProductPurchasePackRequestDTO unit = new ProductPurchasePackRequestDTO();
		unit.setLabel("UN");
		unit.setFactor(BigDecimal.ONE);
		unit.setIsDefault(true);
		unit.setSortOrder(0);
		return List.of(unit);
	}
}
