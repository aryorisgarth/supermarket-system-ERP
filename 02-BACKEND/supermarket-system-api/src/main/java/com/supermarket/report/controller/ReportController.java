package com.supermarket.report.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.report.service.ReportService;
import com.supermarket.report.dto.CustomerRankingReportDTO;
import com.supermarket.report.dto.InventoryMovementReportDTO;
import com.supermarket.report.dto.InventoryTurnoverDTO;
import com.supermarket.report.dto.KardexRowDTO;
import com.supermarket.report.dto.LowStockReportDTO;
import com.supermarket.report.dto.PaymentMethodReportDTO;
import com.supermarket.report.dto.ProductPerformanceDTO;
import com.supermarket.report.dto.PurchasesVsSalesDTO;
import com.supermarket.report.dto.ReportKpiComparisonDTO;
import com.supermarket.report.dto.ReportKpiDTO;
import com.supermarket.report.dto.SalesByUserReportDTO;
import com.supermarket.report.dto.SalesByBrandDTO;
import com.supermarket.report.dto.PurchasesByBrandDTO;
import com.supermarket.report.dto.InventoryFlowDTO;
import com.supermarket.util.ExcelExportUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Generación de informes estratégicos y exportación a Excel")
public class ReportController {

	private final ReportService reportService;

	@GetMapping("/kpis")
	@Operation(summary = "KPIs generales de ventas e inventario")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public ReportKpiDTO kpis(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.kpis(from, to);
	}

	@GetMapping("/kpis/comparative")
	@Operation(summary = "KPIs comparativos entre dos periodos")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public ReportKpiComparisonDTO comparativeKpis(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
		return reportService.comparativeKpis(from, to, compareFrom, compareTo);
	}

	@GetMapping("/inventory/kardex")
	@Operation(summary = "Kardex de inventario filtrado por producto")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<KardexRowDTO> kardex(
			@RequestParam Long productId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.kardex(productId, from, to);
	}

	@GetMapping("/products/performance")
	@Operation(summary = "Performance de productos por ventas, utilidad y margen")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<ProductPerformanceDTO> productPerformance(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.productPerformance(from, to);
	}

	@GetMapping("/inventory/turnover")
	@Operation(summary = "Rotacion de inventario por producto")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<InventoryTurnoverDTO> inventoryTurnover(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.inventoryTurnover(from, to);
	}

	@GetMapping("/sales/payment-methods")
	@Operation(summary = "Ventas por metodo de pago")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<PaymentMethodReportDTO> salesByPaymentMethod(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.salesByPaymentMethod(from, to);
	}

	@GetMapping("/purchases-vs-sales")
	@Operation(summary = "Compras recibidas vs ventas pagadas")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public PurchasesVsSalesDTO purchasesVsSales(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.purchasesVsSales(from, to);
	}

	@GetMapping("/sales/by-user")
	@Operation(summary = "Ventas por cajero")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<SalesByUserReportDTO> salesByUser(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.salesByUser(from, to);
	}

	@GetMapping("/customers/ranking")
	@Operation(summary = "Ranking de clientes por compras")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<CustomerRankingReportDTO> customerRanking(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.customerRanking(from, to);
	}

	@GetMapping("/stock-alerts")
	@Operation(summary = "Reporte de stock critico")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<LowStockReportDTO> stockAlerts() {
		return reportService.lowStock();
	}

	@GetMapping("/inventory-movements")
	@Operation(summary = "Reporte de movimientos de inventario")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<InventoryMovementReportDTO> inventoryMovements(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.inventoryMovements(from, to);
	}

	@GetMapping("/sales/by-brand")
	@Operation(summary = "Ventas por marca")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<SalesByBrandDTO> salesByBrand(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.salesByBrand(from, to);
	}

	@GetMapping("/purchases/by-brand")
	@Operation(summary = "Compras por marca")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<PurchasesByBrandDTO> purchasesByBrand(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.purchasesByBrand(from, to);
	}

	@GetMapping("/inventory-flow-volume")
	@Operation(summary = "Flujo de inventario por volumen")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public List<InventoryFlowDTO> inventoryFlowVolume(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return reportService.inventoryFlowVolume(from, to);
	}

	@GetMapping("/stock-alerts/excel")
	@Operation(summary = "Reporte de stock crítico (Excel)")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public ResponseEntity<byte[]> exportStockAlerts() throws Exception {
		List<Object[]> data = reportService.lowStockReport();
		String[] headers = {"Código", "Producto", "Stock Actual", "Stock Mínimo", "Categoría"};
		List<Map<String, Object>> rows = new ArrayList<>();
		for (Object[] row : data) {
			Map<String, Object> map = new HashMap<>();
			map.put(headers[0], row[0]);
			map.put(headers[1], row[1]);
			map.put(headers[2], row[2]);
			map.put(headers[3], row[3]);
			map.put(headers[4], row[4]);
			rows.add(map);
		}
		byte[] excelData = ExcelExportUtil.exportToExcel("Stock Critico", headers, rows);
		return createExcelResponse(excelData, "reporte_stock_critico.xlsx");
	}

	@GetMapping("/sales-by-user/excel")
	@Operation(summary = "Ventas por cajero (Excel)")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public ResponseEntity<byte[]> exportSalesByUser(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) throws Exception {
		List<Object[]> data = reportService.salesByUserReport(from, to);
		String[] headers = {"Cajero", "Cant. Ventas", "Total Recaudado"};
		List<Map<String, Object>> rows = new ArrayList<>();
		for (Object[] row : data) {
			Map<String, Object> map = new HashMap<>();
			map.put(headers[0], row[0]);
			map.put(headers[1], row[1]);
			map.put(headers[2], row[2]);
			rows.add(map);
		}
		byte[] excelData = ExcelExportUtil.exportToExcel("Ventas por Cajero", headers, rows);
		return createExcelResponse(excelData, "ventas_por_cajero.xlsx");
	}

	@GetMapping("/sales-by-brand/excel")
	@Operation(summary = "Ventas por marca (Excel)")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public ResponseEntity<byte[]> exportSalesByBrand(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) throws Exception {
		List<Object[]> data = reportService.salesByBrandReport(from, to);
		String[] headers = {"Marca", "Cant. Ventas", "Total Recaudado"};
		List<Map<String, Object>> rows = new ArrayList<>();
		for (Object[] row : data) {
			Map<String, Object> map = new HashMap<>();
			map.put(headers[0], row[0]);
			map.put(headers[1], row[1]);
			map.put(headers[2], row[2]);
			rows.add(map);
		}
		byte[] excelData = ExcelExportUtil.exportToExcel("Ventas por Marca", headers, rows);
		return createExcelResponse(excelData, "ventas_por_marca.xlsx");
	}

	@GetMapping("/purchases-by-brand/excel")
	@Operation(summary = "Compras por marca (Excel)")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public ResponseEntity<byte[]> exportPurchasesByBrand(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) throws Exception {
		List<Object[]> data = reportService.purchasesByBrandReport(from, to);
		String[] headers = {"Marca", "Cant. Compras", "Total Comprado"};
		List<Map<String, Object>> rows = new ArrayList<>();
		for (Object[] row : data) {
			Map<String, Object> map = new HashMap<>();
			map.put(headers[0], row[0]);
			map.put(headers[1], row[1]);
			map.put(headers[2], row[2]);
			rows.add(map);
		}
		byte[] excelData = ExcelExportUtil.exportToExcel("Compras por Marca", headers, rows);
		return createExcelResponse(excelData, "compras_por_marca.xlsx");
	}

    @GetMapping("/inventory-kardex/excel")
    @Operation(summary = "Reporte Kardex de movimientos (Excel)")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<byte[]> exportKardex(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) throws Exception {
        List<Object[]> data = reportService.inventoryMovementsReport(from, to);
        String[] headers = {"Fecha", "Producto", "Tipo", "Cantidad", "Stock Previo", "Stock Nuevo", "Usuario"};
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> map = new HashMap<>();
            map.put(headers[0], row[0]);
            map.put(headers[1], row[1]);
            map.put(headers[2], row[2]);
            map.put(headers[3], row[3]);
            map.put(headers[4], row[4]);
            map.put(headers[5], row[5]);
            map.put(headers[6], row[6]);
            rows.add(map);
        }
        byte[] excelData = ExcelExportUtil.exportToExcel("Kardex Inventario", headers, rows);
        return createExcelResponse(excelData, "reporte_kardex.xlsx");
    }

	@GetMapping("/inventory-valued/excel")
	@Operation(summary = "Reporte de valoración de inventario (Excel)")
	@PreAuthorize("hasAuthority('REPORT_VIEW')")
	public ResponseEntity<byte[]> exportInventoryValued() throws Exception {
		List<Object[]> data = reportService.inventoryValuedReport();
		String[] headers = {"Código", "Producto", "Categoría", "Marca", "Proveedor", "Stock Mínimo", "Stock Actual", "Costo Unitario", "Precio Venta", "Valor Total"};
		List<Map<String, Object>> rows = new ArrayList<>();
		for (Object[] row : data) {
			Map<String, Object> map = new HashMap<>();
			map.put(headers[0], row[0]);
			map.put(headers[1], row[1]);
			map.put(headers[2], row[2]);
			map.put(headers[3], row[3]);
			map.put(headers[4], row[4]);
			map.put(headers[5], row[5]);
			map.put(headers[6], row[6]);
			map.put(headers[7], row[7]);
			map.put(headers[8], row[8]);
			map.put(headers[9], row[9]);
			rows.add(map);
		}
		byte[] excelData = ExcelExportUtil.exportToExcel("Valoracion Inventario", headers, rows);
		return createExcelResponse(excelData, "reporte_valoracion_inventario.xlsx");
	}

	private ResponseEntity<byte[]> createExcelResponse(byte[] data, String filename) {
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(data);
	}
}
