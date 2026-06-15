package com.supermarket.billing.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.billing.dto.BillingConfigResponseDTO;
import com.supermarket.billing.dto.ElectronicInvoiceResponseDTO;
import com.supermarket.billing.dto.PaymentAccountRequestDTO;
import com.supermarket.billing.dto.PaymentAccountResponseDTO;
import com.supermarket.billing.dto.PaymentGatewayTransactionResponseDTO;
import com.supermarket.billing.service.BillingConfigService;
import com.supermarket.billing.service.ElectronicInvoiceService;
import com.supermarket.billing.service.PaymentAccountService;
import com.supermarket.billing.service.PaymentGatewayService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Facturación y pagos", description = "Facturación electrónica y pasarela de pagos")
public class BillingController {

	private final BillingConfigService billingConfigService;
	private final ElectronicInvoiceService electronicInvoiceService;
	private final PaymentGatewayService paymentGatewayService;
	private final PaymentAccountService paymentAccountService;

	@GetMapping("/config")
	@Operation(summary = "Configuración fiscal y de pagos del país activo")
	public ResponseEntity<BillingConfigResponseDTO> getConfig() {
		return ResponseEntity.ok(billingConfigService.getConfig());
	}

	@GetMapping("/electronic-invoices/sale/{saleId}")
	@Operation(summary = "Consultar factura electrónica de una venta")
	public ResponseEntity<ElectronicInvoiceResponseDTO> getElectronicInvoice(@PathVariable Long saleId) {
		return ResponseEntity.ok(electronicInvoiceService.findBySaleId(saleId));
	}

	@PostMapping("/electronic-invoices/sale/{saleId}/issue")
	@Operation(summary = "Emitir (o recuperar) factura electrónica de una venta")
	public ResponseEntity<ElectronicInvoiceResponseDTO> issueElectronicInvoice(@PathVariable Long saleId) {
		return ResponseEntity.ok(electronicInvoiceService.issueBySaleId(saleId));
	}

	@GetMapping("/electronic-invoices")
	@Operation(summary = "Historial de facturas electrónicas emitidas")
	public ResponseEntity<Page<ElectronicInvoiceResponseDTO>> listElectronicInvoices(
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20) Pageable pageable) {
		return ResponseEntity.ok(electronicInvoiceService.findAll(q, pageable));
	}

	@GetMapping("/electronic-invoices/verify")
	@Operation(summary = "Verificar factura electrónica por CUF (público)")
	public ResponseEntity<ElectronicInvoiceResponseDTO> verifyElectronicInvoice(@RequestParam String cuf) {
		return ResponseEntity.ok(electronicInvoiceService.findByFiscalUuid(cuf));
	}

	@GetMapping("/payment-transactions/sale/{saleId}")
	@Operation(summary = "Transacciones de pasarela asociadas a una venta")
	public ResponseEntity<List<PaymentGatewayTransactionResponseDTO>> getPaymentTransactions(@PathVariable Long saleId) {
		return ResponseEntity.ok(paymentGatewayService.findBySaleId(saleId));
	}

	@GetMapping("/payment-transactions")
	@Operation(summary = "Listar transacciones de tarjeta y liquidaciones")
	public ResponseEntity<List<PaymentGatewayTransactionResponseDTO>> listPaymentTransactions() {
		return ResponseEntity.ok(paymentGatewayService.findAll());
	}

	@PutMapping("/payment-transactions/{id}/settle")
	@Operation(summary = "Marcar una transacción como liquidada (depositada)")
	public ResponseEntity<PaymentGatewayTransactionResponseDTO> settleTransaction(@PathVariable Long id) {
		return ResponseEntity.ok(paymentGatewayService.settle(id));
	}

	@GetMapping("/payment-accounts")
	@Operation(summary = "Listar cuentas de cobro")
	public ResponseEntity<List<PaymentAccountResponseDTO>> listPaymentAccounts() {
		return ResponseEntity.ok(paymentAccountService.findAll());
	}

	@GetMapping("/payment-accounts/{id}")
	@Operation(summary = "Obtener cuenta de cobro")
	public ResponseEntity<PaymentAccountResponseDTO> getPaymentAccount(@PathVariable Long id) {
		return ResponseEntity.ok(paymentAccountService.findById(id));
	}

	@PostMapping("/payment-accounts")
	@Operation(summary = "Crear cuenta de cobro")
	public ResponseEntity<PaymentAccountResponseDTO> createPaymentAccount(
			@Valid @RequestBody PaymentAccountRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(paymentAccountService.create(request));
	}

	@PutMapping("/payment-accounts/{id}")
	@Operation(summary = "Actualizar cuenta de cobro")
	public ResponseEntity<PaymentAccountResponseDTO> updatePaymentAccount(@PathVariable Long id,
			@Valid @RequestBody PaymentAccountRequestDTO request) {
		return ResponseEntity.ok(paymentAccountService.update(id, request));
	}

	@DeleteMapping("/payment-accounts/{id}")
	@Operation(summary = "Eliminar cuenta de cobro")
	public ResponseEntity<Void> deletePaymentAccount(@PathVariable Long id) {
		paymentAccountService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
