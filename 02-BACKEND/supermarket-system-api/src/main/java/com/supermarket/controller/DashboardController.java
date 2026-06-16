package com.supermarket.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.report.service.ReportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Datos analíticos para gráficos en tiempo real")
public class DashboardController {

    private final ReportService reportService;

    @GetMapping("/sales-weekly")
    @Operation(summary = "Ventas de los últimos 7 días", description = "Datos para el gráfico de líneas de ingresos diarios")
    public ResponseEntity<List<Map<String, Object>>> getWeeklySales() {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(7);
        return ResponseEntity.ok(
            reportService.dailyPaidSales(from, to).stream()
                .map(row -> Map.<String, Object>of("date", row.day().toString(), "amount", row.total()))
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/top-products")
    @Operation(summary = "Top 5 productos más vendidos", description = "Datos para el gráfico de barras de productos estrella")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts() {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusMonths(1);
        return ResponseEntity.ok(
            reportService.topProducts(from, to, 5).stream()
                .map(row -> Map.<String, Object>of("name", row.productName(), "quantity", row.quantitySold()))
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/inventory-status")
    @Operation(summary = "Resumen de stock crítico", description = "Datos para indicadores de alerta de inventario")
    public ResponseEntity<Map<String, Object>> getInventoryStatus() {
        return ResponseEntity.ok(Map.of(
            "lowStockCount", reportService.lowStockReport().size(),
            "totalInventoryValue", reportService.inventoryPurchaseValue(),
            "expiringBatchesCount", reportService.countExpiringBatches(30)
        ));
    }
}
