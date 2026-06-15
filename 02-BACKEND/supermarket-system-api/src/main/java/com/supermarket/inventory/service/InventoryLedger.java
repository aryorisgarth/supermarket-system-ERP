package com.supermarket.inventory.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.inventory.entity.InventoryMovement;
import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.repository.InventoryMovementRepository;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.Location;
import com.supermarket.product.entity.ProductLocation;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.product.repository.LocationRepository;
import com.supermarket.product.repository.ProductLocationRepository;
import com.supermarket.alerts.service.SystemAlertService;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.user.entity.User;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class InventoryLedger {

	private final InventoryMovementRepository inventoryMovementRepository;
	private final ProductRepository productRepository;
	private final ProductBatchRepository productBatchRepository;
	private final LocationRepository locationRepository;
	private final ProductLocationRepository productLocationRepository;
	private final SystemAlertService systemAlertService;

	@Transactional
	public void record(User user, Product product, ProductBatch batch, InventoryMovementType movementType,
			BigDecimal quantity, byte factor, Long referenceId, String notes) {
		record(user, product, batch, movementType, quantity, factor, referenceId, null, null, null, null, null, notes);
	}

	@Transactional
	public void record(User user, Product product, ProductBatch batch, InventoryMovementType movementType,
			BigDecimal quantity, byte factor, Long referenceId, Long referenceLineId, String sourceType,
			BigDecimal unitCost, String notes) {
		record(user, product, batch, movementType, quantity, factor, referenceId, referenceLineId, sourceType, unitCost, null, null, notes);
	}

	@Transactional
	public void record(User user, Product product, ProductBatch batch, InventoryMovementType movementType,
			BigDecimal quantity, byte factor, Long referenceId, Long referenceLineId, String sourceType,
			BigDecimal unitCost, com.supermarket.product.entity.ProductUomConversion conversion, BigDecimal uomQuantity, String notes) {
		if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be positive");
		}
		if (factor != 1 && factor != -1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Factor must be 1 or -1");
		}

		BigDecimal previousStock = product.getCurrentStock();
		BigDecimal delta = quantity.multiply(BigDecimal.valueOf(factor));
		BigDecimal newStock = previousStock.add(delta);
		if (newStock.compareTo(BigDecimal.ZERO) < 0 && movementType != InventoryMovementType.SALE) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient product stock");
		}
		product.setCurrentStock(newStock);
		product.setUpdatedAt(LocalDateTime.now());
		productRepository.save(product);

		if (batch != null) {
			BigDecimal newBatchQty = batch.getCurrentQuantity().add(delta);
			if (newBatchQty.compareTo(BigDecimal.ZERO) < 0 && movementType != InventoryMovementType.SALE) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient batch quantity");
			}
			batch.setCurrentQuantity(newBatchQty);
			productBatchRepository.save(batch);
		}

		Location targetLoc = null;
		if (movementType == InventoryMovementType.SALE) {
			// Buscar ubicaciones de piso de venta asociadas a este producto
			java.util.List<ProductLocation> productExhibitions = productLocationRepository.findByProductId(product.getId()).stream()
					.filter(pl -> pl.getLocation() != null && Boolean.TRUE.equals(pl.getLocation().getIsPisoVenta()))
					.toList();

			if (!productExhibitions.isEmpty()) {
				// Buscar la primera que tenga stock disponible (mayor que cero)
				targetLoc = productExhibitions.stream()
						.filter(pl -> pl.getStock() != null && pl.getStock().compareTo(BigDecimal.ZERO) > 0)
						.map(ProductLocation::getLocation)
						.findFirst()
						.orElseGet(() -> productExhibitions.get(0).getLocation());
			} else {
				// Si no tiene asignada ninguna ubicación de tipo piso de venta, buscar la primera de la BD
				targetLoc = locationRepository.findByIsPisoVenta(true).stream().findFirst().orElseGet(() -> {
					Location l = new Location();
					l.setWarehouse("Tienda");
					l.setAisle("Principal");
					l.setShelf("Exhibición");
					l.setLevel("Góndola");
					l.setLocationCode("EXH-DEFAULT");
					l.setIsPisoVenta(true);
					l.setCreatedAt(LocalDateTime.now());
					l.setUpdatedAt(LocalDateTime.now());
					return locationRepository.save(l);
				});
			}
		} else {
			Location customLoc = null;
			if (batch != null && batch.getWarehouseZone() != null && !batch.getWarehouseZone().isBlank()) {
				customLoc = locationRepository.findByLocationCode(batch.getWarehouseZone().trim()).orElse(null);
			}
			if (customLoc != null) {
				targetLoc = customLoc;
			} else {
				targetLoc = locationRepository.findByIsPisoVenta(false).stream().findFirst().orElseGet(() -> {
					Location l = new Location();
					l.setWarehouse("Bodega Central");
					l.setAisle("A");
					l.setShelf("1");
					l.setLevel("1");
					l.setLocationCode("BOD-DEFAULT");
					l.setIsPisoVenta(false);
					l.setCreatedAt(LocalDateTime.now());
					l.setUpdatedAt(LocalDateTime.now());
					return locationRepository.save(l);
				});
			}
		}

		final Location finalLoc = targetLoc;
		ProductLocation pl = productLocationRepository.findByProductIdAndLocationId(product.getId(), targetLoc.getId())
				.orElseGet(() -> {
					ProductLocation newPl = new ProductLocation();
					newPl.setProduct(product);
					newPl.setLocation(finalLoc);
					newPl.setStock(BigDecimal.ZERO);
					newPl.setCreatedAt(LocalDateTime.now());
					return newPl;
				});

		pl.setStock(pl.getStock().add(delta));
		pl.setUpdatedAt(LocalDateTime.now());
		productLocationRepository.save(pl);

		if (Boolean.TRUE.equals(targetLoc.getIsPisoVenta())) {
			String zeroKey = "EXHIBITION_ZERO_STOCK:" + product.getId();
			String lowKey = "EXHIBITION_LOW_STOCK:" + product.getId();

			if (pl.getStock().compareTo(BigDecimal.ZERO) <= 0) {
				systemAlertService.upsertActive(
						zeroKey,
						"INVENTORY",
						"CRITICAL",
						"Stock Exhibición Agotado",
						product.getName() + " tiene stock de exhibición en cero o negativo (" + pl.getStock() + "). Reabastecer de inmediato.",
						"Inventario",
						product.getId(),
						"/inventario"
				);
			} else {
				systemAlertService.resolveAlert(zeroKey);
			}

			if (pl.getStock().compareTo(product.getMinStockExhibicion()) < 0) {
				systemAlertService.upsertActive(
						lowKey,
						"INVENTORY",
						"WARNING",
						"Reabastecer Exhibición",
						product.getName() + " tiene " + pl.getStock() + " unidades en exhibición. Límite de reabastecimiento: " + product.getMinStockExhibicion() + ".",
						"Inventario",
						product.getId(),
						"/inventario"
				);
			} else {
				systemAlertService.resolveAlert(lowKey);
			}
		}

		InventoryMovement movement = new InventoryMovement();
		movement.setProduct(product);
		movement.setBatch(batch);
		movement.setUser(user);
		movement.setMovementType(movementType);
		movement.setQuantity(quantity);
		movement.setFactor(factor);
		movement.setReferenceId(referenceId);
		movement.setReferenceLineId(referenceLineId);
		movement.setSourceType(sourceType);
		movement.setPreviousStock(previousStock);
		movement.setNewStock(newStock);
		movement.setUnitCost(unitCost);
		movement.setTotalCost(unitCost != null ? unitCost.multiply(quantity) : null);
		movement.setNotes(notes);
		movement.setCreatedAt(LocalDateTime.now());

		
		if (conversion != null) {
			movement.setUomConversion(conversion);
			movement.setUomLabel(conversion.getLabel());
			movement.setUomFactor(conversion.getFactor());
			movement.setUomQuantity(uomQuantity != null ? uomQuantity : quantity.divide(conversion.getFactor(), 4, RoundingMode.HALF_UP));
		} else {
			movement.setUomLabel("UN");
			movement.setUomFactor(BigDecimal.ONE);
			movement.setUomQuantity(quantity);
		}

		inventoryMovementRepository.save(movement);
	}
}
