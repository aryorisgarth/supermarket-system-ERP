package com.supermarket.alerts.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.alerts.dto.SystemAlertResponseDTO;
import com.supermarket.alerts.entity.SystemAlert;
import com.supermarket.alerts.event.NotificationEvent;
import com.supermarket.alerts.repository.SystemAlertRepository;
import com.supermarket.billing.entity.PaymentGatewayTransaction;
import com.supermarket.billing.model.SettlementStatus;
import com.supermarket.billing.repository.PaymentGatewayTransactionRepository;
import com.supermarket.cashregister.model.SessionStatus;
import com.supermarket.cashregister.repository.CashRegisterSessionRepository;
import com.supermarket.inventorycount.entity.InventoryCountSession;
import com.supermarket.inventorycount.model.InventoryCountStatus;
import com.supermarket.inventorycount.repository.InventoryCountSessionRepository;
import com.supermarket.product.entity.Product;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.purchase.model.PurchaseOrderStatus;
import com.supermarket.purchase.repository.PurchaseOrderRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.dto.UserSummaryDTO;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemAlertService {

	private static final String ACTIVE = "ACTIVE";
	private static final String RESOLVED = "RESOLVED";

	private final SystemAlertRepository systemAlertRepository;
	private final ProductRepository productRepository;
	private final CashRegisterSessionRepository cashRegisterSessionRepository;
	private final PurchaseOrderRepository purchaseOrderRepository;
	private final PaymentGatewayTransactionRepository paymentGatewayTransactionRepository;
	private final UserRepository userRepository;
	private final InventoryCountSessionRepository inventoryCountSessionRepository;
	private final ProductBatchRepository productBatchRepository;
	private final ApplicationEventPublisher eventPublisher;

	public List<SystemAlertResponseDTO> findAll(String status) {
		List<SystemAlert> alerts = status == null || status.isBlank()
				? systemAlertRepository.findAllByOrderByCreatedAtDesc()
				: systemAlertRepository.findByStatusOrderByCreatedAtDesc(status);
		return alerts.stream().map(this::toResponse).toList();
	}

	public Page<SystemAlertResponseDTO> findPage(String status, String type, String search, Pageable pageable) {
		String normalizedStatus = (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) ? null : status;
		String normalizedType = (type == null || type.isBlank() || "ALL".equalsIgnoreCase(type)) ? null : type;
		String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
		return systemAlertRepository.searchPage(normalizedStatus, normalizedType, normalizedSearch, pageable)
				.map(this::toResponse);
	}

	@Transactional
	public List<SystemAlertResponseDTO> generate() {
		generateLowStockAlerts();
		generateOpenCashRegisterAlert();
		generatePendingPurchaseAlerts();
		generateOverdueSettlementAlerts();
		generatePendingInventoryCountAlerts();
		generateExpiredBatchStockAlerts();
		return findAll(ACTIVE);
	}

	@Transactional
	public SystemAlertResponseDTO resolve(Long id) {
		SystemAlert alert = systemAlertRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));
		User user = userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
		alert.setStatus(RESOLVED);
		alert.setResolvedAt(LocalDateTime.now());
		alert.setResolvedBy(user);
		alert.setUpdatedAt(LocalDateTime.now());
		return toResponse(systemAlertRepository.save(alert));
	}

	@Transactional
	public void notifyInventoryCountSubmitted(InventoryCountSession session) {
		upsertActive(
				"INVENTORY_COUNT:" + session.getId(),
				"WAREHOUSE",
				"WARNING",
				"Conteo pendiente de aprobación",
				session.getSessionCode() + " fue enviado y espera revisión del supervisor.",
				"Bodega",
				session.getId(),
				"/bodega/conteo/" + session.getId());
	}

	@Transactional
	public void resolveInventoryCountAlert(Long sessionId) {
		systemAlertRepository.findByAlertKey("INVENTORY_COUNT:" + sessionId)
				.filter(alert -> ACTIVE.equals(alert.getStatus()))
				.ifPresent(alert -> {
					alert.setStatus(RESOLVED);
					alert.setResolvedAt(LocalDateTime.now());
					alert.setUpdatedAt(LocalDateTime.now());
					systemAlertRepository.save(alert);
				});
	}

	@Transactional
	public void resolveAlert(String alertKey) {
		systemAlertRepository.findByAlertKey(alertKey)
				.filter(alert -> ACTIVE.equals(alert.getStatus()))
				.ifPresent(alert -> {
					alert.setStatus(RESOLVED);
					alert.setResolvedAt(LocalDateTime.now());
					alert.setUpdatedAt(LocalDateTime.now());
					systemAlertRepository.save(alert);
				});
	}

	private void generateLowStockAlerts() {
		for (Product product : productRepository.findLowStockOrderByBarcodeAsc()) {
			upsertActive(
					"LOW_STOCK:" + product.getId(),
					"INVENTORY",
					"CRITICAL",
					"Stock crítico",
					product.getName() + " tiene " + product.getCurrentStock() + " unidades. Mínimo configurado: " + product.getMinimumStock() + ".",
					"Inventario",
					product.getId(),
					"/inventario");
		}
	}

	private void generateOpenCashRegisterAlert() {
		long openCount = cashRegisterSessionRepository.findAllByStatusOrderByOpenedAtDesc(SessionStatus.OPEN).size();
		if (openCount <= 0) {
			return;
		}
		upsertActive(
				"CASH_OPEN_SESSIONS",
				"CASH_REGISTER",
				"WARNING",
				"Cajas abiertas",
				openCount + " caja(s) permanecen abiertas. Revisa antes de cerrar el día.",
				"Control de cajas",
				null,
				"/control-cajas");
	}

	private void generatePendingPurchaseAlerts() {
		purchaseOrderRepository.findByStatusOrderByCreatedAtDesc(PurchaseOrderStatus.ORDERED)
				.forEach(order -> upsertActive(
						"PURCHASE_PENDING_RECEPTION:" + order.getId(),
						"PURCHASE",
						"INFO",
						"Recepción pendiente",
						"La orden " + order.getOrderNumber() + " de " + order.getSupplier().getCompanyName() + " fue aprobada y espera recepción en bodega.",
						"Compras",
						order.getId(),
						"/bodega/recepcion"));

		purchaseOrderRepository.findByStatusOrderByCreatedAtDesc(PurchaseOrderStatus.PARTIALLY_RECEIVED)
				.forEach(order -> upsertActive(
						"PURCHASE_PARTIAL:" + order.getId(),
						"PURCHASE",
						"WARNING",
						"Compra parcialmente recibida",
						order.getOrderNumber() + " tiene mercadería pendiente de recepción.",
						"Compras",
						order.getId(),
						"/bodega/recepcion"));
	}

	private void generateOverdueSettlementAlerts() {
		LocalDate today = LocalDate.now();
		for (PaymentGatewayTransaction tx : paymentGatewayTransactionRepository.findAllByOrderByCreatedAtDesc()) {
			if (tx.getSettlementStatus() != SettlementStatus.PENDING
					|| tx.getExpectedSettlementDate() == null
					|| !tx.getExpectedSettlementDate().isBefore(today)) {
				continue;
			}
			upsertActive(
					"SETTLEMENT_OVERDUE:" + tx.getId(),
					"FINANCE",
					"WARNING",
					"Liquidación vencida",
					"La transacción " + tx.getExternalReference() + " debió liquidarse el " + tx.getExpectedSettlementDate() + ".",
					"Finanzas",
					tx.getId(),
					"/finanzas");
		}
	}

	private void generatePendingInventoryCountAlerts() {
		for (InventoryCountSession session : inventoryCountSessionRepository
				.findByStatusOrderBySubmittedAtDesc(InventoryCountStatus.SUBMITTED)) {
			upsertActive(
					"INVENTORY_COUNT:" + session.getId(),
					"WAREHOUSE",
					"WARNING",
					"Conteo pendiente de aprobación",
					session.getSessionCode() + " fue enviado y espera revisión del supervisor.",
					"Bodega",
					session.getId(),
					"/bodega/conteo/" + session.getId());
		}
		
		for (InventoryCountSession session : inventoryCountSessionRepository.findAll()) {
			if (session.getStatus() == InventoryCountStatus.OPEN) {
				upsertActive(
						"INVENTORY_COUNT_OPEN:" + session.getId(),
						"WAREHOUSE",
						"INFO",
						"Conteo en progreso",
						"El conteo " + session.getSessionCode() + " está abierto. Termina de escanear y envíalo a aprobación.",
						"Bodega",
						session.getId(),
						"/bodega/conteo/" + session.getId());
			}
		}
	}

	private void generateExpiredBatchStockAlerts() {
		long expiredCount = productBatchRepository.findActiveExpired(LocalDate.now()).size();
		if (expiredCount <= 0) {
			return;
		}
		upsertActive(
				"BATCH_EXPIRED_STOCK",
				"WAREHOUSE",
				"CRITICAL",
				"Lotes vencidos con stock",
				expiredCount + " lote(s) vencido(s) aún tienen existencias. Ejecuta baja o revisa en Lotes.",
				"Bodega",
				null,
				"/lotes");
	}

	@Transactional
	public void upsertActive(String key, String type, String severity, String title, String message,
			String sourceModule, Long referenceId, String actionPath) {
		LocalDateTime now = LocalDateTime.now();
		SystemAlert alert = systemAlertRepository.findByAlertKey(key).orElseGet(() -> {
			SystemAlert created = new SystemAlert();
			created.setAlertKey(key);
			created.setCreatedAt(now);
			return created;
		});
		if (RESOLVED.equals(alert.getStatus())) {
			return;
		}
		boolean isNew = alert.getId() == null;
		alert.setType(type);
		alert.setSeverity(severity);
		alert.setStatus(ACTIVE);
		alert.setTitle(title);
		alert.setMessage(message);
		alert.setSourceModule(sourceModule);
		alert.setReferenceId(referenceId);
		alert.setActionPath(actionPath);
		alert.setUpdatedAt(now);
		systemAlertRepository.save(alert);

		if (isNew) {
			eventPublisher.publishEvent(new NotificationEvent(this, type, severity, title, message, actionPath));
		}
	}

	private SystemAlertResponseDTO toResponse(SystemAlert alert) {
		User resolvedBy = alert.getResolvedBy();
		UserSummaryDTO user = resolvedBy == null ? null : new UserSummaryDTO(
				resolvedBy.getId(),
				resolvedBy.getFullName(),
				resolvedBy.getEmail());
		return new SystemAlertResponseDTO(
				alert.getId(),
				alert.getAlertKey(),
				alert.getType(),
				alert.getSeverity(),
				alert.getStatus(),
				alert.getTitle(),
				alert.getMessage(),
				alert.getSourceModule(),
				alert.getReferenceId(),
				alert.getActionPath(),
				alert.getCreatedAt(),
				alert.getUpdatedAt(),
				alert.getResolvedAt(),
				user);
	}
}
