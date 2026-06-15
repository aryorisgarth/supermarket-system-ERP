package com.supermarket.dailyclosure.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.dailyclosure.dto.DailyClosureRequestDTO;
import com.supermarket.dailyclosure.dto.DailyClosureResponseDTO;
import com.supermarket.dailyclosure.entity.DailyClosure;
import com.supermarket.dailyclosure.repository.DailyClosureRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.dto.UserSummaryDTO;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.sale.repository.SaleRepository;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.purchase.repository.PurchaseOrderRepository;
import com.supermarket.purchase.model.PurchaseOrderStatus;
import com.supermarket.cashregister.repository.CashRegisterSessionRepository;
import com.supermarket.cashregister.model.SessionStatus;
import com.supermarket.billing.repository.PaymentGatewayTransactionRepository;
import com.supermarket.billing.model.SettlementStatus;
import com.supermarket.alerts.repository.SystemAlertRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DailyClosureService {

	private final DailyClosureRepository dailyClosureRepository;
	private final UserRepository userRepository;
	private final SaleRepository saleRepository;
	private final PurchaseOrderRepository purchaseOrderRepository;
	private final CashRegisterSessionRepository cashRegisterSessionRepository;
	private final PaymentGatewayTransactionRepository paymentGatewayTransactionRepository;
	private final SystemAlertRepository systemAlertRepository;

	public List<DailyClosureResponseDTO> findAll() {
		return dailyClosureRepository.findAllByOrderByClosureDateDesc().stream()
				.map(this::toResponse)
				.toList();
	}

	public Optional<DailyClosureResponseDTO> findByDate(LocalDate date) {
		return dailyClosureRepository.findByClosureDate(date)
				.map(this::toResponse);
	}

	@Transactional
	public DailyClosureResponseDTO create(DailyClosureRequestDTO request) {
		LocalDate date = request.closureDate();
		if (dailyClosureRepository.existsByClosureDate(date)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Daily closure already exists for this date");
		}

		long openSessions = cashRegisterSessionRepository.countByStatus(SessionStatus.OPEN);
		if (openSessions > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot close day with open cash register sessions");
		}

		User actor = userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

		LocalDateTime start = date.atStartOfDay();
		LocalDateTime end = date.plusDays(1).atStartOfDay();

		
		BigDecimal calculatedTotalSales = BigDecimal.ZERO;
		long calculatedSalesCount = 0;
		BigDecimal calculatedTotalCost = BigDecimal.ZERO;

		Object[] kpis = saleRepository.salesKpisNative(start, end);
		if (kpis != null && kpis.length > 0 && kpis[0] != null) {
			if (kpis[0] instanceof Object[]) {
				Object[] row = (Object[]) kpis[0];
				calculatedTotalSales = row[0] != null ? (BigDecimal) row[0] : BigDecimal.ZERO;
				calculatedSalesCount = row[1] != null ? ((Number) row[1]).longValue() : 0L;
				calculatedTotalCost = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
			} else {
				calculatedTotalSales = kpis[0] != null ? (BigDecimal) kpis[0] : BigDecimal.ZERO;
				calculatedSalesCount = kpis[1] != null ? ((Number) kpis[1]).longValue() : 0L;
				calculatedTotalCost = kpis[2] != null ? (BigDecimal) kpis[2] : BigDecimal.ZERO;
			}
		}

		BigDecimal calculatedGrossProfit = calculatedTotalSales.subtract(calculatedTotalCost);
		BigDecimal calculatedMargin = BigDecimal.ZERO;
		if (calculatedTotalSales.compareTo(BigDecimal.ZERO) > 0) {
			calculatedMargin = calculatedGrossProfit.multiply(BigDecimal.valueOf(100))
					.divide(calculatedTotalSales, 2, RoundingMode.HALF_UP);
		}

		
		BigDecimal calculatedCashSales = saleRepository.sumPaymentsByDateBetweenAndMethod(start, end, PaymentMethod.CASH);
		BigDecimal calculatedCardSales = saleRepository.sumPaymentsByDateBetweenAndMethod(start, end, PaymentMethod.CARD);
		BigDecimal calculatedTransferSales = saleRepository.sumPaymentsByDateBetweenAndMethod(start, end, PaymentMethod.TRANSFER);

		
		long closedSessionsCount = cashRegisterSessionRepository.countByStatusAndClosedAtBetween(SessionStatus.CLOSED, start, end);
		BigDecimal totalCashDifference = cashRegisterSessionRepository.sumDifferenceByClosedAtBetween(start, end);
		BigDecimal totalCardDifference = cashRegisterSessionRepository.sumCardDifferenceByClosedAtBetween(start, end);
		BigDecimal totalTransferDifference = cashRegisterSessionRepository.sumTransferDifferenceByClosedAtBetween(start, end);
		BigDecimal calculatedTotalDifference = totalCashDifference.add(totalCardDifference).add(totalTransferDifference);

		
		BigDecimal receivedPurchasesAmount = purchaseOrderRepository.sumReceivedPurchasesBetween(start, end);
		long pendingPurchasesCount = purchaseOrderRepository.countByStatusAndCreatedAtBetween(PurchaseOrderStatus.ORDERED, start, end);
		long partialPurchasesCount = purchaseOrderRepository.countByStatusAndCreatedAtBetween(PurchaseOrderStatus.PARTIALLY_RECEIVED, start, end);

		
		long pendingSettlementsCount = paymentGatewayTransactionRepository.countBySettlementStatus(SettlementStatus.PENDING);
		BigDecimal pendingSettlementsAmount = paymentGatewayTransactionRepository.sumAmountBySettlementStatus(SettlementStatus.PENDING);

		
		long stockAlertsCount = systemAlertRepository.countByStatus("ACTIVE");

		DailyClosure closure = new DailyClosure();
		closure.setClosureDate(date);
		closure.setTotalSales(calculatedTotalSales);
		closure.setSalesCount(calculatedSalesCount);
		closure.setGrossProfit(calculatedGrossProfit);
		closure.setGrossMarginPercentage(calculatedMargin);
		closure.setTotalCashSales(calculatedCashSales);
		closure.setTotalCardSales(calculatedCardSales);
		closure.setTotalTransferSales(calculatedTransferSales);
		closure.setTotalCashDifference(totalCashDifference);
		closure.setTotalCardDifference(totalCardDifference);
		closure.setTotalTransferDifference(totalTransferDifference);
		closure.setTotalDifference(calculatedTotalDifference);
		closure.setOpenSessionsCount(0L); 
		closure.setClosedSessionsCount(closedSessionsCount);
		closure.setReceivedPurchasesAmount(receivedPurchasesAmount);
		closure.setPendingPurchasesCount(pendingPurchasesCount);
		closure.setPartialPurchasesCount(partialPurchasesCount);
		closure.setPendingSettlementsCount(pendingSettlementsCount);
		closure.setPendingSettlementsAmount(pendingSettlementsAmount);
		closure.setStockAlertsCount(stockAlertsCount);
		closure.setAlertsJson(request.alertsJson());
		closure.setNotes(request.notes());
		closure.setClosedBy(actor);
		closure.setClosedAt(LocalDateTime.now());

		return toResponse(dailyClosureRepository.save(closure));
	}

	private DailyClosureResponseDTO toResponse(DailyClosure closure) {
		User user = closure.getClosedBy();
		return new DailyClosureResponseDTO(
				closure.getId(),
				closure.getClosureDate(),
				closure.getTotalSales(),
				closure.getSalesCount(),
				closure.getGrossProfit(),
				closure.getGrossMarginPercentage(),
				closure.getTotalCashSales(),
				closure.getTotalCardSales(),
				closure.getTotalTransferSales(),
				closure.getTotalCashDifference(),
				closure.getTotalCardDifference(),
				closure.getTotalTransferDifference(),
				closure.getTotalDifference(),
				closure.getOpenSessionsCount(),
				closure.getClosedSessionsCount(),
				closure.getReceivedPurchasesAmount(),
				closure.getPendingPurchasesCount(),
				closure.getPartialPurchasesCount(),
				closure.getPendingSettlementsCount(),
				closure.getPendingSettlementsAmount(),
				closure.getStockAlertsCount(),
				closure.getAlertsJson(),
				closure.getNotes(),
				new UserSummaryDTO(user.getId(), user.getFullName(), user.getEmail()),
				closure.getClosedAt());
	}

	private BigDecimal nz(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	private Long nz(Long value) {
		return value == null ? 0L : value;
	}
}
