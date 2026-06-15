package com.supermarket.report.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.inventory.entity.InventoryMovement;
import com.supermarket.inventory.repository.InventoryMovementRepository;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.purchase.repository.PurchaseOrderRepository;
import com.supermarket.report.dto.CustomerRankingReportDTO;
import com.supermarket.report.dto.DailySalesRowDTO;
import com.supermarket.report.dto.InventoryTurnoverDTO;
import com.supermarket.report.dto.KardexRowDTO;
import com.supermarket.report.dto.LowStockReportDTO;
import com.supermarket.report.dto.InventoryMovementReportDTO;
import com.supermarket.report.dto.PaymentMethodReportDTO;
import com.supermarket.report.dto.ProductPerformanceDTO;
import com.supermarket.report.dto.PurchasesVsSalesDTO;
import com.supermarket.report.dto.ReportKpiComparisonDTO;
import com.supermarket.report.dto.ReportKpiDTO;
import com.supermarket.report.dto.SalesByUserReportDTO;
import com.supermarket.report.dto.TopProductRowDTO;
import com.supermarket.sale.model.SaleStatus;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.sale.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

	private final SaleRepository saleRepository;
	private final ProductRepository productRepository;
	private final InventoryMovementRepository inventoryMovementRepository;
	private final PurchaseOrderRepository purchaseOrderRepository;

	private static final int MONEY_SCALE = 4;
	private static final int PERCENT_SCALE = 2;

	public List<DailySalesRowDTO> dailyPaidSales(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		return saleRepository.sumPaidSalesByDay(start, end).stream().map(row -> {
			LocalDate day = toLocalDate(row[0]);
			BigDecimal total = toBigDecimal(row[1]);
			return new DailySalesRowDTO(day, total);
		}).toList();
	}

	public List<TopProductRowDTO> topProducts(LocalDate from, LocalDate to, int limit) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		int lim = Math.min(Math.max(limit, 1), 100);
		return saleRepository.findTopProductsNative(start, end, lim).stream().map(row -> {
			Long id = toLong(row[0]);
			String name = (String) row[1];
			BigDecimal qty = toBigDecimal(row[2]);
			BigDecimal revenue = toBigDecimal(row[3]);
			return new TopProductRowDTO(id, name, qty, revenue);
		}).toList();
	}

	public List<ProductPerformanceDTO> productPerformance(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		return saleRepository.productPerformanceNative(start, end).stream().map(row -> {
			BigDecimal revenue = toBigDecimal(row[4]).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal grossProfit = toBigDecimal(row[6]).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal margin = revenue.compareTo(BigDecimal.ZERO) > 0
					? grossProfit.multiply(BigDecimal.valueOf(100)).divide(revenue, PERCENT_SCALE, RoundingMode.HALF_UP)
					: BigDecimal.ZERO.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);
			return new ProductPerformanceDTO(
					toLong(row[0]),
					(String) row[1],
					(String) row[2],
					toBigDecimal(row[3]),
					revenue,
					toBigDecimal(row[5]).setScale(MONEY_SCALE, RoundingMode.HALF_UP),
					grossProfit,
					margin);
		}).toList();
	}

	public List<InventoryTurnoverDTO> inventoryTurnover(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		long days = java.time.temporal.ChronoUnit.DAYS.between(from, to.plusDays(1));
		return saleRepository.inventoryTurnoverNative(start, end).stream().map(row -> {
			BigDecimal quantitySold = toBigDecimal(row[3]);
			BigDecimal currentStock = toBigDecimal(row[4]);
			BigDecimal averageDailySold = days > 0
					? quantitySold.divide(BigDecimal.valueOf(days), MONEY_SCALE, RoundingMode.HALF_UP)
					: BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal turnoverRatio = currentStock.compareTo(BigDecimal.ZERO) > 0
					? quantitySold.divide(currentStock, MONEY_SCALE, RoundingMode.HALF_UP)
					: BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal daysOfInventory = averageDailySold.compareTo(BigDecimal.ZERO) > 0
					? currentStock.divide(averageDailySold, PERCENT_SCALE, RoundingMode.HALF_UP)
					: BigDecimal.ZERO.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);
			boolean lowRotation = quantitySold.compareTo(BigDecimal.ZERO) == 0
					|| turnoverRatio.compareTo(new BigDecimal("0.2500")) < 0;
			return new InventoryTurnoverDTO(
					toLong(row[0]),
					(String) row[1],
					(String) row[2],
					quantitySold,
					currentStock,
					averageDailySold,
					turnoverRatio,
					daysOfInventory,
					lowRotation);
		}).toList();
	}

	public List<PaymentMethodReportDTO> salesByPaymentMethod(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		List<Object[]> rows = saleRepository.salesByPaymentMethodNative(start, end);
		BigDecimal grandTotal = rows.stream()
				.map(row -> toBigDecimal(row[2]))
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		return rows.stream().map(row -> {
			BigDecimal total = toBigDecimal(row[2]).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
			BigDecimal percentage = grandTotal.compareTo(BigDecimal.ZERO) > 0
					? total.multiply(BigDecimal.valueOf(100)).divide(grandTotal, PERCENT_SCALE, RoundingMode.HALF_UP)
					: BigDecimal.ZERO.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);
			return new PaymentMethodReportDTO(
					PaymentMethod.valueOf(row[0].toString()),
					toLong(row[1]) != null ? toLong(row[1]) : 0L,
					total,
					percentage);
		}).toList();
	}

	public PurchasesVsSalesDTO purchasesVsSales(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		BigDecimal totalSales = saleRepository
				.sumTotalAmountBySaleDateBetweenAndStatus(start, end, SaleStatus.PAID)
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal totalPurchases = purchaseOrderRepository.sumReceivedPurchasesBetween(start, end)
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal netDifference = totalSales.subtract(totalPurchases).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal purchasesToSales = totalSales.compareTo(BigDecimal.ZERO) > 0
				? totalPurchases.multiply(BigDecimal.valueOf(100)).divide(totalSales, PERCENT_SCALE, RoundingMode.HALF_UP)
				: BigDecimal.ZERO.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);
		return new PurchasesVsSalesDTO(from, to, totalSales, totalPurchases, netDifference, purchasesToSales);
	}

	public BigDecimal inventoryPurchaseValue() {
		BigDecimal v = productRepository.sumInventoryPurchaseValue();
		return v != null ? v : BigDecimal.ZERO;
	}

	public ReportKpiDTO kpis(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}

		Object[] row = saleRepository.salesKpisNative(start, end);
		if (row != null && row.length == 1 && row[0] instanceof Object[] nested) {
			row = nested;
		}

		BigDecimal totalSales = toBigDecimal(row[0]).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		long salesCount = toLong(row[1]) != null ? toLong(row[1]) : 0L;
		BigDecimal totalCost = toBigDecimal(row[2]).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal grossProfit = totalSales.subtract(totalCost).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal averageTicket = salesCount > 0
				? totalSales.divide(BigDecimal.valueOf(salesCount), MONEY_SCALE, RoundingMode.HALF_UP)
				: BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal grossMargin = totalSales.compareTo(BigDecimal.ZERO) > 0
				? grossProfit.multiply(BigDecimal.valueOf(100)).divide(totalSales, PERCENT_SCALE, RoundingMode.HALF_UP)
				: BigDecimal.ZERO.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);

		return new ReportKpiDTO(
				from,
				to,
				totalSales,
				salesCount,
				averageTicket,
				grossProfit,
				grossMargin,
				inventoryPurchaseValue().setScale(MONEY_SCALE, RoundingMode.HALF_UP),
				productRepository.countCriticalStockProducts());
	}

	public ReportKpiComparisonDTO comparativeKpis(LocalDate from, LocalDate to, LocalDate compareFrom, LocalDate compareTo) {
		ReportKpiDTO current = kpis(from, to);
		ReportKpiDTO previous = kpis(compareFrom, compareTo);

		BigDecimal totalSalesChange = current.totalSales().subtract(previous.totalSales())
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		long salesCountChange = current.salesCount() - previous.salesCount();
		BigDecimal averageTicketChange = current.averageTicket().subtract(previous.averageTicket())
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal grossProfitChange = current.grossProfit().subtract(previous.grossProfit())
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		BigDecimal grossMarginPointChange = current.grossMarginPercentage().subtract(previous.grossMarginPercentage())
				.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);

		return new ReportKpiComparisonDTO(
				current,
				previous,
				totalSalesChange,
				percentageChange(current.totalSales(), previous.totalSales()),
				salesCountChange,
				percentageChange(BigDecimal.valueOf(current.salesCount()), BigDecimal.valueOf(previous.salesCount())),
				averageTicketChange,
				percentageChange(current.averageTicket(), previous.averageTicket()),
				grossProfitChange,
				percentageChange(current.grossProfit(), previous.grossProfit()),
				grossMarginPointChange);
	}

	public long countPaidSalesBetween(LocalDate from, LocalDate to) {
		return saleRepository.countBySaleDateBetweenAndStatus(from.atStartOfDay(), to.plusDays(1).atStartOfDay(),
				SaleStatus.PAID);
	}

	public List<Object[]> lowStockReport() {
		return lowStock().stream()
				.map(row -> new Object[] {row.barcode(), row.productName(), row.currentStock(), row.minimumStock(), row.categoryName()})
				.toList();
	}

	public List<Object[]> salesByUserReport(LocalDate from, LocalDate to) {
		return salesByUser(from, to).stream()
				.map(row -> new Object[] {row.userFullName(), row.salesCount(), row.totalSales()})
				.toList();
	}

	public List<Object[]> customerRankingReport(LocalDate from, LocalDate to) {
		return customerRanking(from, to).stream()
				.map(row -> new Object[] {row.customerFullName(), row.identifier(), row.visits(), row.totalSpent()})
				.toList();
	}

	public List<Object[]> inventoryValuedReport() {
		return productRepository.findAll().stream()
				.map(p -> {
					BigDecimal stock = p.getCurrentStock() != null ? p.getCurrentStock() : BigDecimal.ZERO;
					BigDecimal cost = p.getPurchasePrice() != null ? p.getPurchasePrice() : BigDecimal.ZERO;
					BigDecimal price = p.getSalePrice() != null ? p.getSalePrice() : BigDecimal.ZERO;
					BigDecimal total = stock.multiply(price);
					BigDecimal minStock = p.getMinimumStock() != null ? p.getMinimumStock() : BigDecimal.ZERO;
					String categoryName = p.getCategory() != null ? p.getCategory().getName() : "Sin categoría";
					String brandName = p.getBrand() != null ? p.getBrand().getName() : "Sin marca";
					String supplierName = p.getSupplier() != null && p.getSupplier().getCompanyName() != null ? 
							p.getSupplier().getCompanyName() : "Sin proveedor";

					return new Object[] {
							p.getBarcode() != null ? p.getBarcode() : "N/A",
							p.getName() != null ? p.getName() : "Sin nombre",
							categoryName,
							brandName,
							supplierName,
							minStock,
							stock,
							cost,
							price,
							total
					};
				})
				.toList();
	}

	public List<SalesByUserReportDTO> salesByUser(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		return saleRepository.sumSalesByUserNative(start, end).stream()
				.map(row -> new SalesByUserReportDTO(
						(String) row[0],
						toLong(row[1]) != null ? toLong(row[1]) : 0L,
						toBigDecimal(row[2]).setScale(MONEY_SCALE, RoundingMode.HALF_UP)))
				.toList();
	}

	public List<CustomerRankingReportDTO> customerRanking(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		return saleRepository.customerRankingNative(start, end).stream()
				.map(row -> new CustomerRankingReportDTO(
						(String) row[0],
						row[1] != null ? row[1].toString() : null,
						toLong(row[2]) != null ? toLong(row[2]) : 0L,
						toBigDecimal(row[3]).setScale(MONEY_SCALE, RoundingMode.HALF_UP)))
				.toList();
	}

	public List<Object[]> inventoryMovementsReport(LocalDate from, LocalDate to) {
		return inventoryMovements(from, to).stream()
				.map(row -> new Object[] {
						row.createdAt(),
						row.productName(),
						row.movementType(),
						row.quantity(),
						row.previousStock(),
						row.newStock(),
						row.userFullName(),
						row.unitCost(),
						row.totalCost()
				})
				.toList();
	}

	public List<LowStockReportDTO> lowStock() {
		return productRepository.findLowStockProductsNative().stream()
				.map(row -> new LowStockReportDTO(
						row[0] != null ? row[0].toString() : null,
						row[1] != null ? row[1].toString() : null,
						toBigDecimal(row[2]),
						toBigDecimal(row[3]),
						row[4] != null ? row[4].toString() : null))
				.toList();
	}

	public List<InventoryMovementReportDTO> inventoryMovements(LocalDate from, LocalDate to) {
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		return inventoryMovementRepository.inventoryMovementsReportNative(start, end).stream()
				.map(row -> new InventoryMovementReportDTO(
						toLocalDateTime(row[0]),
						row[1] != null ? row[1].toString() : null,
						row[2] != null ? row[2].toString() : null,
						toBigDecimal(row[3]),
						toBigDecimal(row[4]),
						toBigDecimal(row[5]),
						row[6] != null ? row[6].toString() : null,
						toBigDecimal(row[7]),
						toBigDecimal(row[8])))
				.toList();
	}

	public List<KardexRowDTO> kardex(Long productId, LocalDate from, LocalDate to) {
		if (productId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is required");
		}
		LocalDateTime start = from.atStartOfDay();
		LocalDateTime end = to.plusDays(1).atStartOfDay();
		if (!end.isAfter(start)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
		}
		return inventoryMovementRepository.findKardexByProductAndDateRange(productId, start, end).stream()
				.map(this::toKardexRow)
				.toList();
	}


	private static LocalDate toLocalDate(Object value) {
		if (value instanceof java.sql.Date date) {
			return date.toLocalDate();
		}
		if (value instanceof java.sql.Timestamp timestamp) {
			return timestamp.toLocalDateTime().toLocalDate();
		}
		if (value instanceof LocalDateTime localDateTime) {
			return localDateTime.toLocalDate();
		}
		if (value instanceof LocalDate localDate) {
			return localDate;
		}
		return LocalDate.now();
	}

	private static LocalDateTime toLocalDateTime(Object value) {
		if (value instanceof java.sql.Timestamp timestamp) {
			return timestamp.toLocalDateTime();
		}
		if (value instanceof LocalDateTime localDateTime) {
			return localDateTime;
		}
		if (value instanceof java.sql.Date date) {
			return date.toLocalDate().atStartOfDay();
		}
		if (value instanceof LocalDate localDate) {
			return localDate.atStartOfDay();
		}
		return LocalDateTime.now();
	}

	private static BigDecimal toBigDecimal(Object value) {
		if (value == null) {
			return BigDecimal.ZERO;
		}
		if (value instanceof BigDecimal bigDecimal) {
			return bigDecimal;
		}
		if (value instanceof Number number) {
			return BigDecimal.valueOf(number.doubleValue());
		}
		return new BigDecimal(value.toString());
	}

	private static Long toLong(Object value) {
		if (value == null) {
			return null;
		}
		if (value instanceof Long long1) {
			return long1;
		}
		if (value instanceof Number number) {
			return number.longValue();
		}
		return Long.parseLong(value.toString());
	}

	private KardexRowDTO toKardexRow(InventoryMovement movement) {
		BigDecimal entryQuantity = movement.getFactor() != null && movement.getFactor() > 0
				? movement.getQuantity()
				: BigDecimal.ZERO;
		BigDecimal exitQuantity = movement.getFactor() != null && movement.getFactor() < 0
				? movement.getQuantity()
				: BigDecimal.ZERO;
		Long batchId = movement.getBatch() != null ? movement.getBatch().getId() : null;
		String batchCode = movement.getBatch() != null ? movement.getBatch().getBatchCode() : null;
		return new KardexRowDTO(
				movement.getCreatedAt(),
				movement.getProduct().getId(),
				movement.getProduct().getBarcode(),
				movement.getProduct().getName(),
				batchId,
				batchCode,
				movement.getMovementType(),
				movement.getQuantity(),
				movement.getFactor(),
				entryQuantity,
				exitQuantity,
				movement.getPreviousStock(),
				movement.getNewStock(),
				movement.getUnitCost(),
				movement.getTotalCost(),
				movement.getUser().getId(),
				movement.getUser().getFullName(),
				movement.getReferenceId(),
				movement.getReferenceLineId(),
				movement.getSourceType(),
				movement.getNotes());
	}

	private static BigDecimal percentageChange(BigDecimal current, BigDecimal previous) {
		if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
			return current != null && current.compareTo(BigDecimal.ZERO) != 0
					? BigDecimal.valueOf(100).setScale(PERCENT_SCALE, RoundingMode.HALF_UP)
					: BigDecimal.ZERO.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);
		}
		return current.subtract(previous)
				.multiply(BigDecimal.valueOf(100))
				.divide(previous.abs(), PERCENT_SCALE, RoundingMode.HALF_UP);
	}
}
