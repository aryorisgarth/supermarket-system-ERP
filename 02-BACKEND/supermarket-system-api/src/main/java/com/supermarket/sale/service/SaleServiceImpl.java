package com.supermarket.sale.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.audit.service.AuditLogService;
import com.supermarket.billing.service.ElectronicInvoiceService;
import com.supermarket.billing.service.PaymentGatewayService;
import com.supermarket.customer.entity.Customer;
import com.supermarket.customer.repository.CustomerRepository;
import com.supermarket.exception.BadRequestException;
import com.supermarket.exception.ConflictException;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.exception.UnauthorizedException;
import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.product.repository.ProductUomConversionRepository;
import com.supermarket.promotion.dto.AppliedPromotionDTO;
import com.supermarket.promotion.service.PromotionService;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.security.SecurityUtils;
import com.supermarket.cashregister.entity.CashRegisterSession;
import com.supermarket.cashregister.service.CashRegisterService;
import com.supermarket.customer.dto.CustomerSummaryDTO;
import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.sale.dto.CreditNoteResponseDTO;
import com.supermarket.sale.dto.RefundLineRequestDTO;
import com.supermarket.sale.dto.RefundRequestDTO;
import com.supermarket.sale.dto.RefundableLineDTO;
import com.supermarket.sale.dto.RefundableSaleDTO;
import com.supermarket.sale.dto.SalePaymentRequestDTO;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.sale.dto.SaleLineRequestDTO;
import com.supermarket.sale.dto.SaleRequestDTO;
import com.supermarket.sale.dto.SaleResponseDTO;
import com.supermarket.sale.dto.SaleSummaryResponseDTO;
import com.supermarket.sale.entity.Sale;
import com.supermarket.sale.entity.SaleDetail;
import com.supermarket.sale.entity.SalePayment;
import com.supermarket.sale.entity.CreditNote;
import com.supermarket.sale.entity.CreditNoteLine;
import com.supermarket.sale.entity.Coupon;
import com.supermarket.sale.mapper.CreditNoteMapper;
import com.supermarket.sale.mapper.SaleMapper;
import com.supermarket.sale.model.CouponStatus;
import com.supermarket.sale.model.CreditNoteType;
import com.supermarket.sale.model.SaleStatus;
import com.supermarket.sale.repository.CreditNoteLineRepository;
import com.supermarket.sale.repository.CreditNoteRepository;
import com.supermarket.sale.repository.CouponRepository;
import com.supermarket.sale.repository.SaleRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SaleServiceImpl implements SaleService {

	private static final int MONEY_SCALE = 4;

	private final SaleRepository saleRepository;
	private final CustomerRepository customerRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;
	private final SaleMapper saleMapper;
	private final InventoryLedger inventoryLedger;
	private final AuditLogService auditLogService;
	private final CashRegisterService cashRegisterService;
	private final CreditNoteRepository creditNoteRepository;
	private final CreditNoteLineRepository creditNoteLineRepository;
	private final CreditNoteMapper creditNoteMapper;
	private final CouponRepository couponRepository;
	private final PaymentGatewayService paymentGatewayService;
	private final ElectronicInvoiceService electronicInvoiceService;
	private final SaleInvoiceNumberGenerator saleInvoiceNumberGenerator;
	private final PromotionService promotionService;
	private final TransactionTemplate transactionTemplate;
	private final ProductUomConversionRepository productUomConversionRepository;
	private final SaleBatchAllocator saleBatchAllocator;

	@Override
	public Page<SaleSummaryResponseDTO> findAll(String search, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		if (normalized == null) {
			return saleRepository.findAllByOrderBySaleDateDesc(pageable).map(saleMapper::toSummary);
		}
		return saleRepository.searchPage(normalized, pageable).map(saleMapper::toSummary);
	}

	@Override
	public SaleResponseDTO findById(Long id) {
		Sale sale = saleRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
		return saleMapper.toResponse(sale);
	}

	@Override
	public SaleResponseDTO findByInvoiceNumber(String invoiceNumber) {
		Sale sale = saleRepository.findByInvoiceNumberIgnoreCase(invoiceNumber.trim())
				.orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
		return findById(sale.getId());
	}

	@Override
	@Transactional(propagation = Propagation.NOT_SUPPORTED)
	public SaleResponseDTO create(SaleRequestDTO request) {
		
		Sale saved = transactionTemplate.execute(status -> {
			String invoice = resolveInvoiceNumber(request.invoiceNumber());

			Long sellerId = SecurityUtils.currentUserId();
			User seller = userRepository.findById(sellerId)
					.orElseThrow(() -> new UnauthorizedException("User not found"));

			CashRegisterSession session = cashRegisterService.getActiveSessionEntity(sellerId);

			Customer customer = null;
			if (request.customerId() != null) {
				customer = customerRepository.findById(request.customerId())
						.orElseThrow(() -> new BadRequestException("Customer not found"));
			}

			ProcessedDetails processedDetails = processSaleLines(request.lines());
			BigDecimal totalAmount = processedDetails.subtotal().add(processedDetails.tax()).setScale(MONEY_SCALE, RoundingMode.HALF_UP);

			ProcessedPayments processedPayments = processPayments(request.payments(), totalAmount, customer);

			Sale sale = new Sale();
			sale.setCustomer(customer);
			sale.setUser(seller);
			sale.setSession(session);
			sale.setInvoiceNumber(invoice);
			sale.setStatus(SaleStatus.PENDING); 
			sale.setSubtotal(processedDetails.subtotal());
			sale.setTotalTax(processedDetails.tax());
			sale.setTotalAmount(totalAmount);
			sale.setChangeAmount(processedPayments.changeAmount());
			sale.setSaleDate(LocalDateTime.now());

			int pointsEarned = 0;
			if (customer != null) {
				pointsEarned = totalAmount.divide(BigDecimal.valueOf(10), 0, RoundingMode.DOWN).intValue();
				int currentPoints = customer.getPoints() != null ? customer.getPoints() : 0;
				customer.setPoints(currentPoints - processedPayments.pointsRedeemed() + pointsEarned);
				customerRepository.save(customer);
			}
			sale.setPointsEarned(pointsEarned);
			sale.setPointsRedeemed(processedPayments.pointsRedeemed());
			sale.setPointsValue(BigDecimal.valueOf(processedPayments.pointsRedeemed()));

			for (SaleDetail d : processedDetails.details()) {
				d.setSale(sale);
				sale.getDetails().add(d);
			}

			for (SalePayment p : processedPayments.payments()) {
				p.setSale(sale);
				sale.getPayments().add(p);
			}

			Sale tempSaved = saleRepository.save(sale);

			
			for (SaleDetail d : tempSaved.getDetails()) {
				BigDecimal itemFactor = d.getUomConversion() != null ? d.getUomConversion().getFactor() : BigDecimal.ONE;
				BigDecimal qtyBase = d.getQuantity().multiply(itemFactor);
				inventoryLedger.record(seller, d.getProduct(), d.getBatch(), InventoryMovementType.SALE, qtyBase,
						(byte) -1, tempSaved.getId(), d.getId(), "SALE", d.getUnitCost(), d.getUomConversion(), d.getQuantity(), null);
			}

			return tempSaved;
		});

		Long sellerId = SecurityUtils.currentUserId();
		User seller = userRepository.findById(sellerId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

		
		try {
			paymentGatewayService.captureForSale(saved, saved.getPayments());
			electronicInvoiceService.issueForSale(saved);
		} catch (Exception ex) {
			cancelSaleOnFailure(saved, seller);
			if (ex instanceof ResponseStatusException) {
				throw (ResponseStatusException) ex;
			}
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error al procesar cobro/facturación: " + ex.getMessage(), ex);
		}

		
		Sale confirmed = transactionTemplate.execute(status -> {
			Sale saleToConfirm = saleRepository.findById(saved.getId()).orElse(null);
			if (saleToConfirm != null) {
				saleToConfirm.setStatus(SaleStatus.PAID);
				saleRepository.save(saleToConfirm);
			}
			return saleToConfirm;
		});

		BigDecimal discountTotal = confirmed.getDetails().stream()
				.map(d -> d.getDiscountAmount() != null ? d.getDiscountAmount() : BigDecimal.ZERO)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		auditLogService.record(sellerId, "SALE_CREATE", "sales", confirmed.getId(), null,
				Map.of(
						"invoice", confirmed.getInvoiceNumber(),
						"subtotal", confirmed.getSubtotal().toPlainString(),
						"discountTotal", discountTotal.toPlainString(),
						"tax", confirmed.getTotalTax().toPlainString(),
						"total", confirmed.getTotalAmount().toPlainString(),
						"change", confirmed.getChangeAmount().toPlainString()));

		return findById(confirmed.getId());
	}

	private Coupon applyCouponPayment(SalePaymentRequestDTO payment) {
		if (payment.couponCode() == null || payment.couponCode().isBlank()) {
			throw new BadRequestException("Coupon code is required for COUPON payments");
		}
		Coupon coupon = couponRepository.findByCodeForUpdate(payment.couponCode().trim())
				.orElseThrow(() -> new BadRequestException("Coupon not found"));
		if (coupon.getStatus() != CouponStatus.ACTIVE || coupon.isExpired()) {
			throw new BadRequestException("Coupon is not active");
		}
		if (coupon.getRemainingBalance().compareTo(payment.amount()) < 0) {
			throw new BadRequestException("Coupon balance is not enough");
		}
		coupon.setRemainingBalance(coupon.getRemainingBalance().subtract(payment.amount()).setScale(MONEY_SCALE, RoundingMode.HALF_UP));
		if (coupon.getRemainingBalance().compareTo(BigDecimal.ZERO) == 0) {
			coupon.setStatus(CouponStatus.USED);
			coupon.setUsedAt(LocalDateTime.now());
		}
		return coupon;
	}

	private String resolveInvoiceNumber(String requested) {
		if (requested != null && !requested.isBlank()) {
			String invoice = requested.trim();
			if (saleRepository.existsByInvoiceNumberIgnoreCase(invoice)) {
				throw new ConflictException("Invoice number already exists");
			}
			return invoice;
		}
		return saleInvoiceNumberGenerator.next();
	}

	@Override
	@Transactional
	public void cancel(Long id) {
		
		refund(id, new RefundRequestDTO("Anulación total de la venta", null));
	}

	@Override
	public RefundableSaleDTO getRefundable(Long saleId) {
		Sale sale = saleRepository.findById(saleId)
				.orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
		Map<Long, BigDecimal> returnedByDetail = returnedQuantityMap(saleId);

		List<RefundableLineDTO> lines = new ArrayList<>();
		BigDecimal refundableTotal = BigDecimal.ZERO;
		BigDecimal alreadyRefunded = sumCreditNotes(saleId);
		boolean fullyRefunded = true;

		for (SaleDetail d : sale.getDetails()) {
			BigDecimal returned = returnedByDetail.getOrDefault(d.getId(), BigDecimal.ZERO);
			BigDecimal returnable = d.getQuantity().subtract(returned);
			if (returnable.compareTo(BigDecimal.ZERO) > 0) {
				fullyRefunded = false;
			}
			BigDecimal unitRefund = unitRefund(d);
			refundableTotal = refundableTotal.add(unitRefund.multiply(returnable)).setScale(MONEY_SCALE, RoundingMode.HALF_UP);

			Long batchId = d.getBatch() != null ? d.getBatch().getId() : null;
			String batchCode = d.getBatch() != null ? d.getBatch().getBatchCode() : null;
			var p = d.getProduct();
			lines.add(new RefundableLineDTO(
					d.getId(),
					new ProductSummaryDTO(p.getId(), p.getBarcode(), p.getName()),
					batchId,
					batchCode,
					d.getQuantity(),
					returned,
					returnable,
					d.getUnitPrice(),
					d.getTaxApplied(),
					d.getDiscountAmount(),
					unitRefund));
		}

		CustomerSummaryDTO customerDto = null;
		if (sale.getCustomer() != null) {
			customerDto = new CustomerSummaryDTO(sale.getCustomer().getId(), sale.getCustomer().getFullName());
		}

		return new RefundableSaleDTO(
				sale.getId(),
				sale.getInvoiceNumber(),
				sale.getStatus(),
				sale.getSaleDate(),
				customerDto,
				sale.getTotalAmount(),
				alreadyRefunded,
				refundableTotal,
				fullyRefunded,
				lines);
	}

	@Override
	@Transactional
	public CreditNoteResponseDTO refund(Long saleId, RefundRequestDTO request) {
		Long actorId = SecurityUtils.currentUserId();
		User actor = userRepository.findById(actorId)
				.orElseThrow(() -> new UnauthorizedException("User not found"));

		Sale sale = saleRepository.findById(saleId)
				.orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
		if (sale.getStatus() == SaleStatus.CANCELLED || sale.getStatus() == SaleStatus.REFUNDED) {
			throw new ConflictException("La venta ya está anulada o totalmente reembolsada");
		}
		if (sale.getStatus() != SaleStatus.PAID && sale.getStatus() != SaleStatus.PARTIALLY_REFUNDED) {
			throw new BadRequestException("Solo se pueden devolver ventas pagadas");
		}

		CashRegisterSession session = cashRegisterService.getActiveSessionEntity(actorId);
		boolean hadPriorRefund = !creditNoteRepository.findBySaleIdOrderByCreatedAtDesc(saleId).isEmpty();
		Map<Long, BigDecimal> returnedByDetail = returnedQuantityMap(saleId);
		Map<Long, SaleDetail> detailsById = new HashMap<>();
		for (SaleDetail d : sale.getDetails()) {
			detailsById.put(d.getId(), d);
		}

		
		Map<Long, BigDecimal> toRefund = determineRefundQuantities(request, sale, returnedByDetail, detailsById);

		CreditNote creditNote = new CreditNote();
		creditNote.setSale(sale);
		creditNote.setSession(session);
		creditNote.setUser(actor);
		creditNote.setReason(request.reason());
		creditNote.setCreatedAt(LocalDateTime.now());
		creditNote.setCreditNoteNumber(nextCreditNoteNumber());

		BigDecimal totalSubtotal = BigDecimal.ZERO;
		BigDecimal totalTax = BigDecimal.ZERO;
		BigDecimal totalRefund = BigDecimal.ZERO;

		for (Map.Entry<Long, BigDecimal> entry : toRefund.entrySet()) {
			SaleDetail d = detailsById.get(entry.getKey());
			BigDecimal qty = entry.getValue();

			BigDecimal perUnitNet = d.getSubtotal().divide(d.getQuantity(), MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal subtotalPortion = perUnitNet.multiply(qty).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal taxPortion = subtotalPortion.multiply(d.getTaxApplied())
					.divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal lineRefund = subtotalPortion.add(taxPortion).setScale(MONEY_SCALE, RoundingMode.HALF_UP);

			BigDecimal itemFactor = d.getUomConversion() != null ? d.getUomConversion().getFactor() : BigDecimal.ONE;
			BigDecimal qtyBase = qty.multiply(itemFactor);
			inventoryLedger.record(actor, d.getProduct(), d.getBatch(), InventoryMovementType.RETURN, qtyBase,
					(byte) 1, sale.getId(), d.getId(), "SALE_REFUND", d.getUnitCost(), d.getUomConversion(), qty, "Devolución venta " + sale.getInvoiceNumber());

			CreditNoteLine cnl = new CreditNoteLine();
			cnl.setCreditNote(creditNote);
			cnl.setSaleDetail(d);
			cnl.setProduct(d.getProduct());
			cnl.setBatch(d.getBatch());
			cnl.setQuantity(qty);
			cnl.setUnitPrice(d.getUnitPrice());
			cnl.setTaxApplied(d.getTaxApplied());
			cnl.setRefundAmount(lineRefund);
			creditNote.getLines().add(cnl);

			totalSubtotal = totalSubtotal.add(subtotalPortion);
			totalTax = totalTax.add(taxPortion);
			totalRefund = totalRefund.add(lineRefund);
		}

		creditNote.setSubtotal(totalSubtotal.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
		creditNote.setTotalTax(totalTax.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
		creditNote.setAmount(totalRefund.setScale(MONEY_SCALE, RoundingMode.HALF_UP));

		
		boolean nowFullyRefunded = true;
		for (SaleDetail d : sale.getDetails()) {
			BigDecimal totalReturned = returnedByDetail.getOrDefault(d.getId(), BigDecimal.ZERO)
					.add(toRefund.getOrDefault(d.getId(), BigDecimal.ZERO));
			if (totalReturned.compareTo(d.getQuantity()) < 0) {
				nowFullyRefunded = false;
				break;
			}
		}

		creditNote.setType(!hadPriorRefund && nowFullyRefunded ? CreditNoteType.FULL : CreditNoteType.PARTIAL);
		CreditNote saved = creditNoteRepository.save(creditNote);

		sale.setStatus(nowFullyRefunded ? SaleStatus.REFUNDED : SaleStatus.PARTIALLY_REFUNDED);
		saleRepository.save(sale);

		if (sale.getCustomer() != null) {
			Customer customer = sale.getCustomer();
			int currentPoints = customer.getPoints() != null ? customer.getPoints() : 0;
			int pointsEarnedToRevert = totalRefund.divide(BigDecimal.valueOf(10), 0, RoundingMode.DOWN).intValue();
			int pointsRedeemedToRefund = 0;
			if (sale.getPointsRedeemed() != null && sale.getPointsRedeemed() > 0) {
				pointsRedeemedToRefund = BigDecimal.valueOf(sale.getPointsRedeemed())
						.multiply(totalRefund)
						.divide(sale.getTotalAmount(), 0, RoundingMode.HALF_UP)
						.intValue();
			}
			customer.setPoints(Math.max(0, currentPoints + pointsRedeemedToRefund - pointsEarnedToRevert));
			customerRepository.save(customer);
		}

		auditLogService.record(actorId, "SALE_REFUND", "sales", saleId,
				Map.of("status", sale.getStatus() == SaleStatus.REFUNDED ? "PARTIALLY_REFUNDED/PAID" : "PAID",
						"invoice", sale.getInvoiceNumber()),
				Map.of("status", sale.getStatus().name(),
						"creditNote", saved.getCreditNoteNumber(),
						"refundAmount", saved.getAmount().toPlainString()));

		return creditNoteMapper.toResponse(saved);
	}

	@Override
	public Page<CreditNoteResponseDTO> findCreditNotes(Pageable pageable) {
		return creditNoteRepository.findAllByOrderByCreatedAtDesc(pageable)
				.map(creditNoteMapper::toResponse);
	}

	@Override
	public List<CreditNoteResponseDTO> findCreditNotesBySale(Long saleId) {
		return creditNoteRepository.findBySaleIdOrderByCreatedAtDesc(saleId).stream()
				.map(creditNoteMapper::toResponse)
				.toList();
	}

	private Map<Long, BigDecimal> returnedQuantityMap(Long saleId) {
		Map<Long, BigDecimal> map = new HashMap<>();
		for (var row : creditNoteLineRepository.sumReturnedQuantityBySaleId(saleId)) {
			map.put(row.getSaleDetailId(), row.getReturned() != null ? row.getReturned() : BigDecimal.ZERO);
		}
		return map;
	}

	private BigDecimal sumCreditNotes(Long saleId) {
		return creditNoteRepository.findBySaleIdOrderByCreatedAtDesc(saleId).stream()
				.map(CreditNote::getAmount)
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}

	
	private BigDecimal unitRefund(SaleDetail d) {
		BigDecimal perUnitNet = d.getSubtotal().divide(d.getQuantity(), MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal perUnitTax = perUnitNet.multiply(d.getTaxApplied())
				.divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP);
		return perUnitNet.add(perUnitTax).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}

	private String nextCreditNoteNumber() {
		long next = creditNoteRepository.count() + 1;
		return String.format("NC-%06d", next);
	}

	
	private BigDecimal resolveLineDiscount(Long productId, BigDecimal quantity, Long uomConversionId, BigDecimal requestedDiscount) {
		BigDecimal promoDiscount = promotionService.bestPromotion(productId, quantity, uomConversionId)
				.map(AppliedPromotionDTO::discountAmount)
				.orElse(BigDecimal.ZERO);

		BigDecimal requested = requestedDiscount != null ? requestedDiscount : BigDecimal.ZERO;
		if (requested.compareTo(BigDecimal.ZERO) <= 0) {
			return promoDiscount;
		}

		if (promoDiscount.compareTo(BigDecimal.ZERO) > 0
				&& requested.subtract(promoDiscount).abs().compareTo(new BigDecimal("0.0001")) <= 0) {
			return promoDiscount;
		}

		if (!SecurityUtils.hasAuthority("SALE_DISCOUNT")) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permiso para aplicar descuentos");
		}
		return requested;
	}



	private record ProcessedDetails(List<SaleDetail> details, BigDecimal subtotal, BigDecimal tax) {}
	private record ProcessedPayments(List<SalePayment> payments, BigDecimal changeAmount, int pointsRedeemed) {}

	private ProcessedDetails processSaleLines(List<SaleLineRequestDTO> lines) {
		List<SaleDetail> builtDetails = new ArrayList<>();
		BigDecimal headerSubtotal = BigDecimal.ZERO;
		BigDecimal headerTax = BigDecimal.ZERO;

		for (SaleLineRequestDTO line : lines) {
			Product product = productRepository.findByIdForUpdate(line.productId())
					.orElseThrow(() -> new BadRequestException("Product not found: " + line.productId()));
			if (!Boolean.TRUE.equals(product.getIsActive())) {
				throw new BadRequestException(
						"El producto no está activo: " + product.getName() + " (" + product.getBarcode() + ")");
			}

			ProductUomConversion conversion = null;
			BigDecimal factor = BigDecimal.ONE;
			if (line.uomConversionId() != null) {
				conversion = productUomConversionRepository.findByIdAndProductId(line.uomConversionId(), product.getId())
						.orElseThrow(() -> new BadRequestException("UOM conversion not found for product: " + line.productId()));
				factor = conversion.getFactor();
			}

			BigDecimal unitPrice = line.unitPrice();
			if (unitPrice == null) {
				if (conversion != null && conversion.getSalePrice() != null) {
					unitPrice = conversion.getSalePrice();
				} else if (conversion != null) {
					unitPrice = product.getSalePrice().multiply(factor);
				} else {
					unitPrice = product.getSalePrice();
				}
			}

			BigDecimal unitCost = product.getPurchasePrice() != null
					? product.getPurchasePrice().multiply(factor)
					: BigDecimal.ZERO;
			BigDecimal taxApplied = product.getTaxCategory().getPercentage();
			BigDecimal discount = resolveLineDiscount(line.productId(), line.quantity(), line.uomConversionId(), line.discountAmount());

			BigDecimal lineGross = unitPrice.multiply(line.quantity());
			if (discount.compareTo(lineGross) > 0) {
				throw new BadRequestException("El descuento no puede exceder el total bruto de la línea para el producto: " + product.getName());
			}

			BigDecimal lineNet = lineGross.subtract(discount)
					.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
			if (lineNet.compareTo(BigDecimal.ZERO) < 0) {
				throw new BadRequestException("Line amount cannot be negative");
			}

			BigDecimal quantityBase = line.quantity().multiply(factor);

			if (product.getCurrentStock().compareTo(quantityBase) < 0) {
				throw new ConflictException("Insufficient stock for product " + product.getBarcode() + ". Requerido: " + quantityBase + ", Disponible: " + product.getCurrentStock());
			}

			List<SaleBatchAllocator.Portion> portions = saleBatchAllocator.allocatePortions(product, line, quantityBase, factor);

			for (SaleBatchAllocator.Portion portion : portions) {
				BigDecimal portionGross = unitPrice.multiply(portion.quantityCommercial);
				BigDecimal portionDiscount = BigDecimal.ZERO;
				if (line.quantity().compareTo(BigDecimal.ZERO) > 0) {
					portionDiscount = discount.multiply(portion.quantityCommercial)
							.divide(line.quantity(), MONEY_SCALE, RoundingMode.HALF_UP);
				}

				BigDecimal portionTotalPaid = portionGross.subtract(portionDiscount)
						.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
				if (portionTotalPaid.compareTo(BigDecimal.ZERO) < 0) {
					portionTotalPaid = BigDecimal.ZERO;
				}

				BigDecimal taxDivisor = BigDecimal.ONE.add(
						taxApplied.divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP)
				);
				BigDecimal portionNetBase = portionTotalPaid.divide(taxDivisor, MONEY_SCALE, RoundingMode.HALF_UP);
				BigDecimal portionTax = portionTotalPaid.subtract(portionNetBase).setScale(MONEY_SCALE, RoundingMode.HALF_UP);

				SaleDetail detail = new SaleDetail();
				detail.setProduct(product);
				detail.setBatch(portion.batch);
				detail.setUomConversion(conversion);
				detail.setQuantity(portion.quantityCommercial);
				detail.setUnitPrice(unitPrice);
				detail.setTaxApplied(taxApplied);
				detail.setDiscountAmount(portionDiscount);
				detail.setUnitCost(unitCost);
				detail.setGrossProfit(portionNetBase.subtract(unitCost.multiply(portion.quantityCommercial))
						.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
				detail.setSubtotal(portionNetBase);

				builtDetails.add(detail);
				headerSubtotal = headerSubtotal.add(portionNetBase);
				headerTax = headerTax.add(portionTax);
			}
		}
		return new ProcessedDetails(builtDetails, headerSubtotal, headerTax);
	}

	private ProcessedPayments processPayments(List<SalePaymentRequestDTO> paymentRequests, BigDecimal totalAmount, Customer customer) {
		BigDecimal totalPaid = BigDecimal.ZERO;
		List<SalePayment> builtPayments = new ArrayList<>();
		boolean hasCashPayment = false;
		int pointsRedeemed = 0;
		for (SalePaymentRequestDTO p : paymentRequests) {
			totalPaid = totalPaid.add(p.amount());
			if (p.method() == PaymentMethod.CASH) {
				hasCashPayment = true;
			}
			SalePayment sp = new SalePayment();
			sp.setPaymentMethod(p.method());
			sp.setAmount(p.amount());
			if (p.method() == PaymentMethod.COUPON) {
				sp.setCoupon(applyCouponPayment(p));
			} else if (p.method() == PaymentMethod.POINTS) {
				if (customer == null) {
					throw new BadRequestException("Se requiere cliente para pagar con puntos");
				}
				int requiredPoints = p.amount().setScale(0, RoundingMode.CEILING).intValue();
				if (customer.getPoints() == null || customer.getPoints() < requiredPoints) {
					throw new BadRequestException("Puntos insuficientes. Requerido: " + requiredPoints + ", Disponible: " + (customer.getPoints() != null ? customer.getPoints() : 0));
				}
				pointsRedeemed += requiredPoints;
			}
			builtPayments.add(sp);
		}

		if (totalPaid.compareTo(totalAmount) < 0) {
			throw new BadRequestException("Total paid is less than the invoice amount");
		}

		BigDecimal changeAmount = totalPaid.subtract(totalAmount);
		if (changeAmount.compareTo(BigDecimal.ZERO) > 0 && !hasCashPayment) {
			throw new BadRequestException("Change can only be given for CASH payments");
		}
		return new ProcessedPayments(builtPayments, changeAmount, pointsRedeemed);
	}

	private void cancelSaleOnFailure(Sale saved, User seller) {
		transactionTemplate.execute(status -> {
			Sale saleToCancel = saleRepository.findById(saved.getId()).orElse(null);
			if (saleToCancel != null) {
				saleToCancel.setStatus(SaleStatus.CANCELLED);
				saleRepository.save(saleToCancel);
				
				for (SaleDetail d : saleToCancel.getDetails()) {
					BigDecimal itemFactor = d.getUomConversion() != null ? d.getUomConversion().getFactor() : BigDecimal.ONE;
					BigDecimal qtyBase = d.getQuantity().multiply(itemFactor);
					inventoryLedger.record(seller, d.getProduct(), d.getBatch(), InventoryMovementType.RETURN, qtyBase,
							(byte) 1, saleToCancel.getId(), d.getId(), "SALE_CANCEL", d.getUnitCost(), d.getUomConversion(), d.getQuantity(), "Reversión por cobro o facturación fallida");
				}
				
				for (SalePayment p : saleToCancel.getPayments()) {
					if (p.getPaymentMethod() == PaymentMethod.COUPON && p.getCoupon() != null) {
						Coupon coupon = p.getCoupon();
						coupon.setRemainingBalance(coupon.getRemainingBalance().add(p.getAmount()));
						coupon.setStatus(CouponStatus.ACTIVE);
						coupon.setUsedAt(null);
						couponRepository.save(coupon);
					}
				}

				if (saleToCancel.getCustomer() != null) {
					Customer customer = saleToCancel.getCustomer();
					int pointsEarned = saleToCancel.getPointsEarned() != null ? saleToCancel.getPointsEarned() : 0;
					int pointsRedeemed = saleToCancel.getPointsRedeemed() != null ? saleToCancel.getPointsRedeemed() : 0;
					int currentPoints = customer.getPoints() != null ? customer.getPoints() : 0;
					customer.setPoints(Math.max(0, currentPoints + pointsRedeemed - pointsEarned));
					customerRepository.save(customer);
				}
			}
			return null;
		});
	}

	private Map<Long, BigDecimal> determineRefundQuantities(RefundRequestDTO request, Sale sale, Map<Long, BigDecimal> returnedByDetail, Map<Long, SaleDetail> detailsById) {
		Map<Long, BigDecimal> toRefund = new HashMap<>();
		if (request.lines() == null || request.lines().isEmpty()) {
			for (SaleDetail d : sale.getDetails()) {
				BigDecimal returnable = d.getQuantity().subtract(returnedByDetail.getOrDefault(d.getId(), BigDecimal.ZERO));
				if (returnable.compareTo(BigDecimal.ZERO) > 0) {
					toRefund.put(d.getId(), returnable);
				}
			}
		} else {
			for (RefundLineRequestDTO line : request.lines()) {
				SaleDetail d = detailsById.get(line.saleDetailId());
				if (d == null) {
					throw new BadRequestException("La línea " + line.saleDetailId() + " no pertenece a esta venta");
				}
				BigDecimal returnable = d.getQuantity().subtract(returnedByDetail.getOrDefault(d.getId(), BigDecimal.ZERO));
				if (line.quantity().compareTo(returnable) > 0) {
					throw new BadRequestException("Cantidad a devolver mayor a la disponible en \""
							+ d.getProduct().getName() + "\" (máx " + returnable.stripTrailingZeros().toPlainString() + ")");
				}
				if (line.quantity().compareTo(BigDecimal.ZERO) > 0) {
					toRefund.merge(d.getId(), line.quantity(), BigDecimal::add);
				}
			}
		}

		if (toRefund.isEmpty()) {
			throw new BadRequestException("No hay cantidades válidas para devolver");
		}
		return toRefund;
	}


}
