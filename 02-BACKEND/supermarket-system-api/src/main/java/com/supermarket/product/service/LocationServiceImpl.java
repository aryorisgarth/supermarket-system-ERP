package com.supermarket.product.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.supermarket.product.dto.LocationRequestDTO;
import com.supermarket.product.dto.LocationResponseDTO;
import com.supermarket.product.dto.ProductLocationResponseDTO;
import com.supermarket.product.entity.Location;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductLocation;
import com.supermarket.product.repository.LocationRepository;
import com.supermarket.product.repository.ProductLocationRepository;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.exception.ConflictException;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {

	private final LocationRepository locationRepository;
	private final ProductLocationRepository productLocationRepository;
	private final ProductRepository productRepository;
	private final InventoryLedger inventoryLedger;
	private final UserRepository userRepository;

	@Override
	public List<LocationResponseDTO> findAll() {
		return locationRepository.findAll().stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public Page<LocationResponseDTO> findPage(String search, Pageable pageable) {
		if (search != null && !search.isBlank()) {
			var locOpt = locationRepository.findByLocationCode(search.trim());
			if (locOpt.isPresent()) {
				return new org.springframework.data.domain.PageImpl<>(List.of(toResponse(locOpt.get())), pageable, 1);
			}
		}
		return locationRepository.findAll(pageable).map(this::toResponse);
	}

	@Override
	public LocationResponseDTO findById(Long id) {
		return locationRepository.findById(id)
				.map(this::toResponse)
				.orElseThrow(() -> new ResourceNotFoundException("Location not found"));
	}

	@Override
	@Transactional
	public LocationResponseDTO create(LocationRequestDTO request) {
		String code = request.locationCode().trim();
		if (locationRepository.findByLocationCode(code).isPresent()) {
			throw new ConflictException("Location code already exists");
		}
		Location loc = new Location();
		loc.setWarehouse(request.warehouse().trim());
		loc.setAisle(request.aisle() != null ? request.aisle().trim() : null);
		loc.setShelf(request.shelf() != null ? request.shelf().trim() : null);
		loc.setLevel(request.level() != null ? request.level().trim() : null);
		loc.setLocationCode(code);
		loc.setIsPisoVenta(request.isPisoVenta() != null ? request.isPisoVenta() : false);
		loc.setCreatedAt(LocalDateTime.now());
		loc.setUpdatedAt(LocalDateTime.now());
		Location saved = locationRepository.save(loc);
		return toResponse(saved);
	}

	@Override
	@Transactional
	public LocationResponseDTO update(Long id, LocationRequestDTO request) {
		Location loc = locationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Location not found"));
		String code = request.locationCode().trim();
		if (!loc.getLocationCode().equalsIgnoreCase(code) && locationRepository.findByLocationCode(code).isPresent()) {
			throw new ConflictException("Location code already exists");
		}
		loc.setWarehouse(request.warehouse().trim());
		loc.setAisle(request.aisle() != null ? request.aisle().trim() : null);
		loc.setShelf(request.shelf() != null ? request.shelf().trim() : null);
		loc.setLevel(request.level() != null ? request.level().trim() : null);
		loc.setLocationCode(code);
		if (request.isPisoVenta() != null) {
			loc.setIsPisoVenta(request.isPisoVenta());
		}
		loc.setUpdatedAt(LocalDateTime.now());
		Location saved = locationRepository.save(loc);
		return toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Long id) {
		Location loc = locationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Location not found"));
		if (!productLocationRepository.findByLocationId(id).isEmpty()) {
			throw new ConflictException("Location cannot be deleted because it contains products with stock");
		}
		locationRepository.delete(loc);
	}

	@Override
	public List<ProductLocationResponseDTO> getProductLocations(Long productId) {
		return productLocationRepository.findByProductId(productId).stream()
				.map(this::toProductLocationResponse)
				.toList();
	}

	@Override
	@Transactional
	public void updateProductLocationStock(Long productId, Long locationId, BigDecimal stock) {
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));
		Location loc = locationRepository.findById(locationId)
				.orElseThrow(() -> new ResourceNotFoundException("Location not found"));
		inventoryLedger.recordLocationStockOverride(currentUser(), product, loc, stock);
	}

	@Override
	@Transactional
	public void transferStock(Long productId, Long fromLocationId, Long toLocationId, BigDecimal quantity) {
		assertWarehouseTransferAccess();
		if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
			throw new ConflictException("Transfer quantity must be positive");
		}
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));
		Location fromLoc = locationRepository.findById(fromLocationId)
				.orElseThrow(() -> new ResourceNotFoundException("Source location not found"));
		Location toLoc = locationRepository.findById(toLocationId)
				.orElseThrow(() -> new ResourceNotFoundException("Target location not found"));
		inventoryLedger.recordLocationTransfer(currentUser(), product, fromLoc, toLoc, quantity);
	}

	private User currentUser() {
		return userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
	}

	private void assertWarehouseTransferAccess() {
		if (SecurityUtils.hasAuthority("ROLE_BODEGUERO")
				|| SecurityUtils.hasAuthority("ROLE_ADMINISTRADOR")
				|| SecurityUtils.hasAuthority("ROLE_ADMIN_INGENIERO")
				|| SecurityUtils.hasAuthority("ROLE_SUPERVISOR")
				|| SecurityUtils.hasAuthority("WAREHOUSE_LOCATION")
				|| SecurityUtils.hasAuthority("INVENTORY_ADJUST")
				|| SecurityUtils.hasAuthority("PURCHASE_RECEIVE")) {
			return;
		}
		throw new ResponseStatusException(HttpStatus.FORBIDDEN,
				"No tiene permisos para trasladar mercadería entre ubicaciones");
	}

	private LocationResponseDTO toResponse(Location loc) {
		return new LocationResponseDTO(
				loc.getId(),
				loc.getWarehouse(),
				loc.getAisle(),
				loc.getShelf(),
				loc.getLevel(),
				loc.getLocationCode(),
				loc.getIsPisoVenta(),
				loc.getCreatedAt(),
				loc.getUpdatedAt()
		);
	}

	@Override
	public List<ProductLocationResponseDTO> getProductsByLocation(Long locationId) {
		return productLocationRepository.findByLocationId(locationId).stream()
				.map(this::toProductLocationResponse)
				.toList();
	}

	private ProductLocationResponseDTO toProductLocationResponse(ProductLocation pl) {
		Product product = pl.getProduct();
		return new ProductLocationResponseDTO(
				pl.getId(),
				product.getId(),
				product.getName(),
				product.getBarcode(),
				pl.getLocation().getId(),
				pl.getLocation().getWarehouse(),
				pl.getLocation().getAisle(),
				pl.getLocation().getShelf(),
				pl.getLocation().getLevel(),
				pl.getLocation().getLocationCode(),
				pl.getLocation().getIsPisoVenta(),
				pl.getStock()
		);
	}

	@Override
	@Transactional
	public void removeProductLocation(Long productId, Long locationId) {
		ProductLocation pl = productLocationRepository.findByProductIdAndLocationId(productId, locationId)
				.orElseThrow(() -> new ResourceNotFoundException("No se encontró el registro de ubicación del producto"));
		
		if (pl.getStock().compareTo(BigDecimal.ZERO) != 0) {
			throw new ConflictException("No se puede eliminar la ubicación porque todavía contiene existencias (" + pl.getStock() + ")");
		}
		
		productLocationRepository.delete(pl);

		// Recalcular stock general del producto
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
		
		BigDecimal totalStock = productLocationRepository.findByProductId(productId).stream()
				.filter(ploc -> !ploc.getLocation().getId().equals(locationId))
				.map(ProductLocation::getStock)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		
		product.setCurrentStock(totalStock);
		productRepository.save(product);
	}
}
