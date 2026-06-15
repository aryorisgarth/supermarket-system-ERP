package com.supermarket.sale.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.sale.dto.CreditNoteResponseDTO;
import com.supermarket.sale.service.SaleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/credit-notes")
@RequiredArgsConstructor
@Tag(name = "Notas de Crédito", description = "Devoluciones parciales y totales con reintegro de inventario")
@SecurityRequirement(name = "bearerAuth")
public class CreditNoteController {

	private final SaleService saleService;

	@GetMapping
	@Operation(summary = "Listar notas de crédito", description = "Paginado, ordenado por fecha descendente.")
	public ResponseEntity<Page<CreditNoteResponseDTO>> list(
			@PageableDefault(size = 20) Pageable pageable) {
		return ResponseEntity.ok(saleService.findCreditNotes(pageable));
	}

	@GetMapping("/sale/{saleId}")
	@Operation(summary = "Notas de crédito de una venta")
	public ResponseEntity<List<CreditNoteResponseDTO>> bySale(@PathVariable Long saleId) {
		return ResponseEntity.ok(saleService.findCreditNotesBySale(saleId));
	}
}
