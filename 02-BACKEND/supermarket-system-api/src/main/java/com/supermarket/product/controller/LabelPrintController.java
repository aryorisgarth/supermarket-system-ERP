package com.supermarket.product.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.product.dto.LabelPrintRequestDTO;
import com.supermarket.product.dto.LabelProductDTO;
import com.supermarket.product.service.LabelPrintService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/labels")
@Validated
@RequiredArgsConstructor
@Tag(name = "Etiquetas", description = "Datos para impresión de flejes de góndola y etiquetas de producto")
public class LabelPrintController {

	private final LabelPrintService labelPrintService;

	@GetMapping("/price-changes/today")
	@Operation(summary = "Productos con cambio de precio hoy", description = "Lista productos cuyo precio de venta cambió en el día actual")
	public ResponseEntity<List<LabelProductDTO>> getTodayPriceChanges() {
		return ResponseEntity.ok(labelPrintService.findProductsWithPriceChangesToday());
	}

	@PostMapping("/shelf-data")
	@Operation(summary = "Datos para flejes de góndola", description = "Retorna información de productos y ubicaciones listos para imprimir")
	public ResponseEntity<List<LabelProductDTO>> getShelfLabelData(@Valid @RequestBody LabelPrintRequestDTO request) {
		return ResponseEntity.ok(labelPrintService.buildShelfLabelData(request.productIds()));
	}
}
