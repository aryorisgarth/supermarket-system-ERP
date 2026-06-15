package com.supermarket.cashregister.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.cashregister.entity.CashRegister;
import com.supermarket.cashregister.dto.CashRegisterCloseDTO;
import com.supermarket.cashregister.dto.CashRegisterMovementDTO;
import com.supermarket.cashregister.dto.CashRegisterMovementRequestDTO;
import com.supermarket.cashregister.dto.CashRegisterOpenDTO;
import com.supermarket.cashregister.dto.CashRegisterReportDTO;
import com.supermarket.cashregister.dto.CashRegisterSessionDTO;
import com.supermarket.cashregister.dto.CashRegisterSummaryDTO;
import com.supermarket.cashregister.model.SessionStatus;
import com.supermarket.cashregister.service.CashRegisterService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cash-registers")
@Validated
@RequiredArgsConstructor
@Tag(name = "Caja Registradora", description = "Gestión de turnos de cajero: apertura, cierre y cuadre de efectivo")
@SecurityRequirement(name = "bearerAuth")
public class CashRegisterController {

	private final CashRegisterService cashRegisterService;

	@GetMapping("/physical/active")
	@Operation(summary = "Cajas físicas activas", description = "Lista todas las terminales físicas activas para asociar al abrir caja.")
	public ResponseEntity<List<CashRegister>> getActiveCashRegisters() {
		return ResponseEntity.ok(cashRegisterService.getActiveCashRegisters());
	}

	@PostMapping("/open")
	@Operation(summary = "Abrir caja", description = "Inicia un turno de cajero declarando el saldo inicial de efectivo.")
	public ResponseEntity<CashRegisterSessionDTO> openSession(@Valid @RequestBody CashRegisterOpenDTO request) {
		return ResponseEntity.ok(cashRegisterService.openSession(request));
	}

	@PostMapping("/close")
	@Operation(summary = "Cerrar caja", description = "Cierra el turno, calcula el saldo del sistema y registra el descuadre.")
	public ResponseEntity<CashRegisterSessionDTO> closeSession(@Valid @RequestBody CashRegisterCloseDTO request) {
		return ResponseEntity.ok(cashRegisterService.closeSession(request));
	}

	@GetMapping("/current")
	@Operation(summary = "Ver sesión activa", description = "Retorna la sesión de caja actualmente abierta del cajero autenticado.")
	public ResponseEntity<CashRegisterSessionDTO> getCurrentSession() {
		return cashRegisterService.getCurrentSession()
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.noContent().build());
	}

	@GetMapping("/current/summary")
	@Operation(summary = "Resumen de caja activa", description = "Calcula ventas, movimientos manuales y saldos esperados del turno activo.")
	public ResponseEntity<CashRegisterSummaryDTO> getCurrentSummary() {
		return ResponseEntity.ok(cashRegisterService.getCurrentSummary());
	}

	@GetMapping("/sessions/active")
	@Operation(summary = "Turnos abiertos", description = "Lista todas las cajas abiertas con resumen en tiempo real.")
	public ResponseEntity<List<CashRegisterSummaryDTO>> getActiveSessions() {
		return ResponseEntity.ok(cashRegisterService.getAllActiveSessions());
	}

	@GetMapping("/sessions")
	@Operation(summary = "Historial de turnos", description = "Busca turnos por estado, cajero y rango de fechas.")
	public ResponseEntity<List<CashRegisterSessionDTO>> searchSessions(
			@RequestParam(required = false) SessionStatus status,
			@RequestParam(required = false) Long cashierId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		LocalDateTime fromDate = from != null ? from.atStartOfDay() : null;
		LocalDateTime toDate = to != null ? to.atTime(LocalTime.MAX) : null;
		return ResponseEntity.ok(cashRegisterService.searchSessions(status, cashierId, fromDate, toDate));
	}

	@GetMapping("/sessions/{id}")
	@Operation(summary = "Detalle de turno", description = "Obtiene los datos de un turno específico.")
	public ResponseEntity<CashRegisterSessionDTO> getSession(@PathVariable Long id) {
		return ResponseEntity.ok(cashRegisterService.getSessionById(id));
	}

	@GetMapping("/sessions/{id}/summary")
	@Operation(summary = "Resumen de turno", description = "Calcula ventas, movimientos y saldos de un turno específico.")
	public ResponseEntity<CashRegisterSummaryDTO> getSessionSummary(@PathVariable Long id) {
		return ResponseEntity.ok(cashRegisterService.getSessionSummary(id));
	}

	@GetMapping("/report")
	@Operation(summary = "Reporte consolidado", description = "Indicadores agregados de turnos en un rango de fechas.")
	public ResponseEntity<CashRegisterReportDTO> getReport(
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		LocalDateTime fromDate = from != null ? from.atStartOfDay() : null;
		LocalDateTime toDate = to != null ? to.atTime(LocalTime.MAX) : null;
		return ResponseEntity.ok(cashRegisterService.getReport(fromDate, toDate));
	}

	@PostMapping("/movements")
	@Operation(summary = "Registrar ingreso/retiro", description = "Registra movimientos manuales de efectivo durante el turno activo.")
	public ResponseEntity<CashRegisterMovementDTO> createMovement(@Valid @RequestBody CashRegisterMovementRequestDTO request) {
		return ResponseEntity.ok(cashRegisterService.createMovement(request));
	}

	@GetMapping("/physical")
	@Operation(summary = "Listar cajas físicas con estado de ocupación")
	public ResponseEntity<List<com.supermarket.cashregister.dto.PhysicalCashRegisterStatusDTO>> getAllPhysicalRegisters() {
		return ResponseEntity.ok(cashRegisterService.getAllPhysicalRegistersWithStatus());
	}

	@PostMapping("/physical")
	@Operation(summary = "Crear caja física")
	public ResponseEntity<CashRegister> createPhysicalRegister(@Valid @RequestBody CashRegister cashRegister) {
		return ResponseEntity.ok(cashRegisterService.createPhysicalRegister(cashRegister));
	}

	@PutMapping("/physical/{id}")
	@Operation(summary = "Actualizar caja física")
	public ResponseEntity<CashRegister> updatePhysicalRegister(@PathVariable Long id, @Valid @RequestBody CashRegister cashRegister) {
		return ResponseEntity.ok(cashRegisterService.updatePhysicalRegister(id, cashRegister));
	}

	@DeleteMapping("/physical/{id}")
	@Operation(summary = "Inactivar caja física")
	public ResponseEntity<Void> deletePhysicalRegister(@PathVariable Long id) {
		cashRegisterService.deletePhysicalRegister(id);
		return ResponseEntity.noContent().build();
	}
}
