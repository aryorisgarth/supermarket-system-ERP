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
		if (newStock.compareTo(BigDecimal.ZERO) < 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient product stock");
		}
		product.setCurrentStock(newStock);
		product.setUpdatedAt(LocalDateTime.now());
		productRepository.save(product);

		if (batch != null) {
			BigDecimal newBatchQty = batch.getCurrentQuantity().add(delta);
			if (newBatchQty.compareTo(BigDecimal.ZERO) < 0) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient batch quantity");
			}
			batch.setCurrentQuantity(newBatchQty);
			productBatchRepository.save(batch);
		}

		Location targetLoc = null;
		if (movementType == InventoryMovementType.SALE) {
			java.util.List<ProductLocation> productExhibitions = productLocationRepository.findByProductId(product.getId()).stream()
					.filter(pl -> pl.getLocation() != null && Boolean.TRUE.equals(pl.getLocation().getIsPisoVenta()))
					.filter(pl -> pl.getStock() != null && pl.getStock().compareTo(BigDecimal.ZERO) > 0)
					.sorted((a, b) -> b.getStock().compareTo(a.getStock()))
					.toList();

			BigDecimal exhibitionAvailable = productExhibitions.stream()
					.map(ProductLocation::getStock)
					.reduce(BigDecimal.ZERO, BigDecimal::add);
			if (exhibitionAvailable.compareTo(quantity) < 0) {
				throw new ResponseStatusException(HttpStatus.CONFLICT,
						"Insufficient exhibition stock for product " + product.getBarcode());
			}

			BigDecimal remaining = quantity;
			Location lastTouched = null;
			for (ProductLocation exhibitionPl : productExhibitions) {
				if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
					break;
				}
				BigDecimal take = exhibitionPl.getStock().min(remaining);
				exhibitionPl.setStock(exhibitionPl.getStock().subtract(take));
				exhibitionPl.setUpdatedAt(LocalDateTime.now());
				productLocationRepository.save(exhibitionPl);
				remaining = remaining.subtract(take);
				lastTouched = exhibitionPl.getLocation();
				refreshExhibitionAlerts(product, exhibitionPl.getLocation(), exhibitionPl.getStock());
			}
			if (remaining.compareTo(BigDecimal.ZERO) > 0) {
				throw new ResponseStatusException(HttpStatus.CONFLICT,
						"Insufficient exhibition stock for product " + product.getBarcode());
			}
			targetLoc = lastTouched;
		} else {
			Location customLoc = null;
			if (batch != null && batch.getWarehouseZone() != null && !batch.getWarehouseZone().isBlank()) {
				customLoc = locationRepository.findByLocationCode(batch.getWarehouseZone().trim()).orElse(null);
			}
			if (customLoc != null) {
				targetLoc = customLoc;
			} else {
				targetLoc = locationRepository.findByLocationCode("BOD-DEFAULT").orElseGet(() ->
						locationRepository.findByIsPisoVenta(false).stream().findFirst().orElseGet(() -> {
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
						}));
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
			refreshExhibitionAlerts(product, targetLoc, pl.getStock());

			// Asegura zona de lote = código de ubicación para FEFO en traslados
			if (batch != null && (batch.getWarehouseZone() == null || batch.getWarehouseZone().isBlank())
					&& targetLoc.getLocationCode() != null) {
				batch.setWarehouseZone(targetLoc.getLocationCode());
				productBatchRepository.save(batch);
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

	/**
	 * Traslado entre ubicaciones: no cambia el stock total del producto, pero deja traza en Kardex.
	 */
	@Transactional
	public void recordLocationTransfer(User user, Product product, Location fromLoc, Location toLoc, BigDecimal quantity) {
		if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer quantity must be positive");
		}
		if (fromLoc.getId().equals(toLoc.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source and target location must differ");
		}

		ProductLocation fromPL = productLocationRepository.findByProductIdAndLocationId(product.getId(), fromLoc.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "No stock record in source location"));
		if (fromPL.getStock().compareTo(quantity) < 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock in source location");
		}

		fromPL.setStock(fromPL.getStock().subtract(quantity));
		fromPL.setUpdatedAt(LocalDateTime.now());
		productLocationRepository.save(fromPL);

		ProductLocation toPL = productLocationRepository.findByProductIdAndLocationId(product.getId(), toLoc.getId())
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

		transferBatchesFefo(product, fromLoc.getLocationCode(), toLoc.getLocationCode(), quantity);

		BigDecimal stockSnapshot = product.getCurrentStock() != null ? product.getCurrentStock() : BigDecimal.ZERO;
		String notes = "Traslado " + fromLoc.getLocationCode() + " → " + toLoc.getLocationCode()
				+ " (" + quantity.stripTrailingZeros().toPlainString() + " u)";

		InventoryMovement movement = new InventoryMovement();
		movement.setProduct(product);
		movement.setUser(user);
		movement.setMovementType(InventoryMovementType.TRANSFER);
		movement.setQuantity(quantity);
		movement.setFactor((byte) 1);
		movement.setReferenceId(toLoc.getId());
		movement.setReferenceLineId(fromLoc.getId());
		movement.setSourceType("LOCATION_TRANSFER");
		movement.setPreviousStock(stockSnapshot);
		movement.setNewStock(stockSnapshot);
		movement.setUnitCost(resolveUnitCost(product));
		movement.setTotalCost(null);
		movement.setNotes(notes);
		movement.setCreatedAt(LocalDateTime.now());
		movement.setUomLabel("UN");
		movement.setUomFactor(BigDecimal.ONE);
		movement.setUomQuantity(quantity);
		inventoryMovementRepository.save(movement);

		refreshExhibitionAlerts(product, fromLoc, fromPL.getStock());
		refreshExhibitionAlerts(product, toLoc, toPL.getStock());
	}

	/**
	 * Ajuste directo de stock en una ubicación: recalcula el total del producto y registra ADJUSTMENT en Kardex.
	 */
	@Transactional
	public void recordLocationStockOverride(User user, Product product, Location location, BigDecimal newLocationStock) {
		if (newLocationStock == null || newLocationStock.compareTo(BigDecimal.ZERO) < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location stock cannot be negative");
		}

		ProductLocation pl = productLocationRepository.findByProductIdAndLocationId(product.getId(), location.getId())
				.orElseGet(() -> {
					ProductLocation created = new ProductLocation();
					created.setProduct(product);
					created.setLocation(location);
					created.setStock(BigDecimal.ZERO);
					created.setCreatedAt(LocalDateTime.now());
					return created;
				});

		BigDecimal previousLocationStock = pl.getStock() != null ? pl.getStock() : BigDecimal.ZERO;
		pl.setStock(newLocationStock);
		pl.setUpdatedAt(LocalDateTime.now());
		productLocationRepository.save(pl);

		BigDecimal previousProductStock = product.getCurrentStock() != null ? product.getCurrentStock() : BigDecimal.ZERO;
		BigDecimal newProductStock = productLocationRepository.findByProductId(product.getId()).stream()
				.map(ProductLocation::getStock)
				.filter(s -> s != null)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		product.setCurrentStock(newProductStock);
		product.setUpdatedAt(LocalDateTime.now());
		productRepository.save(product);

		BigDecimal delta = newProductStock.subtract(previousProductStock);
		if (delta.compareTo(BigDecimal.ZERO) != 0) {
			byte factor = delta.signum() > 0 ? (byte) 1 : (byte) -1;
			InventoryMovement movement = new InventoryMovement();
			movement.setProduct(product);
			movement.setUser(user);
			movement.setMovementType(InventoryMovementType.ADJUSTMENT);
			movement.setQuantity(delta.abs());
			movement.setFactor(factor);
			movement.setReferenceId(location.getId());
			movement.setSourceType("LOCATION_STOCK_SET");
			movement.setPreviousStock(previousProductStock);
			movement.setNewStock(newProductStock);
			movement.setUnitCost(resolveUnitCost(product));
			movement.setTotalCost(resolveUnitCost(product).multiply(delta.abs()));
			movement.setNotes("Ajuste ubicación " + location.getLocationCode() + ": "
					+ previousLocationStock.stripTrailingZeros().toPlainString()
					+ " → " + newLocationStock.stripTrailingZeros().toPlainString());
			movement.setCreatedAt(LocalDateTime.now());
			movement.setUomLabel("UN");
			movement.setUomFactor(BigDecimal.ONE);
			movement.setUomQuantity(delta.abs());
			inventoryMovementRepository.save(movement);
		}

		refreshExhibitionAlerts(product, location, newLocationStock);
	}

	/**
	 * Mueve cantidad de lotes FEFO (vencimiento más próximo primero) entre zonas de ubicación.
	 * Si no hay lotes asociados a la zona origen, no falla: el stock por ubicación ya se movió.
	 */
	private void transferBatchesFefo(Product product, String fromZone, String toZone, BigDecimal quantity) {
		if (fromZone == null || fromZone.isBlank() || toZone == null || toZone.isBlank()) {
			return;
		}
		String from = fromZone.trim();
		String to = toZone.trim();
		if (from.equalsIgnoreCase(to)) {
			return;
		}

		java.util.List<ProductBatch> sourceBatches = productBatchRepository
				.findByProductIdOrderByExpirationDateAsc(product.getId())
				.stream()
				.filter(b -> b.getWarehouseZone() != null && from.equalsIgnoreCase(b.getWarehouseZone().trim()))
				.filter(b -> b.getCurrentQuantity() != null && b.getCurrentQuantity().compareTo(BigDecimal.ZERO) > 0)
				.toList();
		if (sourceBatches.isEmpty()) {
			return;
		}

		BigDecimal remaining = quantity;
		for (ProductBatch batch : sourceBatches) {
			if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
				break;
			}
			BigDecimal available = batch.getCurrentQuantity();
			BigDecimal take = remaining.min(available);
			if (take.compareTo(BigDecimal.ZERO) <= 0) {
				continue;
			}

			if (take.compareTo(available) == 0) {
				batch.setWarehouseZone(to);
				productBatchRepository.save(batch);
			} else {
				batch.setCurrentQuantity(available.subtract(take));
				productBatchRepository.save(batch);

				ProductBatch split = new ProductBatch();
				split.setProduct(product);
				split.setBatchCode(uniqueTransferBatchCode(batch.getBatchCode(), to));
				split.setInitialQuantity(take);
				split.setCurrentQuantity(take);
				split.setEntryDate(batch.getEntryDate());
				split.setExpirationDate(batch.getExpirationDate());
				split.setPurchaseOrderItemId(batch.getPurchaseOrderItemId());
				split.setWarehouseZone(to);
				split.setQcNotes(batch.getQcNotes());
				split.setCreatedAt(LocalDateTime.now());
				productBatchRepository.save(split);
			}
			remaining = remaining.subtract(take);
		}
	}

	private String uniqueTransferBatchCode(String originalCode, String toZone) {
		String base = (originalCode == null || originalCode.isBlank() ? "XFER" : originalCode.trim())
				+ "-" + (toZone == null ? "Z" : toZone.trim().replaceAll("\\s+", "")).toUpperCase();
		if (base.length() > 40) {
			base = base.substring(0, 40);
		}
		String candidate = base;
		int suffix = 1;
		while (productBatchRepository.existsByBatchCodeIgnoreCase(candidate)) {
			String suffixPart = "-" + suffix++;
			int maxBase = Math.max(1, 50 - suffixPart.length());
			candidate = (base.length() > maxBase ? base.substring(0, maxBase) : base) + suffixPart;
		}
		return candidate;
	}

	private BigDecimal resolveUnitCost(Product product) {
		if (product.getAverageCost() != null && product.getAverageCost().compareTo(BigDecimal.ZERO) > 0) {
			return product.getAverageCost();
		}
		if (product.getLastPurchaseCost() != null && product.getLastPurchaseCost().compareTo(BigDecimal.ZERO) > 0) {
			return product.getLastPurchaseCost();
		}
		return product.getPurchasePrice() != null ? product.getPurchasePrice() : BigDecimal.ZERO;
	}

	private void refreshExhibitionAlerts(Product product, Location location, BigDecimal currentStock) {
		if (!Boolean.TRUE.equals(location.getIsPisoVenta())) {
			return;
		}
		String zeroKey = "EXHIBITION_ZERO_STOCK:" + product.getId();
		String lowKey = "EXHIBITION_LOW_STOCK:" + product.getId();
		BigDecimal stock = currentStock != null ? currentStock : BigDecimal.ZERO;

		if (stock.compareTo(BigDecimal.ZERO) <= 0) {
			systemAlertService.upsertActive(
					zeroKey,
					"INVENTORY",
					"CRITICAL",
					"Stock Exhibición Agotado",
					product.getName() + " tiene stock de exhibición en cero o negativo (" + stock + "). Reabastecer de inmediato.",
					"Inventario",
					product.getId(),
					"/inventario");
		} else {
			systemAlertService.resolveAlert(zeroKey);
		}

		BigDecimal minExhibition = product.getMinStockExhibicion() != null
				? product.getMinStockExhibicion()
				: BigDecimal.ZERO;
		if (stock.compareTo(minExhibition) < 0) {
			systemAlertService.upsertActive(
					lowKey,
					"INVENTORY",
					"WARNING",
					"Reabastecer Exhibición",
					product.getName() + " tiene " + stock + " unidades en exhibición. Límite de reabastecimiento: "
							+ minExhibition + ".",
					"Inventario",
					product.getId(),
					"/inventario");
		} else {
			systemAlertService.resolveAlert(lowKey);
		}
	}
}
