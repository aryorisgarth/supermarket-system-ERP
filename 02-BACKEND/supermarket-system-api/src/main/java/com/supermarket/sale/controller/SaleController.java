package com.supermarket.sale.controller;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.supermarket.sale.dto.CreditNoteResponseDTO;
import com.supermarket.sale.dto.RefundRequestDTO;
import com.supermarket.sale.dto.RefundableSaleDTO;
import com.supermarket.sale.dto.SaleRequestDTO;
import com.supermarket.sale.dto.SaleResponseDTO;
import com.supermarket.sale.dto.SaleSummaryResponseDTO;
import com.supermarket.sale.service.SaleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sales")
@Validated
@RequiredArgsConstructor
@Tag(name = "Ventas", description = "Registro de facturas con pagos múltiples y cálculo automático de vuelto")
@SecurityRequirement(name = "bearerAuth")
public class SaleController {

	private final SaleService saleService;

	@GetMapping
	@Operation(summary = "Listar ventas", description = "Retorna ventas paginadas ordenadas por fecha descendente. Usa ?page=0&size=20")
	public ResponseEntity<Page<SaleSummaryResponseDTO>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Long userId,
			@RequestParam(required = false) com.supermarket.sale.model.SaleStatus status,
			@RequestParam(required = false) java.time.LocalDateTime fromDate,
			@RequestParam(required = false) java.time.LocalDateTime toDate,
			@PageableDefault(size = 20, sort = "saleDate") Pageable pageable) {
		return ResponseEntity.ok(saleService.findAll(q, userId, status, fromDate, toDate, pageable));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Obtener venta por ID")
	public ResponseEntity<SaleResponseDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(saleService.findById(id));
	}

	@GetMapping("/invoice/{invoiceNumber}")
	@Operation(summary = "Buscar venta por número de factura")
	public ResponseEntity<SaleResponseDTO> byInvoice(@PathVariable String invoiceNumber) {
		return ResponseEntity.ok(saleService.findByInvoiceNumber(invoiceNumber));
	}

	@PostMapping
	@Operation(summary = "Registrar nueva venta", description = "Crea una factura. Requiere caja abierta. Soporta pagos mixtos (efectivo + tarjeta).")
	public ResponseEntity<SaleResponseDTO> create(@Valid @RequestBody SaleRequestDTO request) {
		SaleResponseDTO created = saleService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}/cancel")
	@Operation(summary = "Anular venta completa (devolución total)", description = "Genera una Nota de Crédito por el total y requiere caja abierta en el turno actual.")
	public ResponseEntity<Void> cancel(@PathVariable Long id) {
		saleService.cancel(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}/refundable")
	@Operation(summary = "Líneas devolubles de una venta", description = "Devuelve cada línea con la cantidad ya devuelta y la cantidad aún devolvible (para devoluciones parciales).")
	public ResponseEntity<RefundableSaleDTO> refundable(@PathVariable Long id) {
		return ResponseEntity.ok(saleService.getRefundable(id));
	}

	@PostMapping("/{id}/refund")
	@Operation(summary = "Registrar devolución (parcial o total)", description = "Genera una Nota de Crédito por las líneas/cantidades indicadas y reintegra el stock. Si no se envían líneas, devuelve todo lo pendiente.")
	public ResponseEntity<CreditNoteResponseDTO> refund(@PathVariable Long id,
			@Valid @RequestBody RefundRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(saleService.refund(id, request));
	}
}
