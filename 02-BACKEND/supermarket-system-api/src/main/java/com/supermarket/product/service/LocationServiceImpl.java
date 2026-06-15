package com.supermarket.product.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.supermarket.product.dto.LocationRequestDTO;
import com.supermarket.product.dto.LocationResponseDTO;
import com.supermarket.product.dto.ProductLocationResponseDTO;
import com.supermarket.product.entity.Location;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductLocation;
import com.supermarket.product.repository.LocationRepository;
import com.supermarket.product.repository.ProductLocationRepository;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.alerts.service.SystemAlertService;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.exception.ConflictException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {

	private final LocationRepository locationRepository;
	private final ProductLocationRepository productLocationRepository;
	private final ProductRepository productRepository;
	private final SystemAlertService systemAlertService;

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

		ProductLocation pl = productLocationRepository.findByProductIdAndLocationId(productId, locationId)
				.orElseGet(() -> {
					ProductLocation newPl = new ProductLocation();
					newPl.setProduct(product);
					newPl.setLocation(loc);
					newPl.setCreatedAt(LocalDateTime.now());
					return newPl;
				});

		pl.setStock(stock);
		pl.setUpdatedAt(LocalDateTime.now());
		productLocationRepository.save(pl);

		BigDecimal totalStock = productLocationRepository.findByProductId(productId).stream()
				.map(ProductLocation::getStock)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		product.setCurrentStock(totalStock);
		productRepository.save(product);

		checkAndManageAlerts(product, loc, stock);
	}

	@Override
	@Transactional
	public void transferStock(Long productId, Long fromLocationId, Long toLocationId, BigDecimal quantity) {
		if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
			throw new ConflictException("Transfer quantity must be positive");
		}
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));
		Location fromLoc = locationRepository.findById(fromLocationId)
				.orElseThrow(() -> new ResourceNotFoundException("Source location not found"));
		Location toLoc = locationRepository.findById(toLocationId)
				.orElseThrow(() -> new ResourceNotFoundException("Target location not found"));

		ProductLocation fromPL = productLocationRepository.findByProductIdAndLocationId(productId, fromLocationId)
				.orElseThrow(() -> new ConflictException("No stock record in source location"));

		if (fromPL.getStock().compareTo(quantity) < 0) {
			throw new ConflictException("Insufficient stock in source location");
		}

		fromPL.setStock(fromPL.getStock().subtract(quantity));
		fromPL.setUpdatedAt(LocalDateTime.now());
		productLocationRepository.save(fromPL);

		ProductLocation toPL = productLocationRepository.findByProductIdAndLocationId(productId, toLocationId)
				.orElseGet(() -> {
					ProductLocation pl = new ProductLocation();
					pl.setProduct(product);
					pl.setLocation(toLoc);
					pl.setStock(BigDecimal.ZERO);
					pl.setCreatedAt(LocalDateTime.now());
					return pl;
				});

		toPL.setStock(toPL.getStock().add(quantity));
		toPL.setUpdatedAt(LocalDateTime.now());
		productLocationRepository.save(toPL);

		checkAndManageAlerts(product, fromLoc, fromPL.getStock());
		checkAndManageAlerts(product, toLoc, toPL.getStock());
	}

	private void checkAndManageAlerts(Product product, Location location, BigDecimal currentStock) {
		if (Boolean.TRUE.equals(location.getIsPisoVenta())) {
			String zeroKey = "EXHIBITION_ZERO_STOCK:" + product.getId();
			String lowKey = "EXHIBITION_LOW_STOCK:" + product.getId();

			if (currentStock.compareTo(BigDecimal.ZERO) <= 0) {
				systemAlertService.upsertActive(
						zeroKey,
						"INVENTORY",
						"CRITICAL",
						"Stock Exhibición Agotado",
						product.getName() + " tiene stock de exhibición en cero o negativo (" + currentStock + "). Reabastecer de inmediato.",
						"Inventario",
						product.getId(),
						"/inventario"
				);
			} else {
				systemAlertService.resolveAlert(zeroKey);
			}

			if (currentStock.compareTo(product.getMinStockExhibicion()) < 0) {
				systemAlertService.upsertActive(
						lowKey,
						"INVENTORY",
						"WARNING",
						"Reabastecer Exhibición",
						product.getName() + " tiene " + currentStock + " unidades en exhibición. Límite de reabastecimiento: " + product.getMinStockExhibicion() + ".",
						"Inventario",
						product.getId(),
						"/inventario"
				);
			} else {
				systemAlertService.resolveAlert(lowKey);
			}
		}
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
		return new ProductLocationResponseDTO(
				pl.getId(),
				pl.getProduct().getId(),
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
