package com.supermarket.purchase.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.product.service.ProductCostService;
import com.supermarket.product.service.ProductCostUpdateResult;
import com.supermarket.product.service.ProductPriceService;
import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductPurchasePack;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.product.model.ProductPricingPolicy;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;
import com.supermarket.purchase.model.PurchasePricingDecision;
import com.supermarket.product.repository.ProductPurchasePackRepository;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.product.repository.ProductUomConversionRepository;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.purchase.dto.PurchaseOrderItemRequestDTO;
import com.supermarket.purchase.dto.PurchaseOrderItemResponseDTO;
import com.supermarket.purchase.dto.PurchaseOrderRequestDTO;
import com.supermarket.purchase.dto.PurchaseOrderResponseDTO;
import com.supermarket.purchase.dto.PurchaseReceiptImpactDTO;
import com.supermarket.purchase.dto.PurchaseReceiptItemRequestDTO;
import com.supermarket.purchase.dto.PurchaseReceiptRequestDTO;
import com.supermarket.purchase.entity.PurchaseOrder;
import com.supermarket.purchase.entity.PurchaseOrderItem;
import com.supermarket.purchase.model.PurchaseOrderStatus;
import com.supermarket.purchase.repository.PurchaseOrderRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.supplier.repository.SupplierRepository;
import com.supermarket.user.dto.UserSummaryDTO;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

	private final PurchaseOrderRepository purchaseOrderRepository;
	private final SupplierRepository supplierRepository;
	private final ProductRepository productRepository;
	private final ProductPurchasePackRepository productPurchasePackRepository;
	private final ProductBatchRepository productBatchRepository;
	private final UserRepository userRepository;
	private final InventoryLedger inventoryLedger;
	private final ProductUomConversionRepository productUomConversionRepository;
	private final ProductCostService productCostService;
	private final ProductPriceService productPriceService;

	@Override
	public List<PurchaseOrderResponseDTO> findAll(PurchaseOrderStatus status) {
		List<PurchaseOrder> orders = status == null
				? purchaseOrderRepository.findAll()
				: purchaseOrderRepository.findByStatusOrderByCreatedAtDesc(status);
		return orders.stream()
				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
				.map(this::toResponse)
				.toList();
	}

	@Override
	public Page<PurchaseOrderResponseDTO> findPage(PurchaseOrderStatus status, Long supplierId, String search, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		return purchaseOrderRepository.searchPage(status, supplierId, normalized, pageable)
				.map(order -> toResponse(order, false));
	}

	@Override
	public PurchaseOrderResponseDTO findById(Long id) {
		return purchaseOrderRepository.findByIdWithItems(id)
				.map(this::toResponse)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase order not found"));
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO create(PurchaseOrderRequestDTO request) {
		User actor = currentUser();
		Supplier supplier = supplierRepository.findById(request.getSupplierId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supplier not found"));

		PurchaseOrder order = new PurchaseOrder();
		order.setOrderNumber(generateOrderNumber());
		order.setStatus(PurchaseOrderStatus.DRAFT);
		order.setSupplier(supplier);
		order.setCreatedBy(actor);
		order.setNotes(request.getNotes());
		order.setCreatedAt(LocalDateTime.now());
		order.setUpdatedAt(LocalDateTime.now());

		BigDecimal subtotal = BigDecimal.ZERO;
		for (PurchaseOrderItemRequestDTO line : request.getItems()) {
			Product product = productRepository.findById(line.getProductId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));
			if (!product.getSupplier().getId().equals(supplier.getId())) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Product " + product.getName() + " does not belong to the selected supplier");
			}

			ResolvedPurchaseLine resolved = resolveLine(line, product);

			PurchaseOrderItem item = new PurchaseOrderItem();
			item.setPurchaseOrder(order);
			item.setProduct(product);
			item.setQuantityOrdered(resolved.quantityOrdered());
			item.setQuantityReceived(BigDecimal.ZERO);
			item.setQuantityRejected(BigDecimal.ZERO);
			item.setUnitCost(resolved.unitCost());
			item.setLineTotal(resolved.lineTotal());
			item.setPackLabel(resolved.packLabel());
			item.setQuantityInPacks(resolved.quantityInPacks());
			item.setCostPerPack(resolved.costPerPack());
			item.setSalePricePerPack(resolved.salePricePerPack());
			item.setSalePricePerUnit(resolved.salePricePerUnit());
			item.setUnitsPerPack(resolved.unitsPerPack());
			item.setUomConversion(resolved.uomConversion());
			order.getItems().add(item);
			subtotal = subtotal.add(item.getLineTotal());
		}

		order.setSubtotal(subtotal);
		return toResponse(purchaseOrderRepository.save(order));
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO updateDraft(Long id, PurchaseOrderRequestDTO request) {
		PurchaseOrder order = loadOrder(id);
		if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Only draft purchase orders can be edited");
		}

		Supplier supplier = supplierRepository.findById(request.getSupplierId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supplier not found"));

		order.setSupplier(supplier);
		order.setNotes(request.getNotes());
		order.getItems().clear();

		BigDecimal subtotal = BigDecimal.ZERO;
		for (PurchaseOrderItemRequestDTO line : request.getItems()) {
			Product product = productRepository.findById(line.getProductId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));
			if (!product.getSupplier().getId().equals(supplier.getId())) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Product " + product.getName() + " does not belong to the selected supplier");
			}

			ResolvedPurchaseLine resolved = resolveLine(line, product);
			PurchaseOrderItem item = new PurchaseOrderItem();
			item.setPurchaseOrder(order);
			item.setProduct(product);
			item.setQuantityOrdered(resolved.quantityOrdered());
			item.setQuantityReceived(BigDecimal.ZERO);
			item.setQuantityRejected(BigDecimal.ZERO);
			item.setUnitCost(resolved.unitCost());
			item.setLineTotal(resolved.lineTotal());
			item.setPackLabel(resolved.packLabel());
			item.setQuantityInPacks(resolved.quantityInPacks());
			item.setCostPerPack(resolved.costPerPack());
			item.setSalePricePerPack(resolved.salePricePerPack());
			item.setSalePricePerUnit(resolved.salePricePerUnit());
			item.setUnitsPerPack(resolved.unitsPerPack());
			item.setUomConversion(resolved.uomConversion());
			order.getItems().add(item);
			subtotal = subtotal.add(item.getLineTotal());
		}

		order.setSubtotal(subtotal);
		order.setUpdatedAt(LocalDateTime.now());
		return toResponse(purchaseOrderRepository.save(order));
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO markOrdered(Long id) {
		PurchaseOrder order = loadOrder(id);
		if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Only draft purchase orders can be ordered");
		}
		order.setStatus(PurchaseOrderStatus.ORDERED);
		order.setOrderedAt(LocalDateTime.now());
		order.setUpdatedAt(LocalDateTime.now());
		return toResponse(purchaseOrderRepository.save(order));
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO receive(Long id) {
		return receive(id, null);
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO receive(Long id, PurchaseReceiptRequestDTO request) {
		PurchaseOrder order = loadOrder(id);
		if (order.getStatus() != PurchaseOrderStatus.ORDERED
				&& order.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Purchase order cannot be received in current status");
		}

		User actor = currentUser();
		if (order.getReceivedBy() != null && !order.getReceivedBy().getId().equals(actor.getId())
				&& !SecurityUtils.hasAuthority("PURCHASE_MANAGE")) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "La orden está asignada a otro responsable de recepción");
		}
		if (order.getReceivedBy() == null) {
			order.setReceivedBy(actor);
		}
		PurchaseOrder saved = purchaseOrderRepository.save(order);
		Map<Long, PurchaseReceiptItemRequestDTO> receivedByItemId = request == null
				? Map.of()
				: request.getItems().stream()
						.collect(Collectors.toMap(PurchaseReceiptItemRequestDTO::getItemId, Function.identity()));
		boolean progressAny = false;
		List<PurchaseReceiptImpactDTO> receiptImpacts = new java.util.ArrayList<>();

		for (PurchaseOrderItem item : saved.getItems()) {
			PurchaseReceiptItemRequestDTO lineRequest = request == null
					? null
					: receivedByItemId.get(item.getId());
			BigDecimal quantityToReceive = request == null
					? pendingQuantity(item)
					: receivedByItemId.containsKey(item.getId())
							? nz(receivedByItemId.get(item.getId()).getQuantityReceived())
							: BigDecimal.ZERO;
			BigDecimal quantityToReject = (lineRequest != null && lineRequest.getQuantityRejected() != null)
					? lineRequest.getQuantityRejected()
					: BigDecimal.ZERO;

			if (quantityToReceive.compareTo(BigDecimal.ZERO) < 0 || quantityToReject.compareTo(BigDecimal.ZERO) < 0) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantities cannot be negative");
			}
			if (quantityToReceive.compareTo(BigDecimal.ZERO) <= 0 && quantityToReject.compareTo(BigDecimal.ZERO) <= 0) {
				continue;
			}

			BigDecimal remaining = pendingQuantity(item);
			if (quantityToReceive.add(quantityToReject).compareTo(remaining) > 0) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Received + rejected quantity exceeds pending quantity");
			}

			if (lineRequest != null && lineRequest.getBatchCode() != null && !lineRequest.getBatchCode().isBlank()
					&& lineRequest.getExpirationDate() == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Expiration date is required when batch code is provided");
			}

			if (quantityToReceive.compareTo(BigDecimal.ZERO) > 0) {
				Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
						.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
				ProductCostUpdateResult costUpdate = productCostService.applyPurchaseReceiptCost(
						product,
						saved.getSupplier(),
						quantityToReceive,
						item.getUnitCost(),
						saved.getId(),
						item.getId(),
						actor);
				SalePriceApplyResult priceApply = applyPurchaseSalePrices(product, item, actor);

				ProductBatch batch = createBatchFromReceipt(lineRequest, item, product, quantityToReceive, saved.getOrderNumber());
				String receiptNotes = buildReceiptNotes(lineRequest, saved.getOrderNumber());
				inventoryLedger.record(actor, product, batch, InventoryMovementType.ENTRY, quantityToReceive,
						(byte) 1, saved.getId(), item.getId(), "PURCHASE_ORDER", item.getUnitCost(), receiptNotes);
				receiptImpacts.add(toReceiptImpact(costUpdate, product, priceApply));
				item.setQuantityReceived(nz(item.getQuantityReceived()).add(quantityToReceive));
			}

			if (quantityToReject.compareTo(BigDecimal.ZERO) > 0) {
				item.setQuantityRejected(nz(item.getQuantityRejected()).add(quantityToReject));
			}
			progressAny = true;
		}

		if (!progressAny) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No quantities were received or rejected");
		}

		boolean fullyReceived = saved.getItems().stream()
				.allMatch(item -> nz(item.getQuantityReceived()).add(nz(item.getQuantityRejected()))
						.compareTo(item.getQuantityOrdered()) >= 0);

		saved.setStatus(fullyReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED);
		if (fullyReceived) {
			saved.setReceivedAt(LocalDateTime.now());
		}
		saved.setReceivedBy(actor);
		if (request != null && request.getNotes() != null && !request.getNotes().isBlank()) {
			String currentNotes = saved.getNotes() == null ? "" : saved.getNotes() + " | ";
			saved.setNotes(currentNotes + request.getNotes());
		}
		saved.setUpdatedAt(LocalDateTime.now());
		return toResponse(purchaseOrderRepository.save(saved), true, receiptImpacts);
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO closeIncomplete(Long id) {
		PurchaseOrder order = loadOrder(id);
		if (order.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED
				&& order.getStatus() != PurchaseOrderStatus.ORDERED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Only ordered or partially received purchase orders can be closed incomplete");
		}
		boolean hasProgress = order.getItems().stream().anyMatch(item ->
				nz(item.getQuantityReceived()).compareTo(BigDecimal.ZERO) > 0
						|| nz(item.getQuantityRejected()).compareTo(BigDecimal.ZERO) > 0);
		if (!hasProgress && order.getStatus() == PurchaseOrderStatus.ORDERED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Use cancel for ordered purchase orders without reception progress");
		}
		order.setStatus(PurchaseOrderStatus.CLOSED);
		order.setUpdatedAt(LocalDateTime.now());
		String note = "Cerrada incompleta";
		order.setNotes(order.getNotes() == null || order.getNotes().isBlank()
				? note
				: order.getNotes() + " | " + note);
		return toResponse(purchaseOrderRepository.save(order));
	}

	private BigDecimal pendingQuantity(PurchaseOrderItem item) {
		return item.getQuantityOrdered()
				.subtract(nz(item.getQuantityReceived()))
				.subtract(nz(item.getQuantityRejected()));
	}

	private BigDecimal nz(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO claim(Long id) {
		PurchaseOrder order = loadOrder(id);
		if (order.getStatus() != PurchaseOrderStatus.ORDERED && order.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Solo las órdenes ordenadas o parciales pueden ser tomadas");
		}

		User currentUser = currentUser();

		if (order.getReceivedBy() != null && !order.getReceivedBy().getId().equals(currentUser.getId())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "La orden ya ha sido tomada por otro bodeguero");
		}

		order.setReceivedBy(currentUser);
		order.setUpdatedAt(LocalDateTime.now());
		return toResponse(purchaseOrderRepository.save(order));
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO assign(Long id, Long userId) {
		PurchaseOrder order = loadOrder(id);
		if (order.getStatus() != PurchaseOrderStatus.ORDERED && order.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Solo las órdenes ordenadas o parciales pueden ser asignadas");
		}

		User assignee = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario asignado no existe"));

		order.setReceivedBy(assignee);
		order.setUpdatedAt(LocalDateTime.now());
		return toResponse(purchaseOrderRepository.save(order));
	}

	@Override
	@Transactional
	public PurchaseOrderResponseDTO cancel(Long id) {
		PurchaseOrder order = loadOrder(id);
		if (order.getStatus() == PurchaseOrderStatus.RECEIVED
				|| order.getStatus() == PurchaseOrderStatus.PARTIALLY_RECEIVED
				|| order.getStatus() == PurchaseOrderStatus.CLOSED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Received purchase orders cannot be cancelled");
		}
		order.setStatus(PurchaseOrderStatus.CANCELLED);
		order.setUpdatedAt(LocalDateTime.now());
		return toResponse(purchaseOrderRepository.save(order));
	}

	private PurchaseOrder loadOrder(Long id) {
		return purchaseOrderRepository.findByIdWithItems(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase order not found"));
	}

	private User currentUser() {
		return userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
	}

	private String generateOrderNumber() {
		String prefix = "PO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
		String orderNumber = prefix;
		int suffix = 1;
		while (purchaseOrderRepository.findByOrderNumber(orderNumber).isPresent()) {
			orderNumber = prefix + "-" + suffix++;
		}
		return orderNumber;
	}

	private PurchaseOrderResponseDTO toResponse(PurchaseOrder order) {
		return toResponse(order, true, List.of());
	}

	private PurchaseOrderResponseDTO toResponse(PurchaseOrder order, boolean includeItems) {
		return toResponse(order, includeItems, List.of());
	}

	private PurchaseOrderResponseDTO toResponse(PurchaseOrder order, boolean includeItems,
			List<PurchaseReceiptImpactDTO> receiptImpacts) {
		return new PurchaseOrderResponseDTO(
				order.getId(),
				order.getOrderNumber(),
				order.getStatus(),
				order.getSupplier().getId(),
				order.getSupplier().getCompanyName(),
				order.getSubtotal(),
				order.getNotes(),
				toUserSummary(order.getCreatedBy()),
				toUserSummary(order.getReceivedBy()),
				order.getOrderedAt(),
				order.getReceivedAt(),
				order.getCreatedAt(),
				order.getUpdatedAt(),
				includeItems
						? order.getItems().stream().map(this::toItemResponse).toList()
						: List.of(),
				receiptImpacts != null ? receiptImpacts : List.of());
	}

	private PurchaseOrderItemResponseDTO toItemResponse(PurchaseOrderItem item) {
		Product product = item.getProduct();
		return new PurchaseOrderItemResponseDTO(
				item.getId(),
				new ProductSummaryDTO(
						product.getId(),
						product.getBarcode(),
						product.getName(),
						product.getRequiresBatch(),
						product.getRequiresExpiration()),
				item.getPackLabel(),
				item.getQuantityInPacks(),
				item.getCostPerPack(),
				item.getSalePricePerPack(),
				item.getSalePricePerUnit(),
				item.getUnitsPerPack(),
				item.getQuantityOrdered(),
				item.getQuantityReceived(),
				nz(item.getQuantityRejected()),
				item.getUnitCost(),
				item.getLineTotal());
	}

	private PurchaseReceiptImpactDTO toReceiptImpact(ProductCostUpdateResult result, Product product,
			SalePriceApplyResult priceApply) {
		BigDecimal salePrice = product.getSalePrice() != null ? product.getSalePrice() : result.salePrice();
		BigDecimal previousSale = priceApply != null && priceApply.previousSalePrice() != null
				? priceApply.previousSalePrice()
				: salePrice;
		BigDecimal currentMarkup = productCostService.calculateMarkupPercent(salePrice, result.newAverageCost());
		BigDecimal currentMargin = productCostService.calculateMarginPercent(salePrice, result.newAverageCost());
		BigDecimal minMarkup = result.minMarkupPercent();
		boolean markupAlert = currentMarkup != null && minMarkup != null && currentMarkup.compareTo(minMarkup) < 0;

		BigDecimal suggestedSalePrice = priceApply != null && priceApply.suggestedSalePrice() != null
				? priceApply.suggestedSalePrice()
				: productCostService.calculateSuggestedSalePrice(result.newLastCost(), minMarkup);
		if (suggestedSalePrice == null) {
			suggestedSalePrice = result.suggestedSalePrice();
		}

		ProductPricingPolicy policy = priceApply != null && priceApply.policy() != null
				? priceApply.policy()
				: (product.getPricingPolicy() != null ? product.getPricingPolicy() : ProductPricingPolicy.MANUAL);
		PurchasePricingDecision decision = priceApply != null && priceApply.decision() != null
				? priceApply.decision()
				: PurchasePricingDecision.NO_CHANGE;
		String decisionMessage = priceApply != null && priceApply.decisionMessage() != null
				? priceApply.decisionMessage()
				: "Sin cambio de precio de venta.";
		boolean salePriceApplied = priceApply != null && priceApply.salePriceApplied();

		return new PurchaseReceiptImpactDTO(
				result.productId(),
				result.productName(),
				result.previousLastCost(),
				result.newLastCost(),
				result.previousAverageCost(),
				result.newAverageCost(),
				result.quantityBefore(),
				result.quantityReceived(),
				result.quantityAfter(),
				previousSale,
				salePrice,
				suggestedSalePrice,
				currentMarkup,
				currentMargin,
				minMarkup,
				policy,
				decision,
				decisionMessage,
				salePriceApplied,
				markupAlert,
				minMarkup,
				markupAlert);
	}

	/**
	 * Aplica (o no) el precio de venta según la política del producto y reporta la decisión.
	 * - AUTO_BY_MARGIN: recalcula venta desde el nuevo costo + markup mínimo y aplica.
	 * - SUGGEST_ON_PURCHASE: no aplica; solo recomienda.
	 * - MANUAL: aplica solo si la línea de OC trae precios de venta explícitos.
	 */
	private SalePriceApplyResult applyPurchaseSalePrices(Product product, PurchaseOrderItem item, User actor) {
		BigDecimal factor = item.getUnitsPerPack() != null && item.getUnitsPerPack().compareTo(BigDecimal.ZERO) > 0
				? item.getUnitsPerPack()
				: BigDecimal.ONE;
		ProductPricingPolicy policy = product.getPricingPolicy() != null
				? product.getPricingPolicy()
				: ProductPricingPolicy.MANUAL;
		BigDecimal previousSalePrice = product.getSalePrice();
		BigDecimal cost = product.getLastPurchaseCost() != null
				? product.getLastPurchaseCost()
				: item.getUnitCost();
		BigDecimal suggestedUnit = productCostService.calculateSuggestedSalePrice(cost, product.getMinMarginPercent());

		if (policy == ProductPricingPolicy.SUGGEST_ON_PURCHASE) {
			String msg = suggestedUnit != null
					? "Política sugerir: venta vigente C$" + money(previousSalePrice)
							+ "; recomendado C$" + money(suggestedUnit) + " (no se aplicó)."
					: "Política sugerir: no hay precio recomendado calculable; venta sin cambios.";
			return new SalePriceApplyResult(policy, previousSalePrice, previousSalePrice, suggestedUnit,
					PurchasePricingDecision.SUGGESTED_ONLY, msg, false);
		}

		BigDecimal saleUnit;
		BigDecimal salePack;
		ProductSalePriceHistoryReason reason;
		String notes;
		PurchasePricingDecision decision;

		if (policy == ProductPricingPolicy.AUTO_BY_MARGIN) {
			saleUnit = suggestedUnit;
			if (saleUnit == null) {
				return new SalePriceApplyResult(policy, previousSalePrice, previousSalePrice, null,
						PurchasePricingDecision.NO_CHANGE,
						"Política automático: no se pudo calcular venta sugerida; sin cambios.",
						false);
			}
			salePack = saleUnit.multiply(factor).setScale(4, RoundingMode.HALF_UP);
			item.setSalePricePerUnit(saleUnit);
			item.setSalePricePerPack(salePack);
			reason = ProductSalePriceHistoryReason.PURCHASE_RECEIPT;
			notes = "Automático por markup en recepción de compra";
			decision = PurchasePricingDecision.APPLIED_AUTO;
		} else {
			saleUnit = item.getSalePricePerUnit();
			salePack = item.getSalePricePerPack();
			if (saleUnit == null && salePack != null) {
				saleUnit = salePack.divide(factor, 4, RoundingMode.HALF_UP);
			}
			if (salePack == null && saleUnit != null) {
				salePack = saleUnit.multiply(factor).setScale(4, RoundingMode.HALF_UP);
			}
			if (saleUnit == null) {
				return new SalePriceApplyResult(policy, previousSalePrice, previousSalePrice, suggestedUnit,
						PurchasePricingDecision.NO_CHANGE,
						"Política manual: la OC no trajo precio de venta; se mantuvo C$" + money(previousSalePrice) + ".",
						false);
			}
			reason = ProductSalePriceHistoryReason.PURCHASE_RECEIPT;
			notes = "Precio manual desde orden de compra (recepción)";
			decision = PurchasePricingDecision.APPLIED_MANUAL;
		}

		boolean changed = previousSalePrice == null || previousSalePrice.compareTo(saleUnit) != 0;
		productPriceService.updateSalePrice(
				product,
				previousSalePrice,
				saleUnit,
				reason,
				notes,
				actor);

		ProductUomConversion conversion = item.getUomConversion();
		if (conversion != null && salePack != null) {
			conversion.setSalePrice(salePack.setScale(4, RoundingMode.HALF_UP));
			productUomConversionRepository.save(conversion);
		}

		String msg;
		if (decision == PurchasePricingDecision.APPLIED_AUTO) {
			msg = changed
					? "Política automático: se aplicó venta C$" + money(saleUnit)
							+ " (antes C$" + money(previousSalePrice) + ") por markup mínimo."
					: "Política automático: venta sugerida C$" + money(saleUnit) + " ya coincidía; sin cambio efectivo.";
		} else {
			msg = changed
					? "Política manual: se aplicó venta de la OC C$" + money(saleUnit)
							+ " (antes C$" + money(previousSalePrice) + ")."
					: "Política manual: precio de la OC C$" + money(saleUnit) + " igual al vigente; sin cambio efectivo.";
		}

		return new SalePriceApplyResult(policy, previousSalePrice, saleUnit, suggestedUnit, decision, msg, changed);
	}

	private static String money(BigDecimal value) {
		if (value == null) {
			return "0.00";
		}
		return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
	}

	private record SalePriceApplyResult(
			ProductPricingPolicy policy,
			BigDecimal previousSalePrice,
			BigDecimal resultingSalePrice,
			BigDecimal suggestedSalePrice,
			PurchasePricingDecision decision,
			String decisionMessage,
			boolean salePriceApplied) {
	}

	private ResolvedPurchaseLine resolveLine(PurchaseOrderItemRequestDTO line, Product product) {
		
		if (line.getUomConversionId() != null && line.getQuantityInPacks() != null && line.getCostPerPack() != null) {
			ProductUomConversion conversion = productUomConversionRepository.findByIdAndProductId(line.getUomConversionId(), product.getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "UOM conversion not found for product"));
			BigDecimal quantityInPacks = line.getQuantityInPacks();
			BigDecimal costPerPack = line.getCostPerPack();
			BigDecimal unitsPerPack = conversion.getFactor();
			BigDecimal quantityOrdered = quantityInPacks.multiply(unitsPerPack);
			BigDecimal unitCost = costPerPack.divide(unitsPerPack, 4, RoundingMode.HALF_UP);
			BigDecimal lineTotal = quantityInPacks.multiply(costPerPack);
			ResolvedSalePrices salePrices = resolveSalePrices(line, unitsPerPack);
			return new ResolvedPurchaseLine(
					conversion.getLabel(),
					quantityInPacks,
					costPerPack,
					salePrices.salePricePerPack(),
					salePrices.salePricePerUnit(),
					unitsPerPack,
					quantityOrdered,
					unitCost,
					lineTotal,
					conversion);
		}

		
		if (line.getPurchasePackId() != null && line.getQuantityInPacks() != null && line.getCostPerPack() != null) {
			ProductPurchasePack pack = productPurchasePackRepository.findByIdAndProductId(line.getPurchasePackId(), product.getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Purchase pack not found for product"));
			BigDecimal quantityInPacks = line.getQuantityInPacks();
			BigDecimal costPerPack = line.getCostPerPack();
			BigDecimal unitsPerPack = pack.getFactor();
			BigDecimal quantityOrdered = quantityInPacks.multiply(unitsPerPack);
			BigDecimal unitCost = costPerPack.divide(unitsPerPack, 4, RoundingMode.HALF_UP);
			BigDecimal lineTotal = quantityInPacks.multiply(costPerPack);

			
			ProductUomConversion equivalent = productUomConversionRepository.findByProduct_IdOrderByLabelAsc(product.getId()).stream()
					.filter(c -> c.getProduct().getId().equals(product.getId()) && c.getLabel().equalsIgnoreCase(pack.getLabel()))
					.findFirst()
					.orElse(null);

			ResolvedSalePrices salePrices = resolveSalePrices(line, unitsPerPack);
			return new ResolvedPurchaseLine(
					pack.getLabel(),
					quantityInPacks,
					costPerPack,
					salePrices.salePricePerPack(),
					salePrices.salePricePerUnit(),
					unitsPerPack,
					quantityOrdered,
					unitCost,
					lineTotal,
					equivalent);
		}

		
		if (line.getQuantity() != null && line.getUnitCost() != null) {
			BigDecimal quantityOrdered = line.getQuantity();
			BigDecimal unitCost = line.getUnitCost();
			
			
			ProductUomConversion defConversion = productUomConversionRepository.findAll().stream()
					.filter(c -> c.getProduct().getId().equals(product.getId()) && c.getIsPurchaseDefault())
					.findFirst()
					.orElse(null);

			ResolvedSalePrices salePrices = resolveSalePrices(line, BigDecimal.ONE);
			return new ResolvedPurchaseLine(
					"UN",
					quantityOrdered,
					unitCost,
					salePrices.salePricePerPack(),
					salePrices.salePricePerUnit(),
					BigDecimal.ONE,
					quantityOrdered,
					unitCost,
					quantityOrdered.multiply(unitCost),
					defConversion);
		}

		throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
				"Each purchase line requires purchase pack data or legacy quantity/unit cost");
	}

	private ResolvedSalePrices resolveSalePrices(PurchaseOrderItemRequestDTO line, BigDecimal unitsPerPack) {
		BigDecimal factor = unitsPerPack != null && unitsPerPack.compareTo(BigDecimal.ZERO) > 0
				? unitsPerPack
				: BigDecimal.ONE;
		BigDecimal saleUnit = line.getSalePricePerUnit();
		BigDecimal salePack = line.getSalePricePerPack();
		if (saleUnit == null && salePack != null) {
			saleUnit = salePack.divide(factor, 4, RoundingMode.HALF_UP);
		}
		if (salePack == null && saleUnit != null) {
			salePack = saleUnit.multiply(factor).setScale(4, RoundingMode.HALF_UP);
		}
		return new ResolvedSalePrices(salePack, saleUnit);
	}

	private record ResolvedSalePrices(BigDecimal salePricePerPack, BigDecimal salePricePerUnit) {
	}

	private record ResolvedPurchaseLine(
			String packLabel,
			BigDecimal quantityInPacks,
			BigDecimal costPerPack,
			BigDecimal salePricePerPack,
			BigDecimal salePricePerUnit,
			BigDecimal unitsPerPack,
			BigDecimal quantityOrdered,
			BigDecimal unitCost,
			BigDecimal lineTotal,
			ProductUomConversion uomConversion) {
	}

	private UserSummaryDTO toUserSummary(User user) {
		if (user == null) {
			return null;
		}
		return new UserSummaryDTO(user.getId(), user.getFullName(), user.getEmail());
	}

	private ProductBatch createBatchFromReceipt(PurchaseReceiptItemRequestDTO lineRequest, PurchaseOrderItem item,
			Product product, BigDecimal quantityToReceive, String orderNumber) {
		boolean reqBatch = Boolean.TRUE.equals(product.getRequiresBatch());
		boolean reqExp = Boolean.TRUE.equals(product.getRequiresExpiration());

		if (reqBatch) {
			if (lineRequest == null || lineRequest.getBatchCode() == null || lineRequest.getBatchCode().isBlank()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"El código de lote es obligatorio para el producto: " + product.getName());
			}
		}

		if (reqExp) {
			if (lineRequest == null || lineRequest.getExpirationDate() == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"La fecha de vencimiento es obligatoria para el producto: " + product.getName());
			}
		}

		if (lineRequest == null || lineRequest.getBatchCode() == null || lineRequest.getBatchCode().isBlank()) {
			return null;
		}

		String batchCode = lineRequest.getBatchCode().trim();
		if (productBatchRepository.existsByBatchCodeIgnoreCase(batchCode)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch code already exists: " + batchCode);
		}

		LocalDate entryDate = LocalDate.now();
		LocalDate expirationDate = lineRequest.getExpirationDate();
		if (expirationDate == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"La fecha de vencimiento es obligatoria al registrar un lote para el producto: " + product.getName());
		}
		if (expirationDate.isBefore(entryDate)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiration date must be on or after entry date");
		}

		ProductBatch batch = new ProductBatch();
		batch.setProduct(product);
		batch.setBatchCode(batchCode);
		batch.setInitialQuantity(quantityToReceive);
		batch.setCurrentQuantity(BigDecimal.ZERO);
		batch.setEntryDate(entryDate);
		batch.setExpirationDate(expirationDate);
		batch.setPurchaseOrderItemId(item.getId());
		batch.setWarehouseZone(lineRequest.getWarehouseZone());
		batch.setQcNotes(buildQcNotes(lineRequest));
		batch.setCreatedAt(LocalDateTime.now());
		return productBatchRepository.save(batch);
	}

	private String buildQcNotes(PurchaseReceiptItemRequestDTO lineRequest) {
		if (lineRequest == null) {
			return null;
		}
		StringBuilder notes = new StringBuilder();
		if (lineRequest.getQuantityRejected() != null && lineRequest.getQuantityRejected().compareTo(BigDecimal.ZERO) > 0) {
			notes.append("Rechazado: ").append(lineRequest.getQuantityRejected());
		}
		if (lineRequest.getQcNotes() != null && !lineRequest.getQcNotes().isBlank()) {
			if (notes.length() > 0) {
				notes.append(" | ");
			}
			notes.append(lineRequest.getQcNotes().trim());
		}
		return notes.length() > 0 ? notes.toString() : null;
	}

	private String buildReceiptNotes(PurchaseReceiptItemRequestDTO lineRequest, String orderNumber) {
		String base = "Recepcion de compra " + orderNumber;
		if (lineRequest == null) {
			return base;
		}
		String qc = buildQcNotes(lineRequest);
		if (qc == null) {
			return base;
		}
		return base + " | QC: " + qc;
	}
}
