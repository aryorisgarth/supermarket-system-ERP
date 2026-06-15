package com.supermarket.cashregister.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.audit.service.AuditLogService;
import com.supermarket.cashregister.dto.CashRegisterCloseDTO;
import com.supermarket.cashregister.dto.CashRegisterMovementDTO;
import com.supermarket.cashregister.dto.CashRegisterMovementRequestDTO;
import com.supermarket.cashregister.dto.CashRegisterOpenDTO;
import com.supermarket.cashregister.dto.CashRegisterReportDTO;
import com.supermarket.cashregister.dto.CashRegisterSessionDTO;
import com.supermarket.cashregister.dto.CashRegisterSummaryDTO;
import com.supermarket.cashregister.entity.CashRegister;
import com.supermarket.cashregister.entity.CashRegisterMovement;
import com.supermarket.cashregister.entity.CashRegisterSession;
import com.supermarket.cashregister.mapper.CashRegisterMapper;
import com.supermarket.cashregister.model.CashMovementType;
import com.supermarket.cashregister.model.SessionStatus;
import com.supermarket.cashregister.repository.CashRegisterMovementRepository;
import com.supermarket.cashregister.repository.CashRegisterSessionRepository;
import com.supermarket.cashregister.repository.CashRegisterRepository;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.sale.repository.CreditNoteRepository;
import com.supermarket.sale.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CashRegisterServiceImpl implements CashRegisterService {

	private final CashRegisterSessionRepository sessionRepository;
	private final UserRepository userRepository;
	private final SaleRepository saleRepository;
	private final CreditNoteRepository creditNoteRepository;
	private final CashRegisterMovementRepository movementRepository;
	private final CashRegisterRepository cashRegisterRepository;
	private final CashRegisterMapper mapper;
	private final AuditLogService auditLogService;

	@Override
	public List<CashRegister> getActiveCashRegisters() {
		return cashRegisterRepository.findByStatusIgnoreCase("ACTIVE");
	}

	@Override
	@Transactional
	public CashRegisterSessionDTO openSession(CashRegisterOpenDTO request) {
		Long userId = SecurityUtils.currentUserId();
		User cashier = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

		if (sessionRepository.existsByCashierIdAndStatus(userId, SessionStatus.OPEN)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has an open cash register session");
		}

		CashRegister cashRegister = cashRegisterRepository.findById(request.cashRegisterId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cash register not found"));

		if (!"ACTIVE".equalsIgnoreCase(cashRegister.getStatus())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected cash register is inactive");
		}

		if (sessionRepository.existsByCashRegisterIdAndStatus(request.cashRegisterId(), SessionStatus.OPEN)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "La caja registradora física seleccionada ya está ocupada por otra sesión activa");
		}

		CashRegisterSession session = new CashRegisterSession();
		session.setCashier(cashier);
		session.setCashRegister(cashRegister);
		session.setOpenedAt(LocalDateTime.now());
		session.setOpeningBalance(request.openingBalance());
		session.setStatus(SessionStatus.OPEN);

		CashRegisterSession saved = sessionRepository.save(session);
		auditLogService.record(userId, "CASH_OPEN", "cash_register_sessions", saved.getId(), null,
				Map.of("openingBalance", saved.getOpeningBalance().toPlainString(), "status", saved.getStatus().name()));
		return mapper.toResponse(saved);
	}

	@Override
	@Transactional
	public CashRegisterSessionDTO closeSession(CashRegisterCloseDTO request) {
		Long userId = SecurityUtils.currentUserId();
		CashRegisterSession session = sessionRepository.findByCashierIdAndStatus(userId, SessionStatus.OPEN)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No open cash register session found"));

		CashRegisterSummaryDTO summary = buildSummary(session);
		BigDecimal systemBalance = summary.expectedCash();
		BigDecimal difference = request.actualClosingBalance().subtract(systemBalance);
		BigDecimal countedCard = nz(request.countedCard());
		BigDecimal countedTransfer = nz(request.countedTransfer());

		session.setClosedAt(LocalDateTime.now());
		session.setSystemCalculatedBalance(systemBalance);
		session.setActualClosingBalance(request.actualClosingBalance());
		session.setDifference(difference);
		session.setExpectedCash(summary.expectedCash());
		session.setExpectedCard(summary.expectedCard());
		session.setExpectedTransfer(summary.expectedTransfer());
		session.setCountedCash(request.actualClosingBalance());
		session.setCountedCard(countedCard);
		session.setCountedTransfer(countedTransfer);
		session.setCardDifference(countedCard.subtract(summary.expectedCard()));
		session.setTransferDifference(countedTransfer.subtract(summary.expectedTransfer()));
		session.setNotes(request.notes());
		session.setStatus(SessionStatus.CLOSED);

		CashRegisterSession saved = sessionRepository.save(session);
		auditLogService.record(userId, "CASH_CLOSE", "cash_register_sessions", saved.getId(),
				Map.of("status", SessionStatus.OPEN.name()),
				Map.of(
						"status", saved.getStatus().name(),
						"expectedCash", saved.getExpectedCash().toPlainString(),
						"countedCash", saved.getCountedCash().toPlainString(),
						"difference", saved.getDifference().toPlainString(),
						"notes", saved.getNotes() == null ? "" : saved.getNotes()));
		return mapper.toResponse(saved);
	}

	@Override
	public Optional<CashRegisterSessionDTO> getCurrentSession() {
		Long userId = SecurityUtils.currentUserId();
		return sessionRepository.findByCashierIdAndStatus(userId, SessionStatus.OPEN)
				.map(mapper::toResponse);
	}

	@Override
	public CashRegisterSummaryDTO getCurrentSummary() {
		Long userId = SecurityUtils.currentUserId();
		CashRegisterSession session = sessionRepository.findByCashierIdAndStatus(userId, SessionStatus.OPEN)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No open cash register session found"));
		return buildSummary(session);
	}

	@Override
	public List<CashRegisterSummaryDTO> getAllActiveSessions() {
		assertSupervisorAccess();
		return sessionRepository.findAllByStatusOrderByOpenedAtDesc(SessionStatus.OPEN).stream()
				.map(this::buildSummary)
				.toList();
	}

	@Override
	public List<CashRegisterSessionDTO> searchSessions(SessionStatus status, Long cashierId, LocalDateTime from,
			LocalDateTime to) {
		assertSupervisorAccess();
		return sessionRepository.search(status, cashierId, from, to).stream()
				.map(mapper::toResponse)
				.toList();
	}

	@Override
	public CashRegisterSessionDTO getSessionById(Long sessionId) {
		CashRegisterSession session = findSessionOrThrow(sessionId);
		assertCanViewSession(session);
		return mapper.toResponse(session);
	}

	@Override
	public CashRegisterSummaryDTO getSessionSummary(Long sessionId) {
		CashRegisterSession session = findSessionOrThrow(sessionId);
		assertCanViewSession(session);
		return buildSummary(session);
	}

	@Override
	public CashRegisterReportDTO getReport(LocalDateTime from, LocalDateTime to) {
		assertSupervisorAccess();
		List<CashRegisterSession> sessions = sessionRepository.search(null, null, from, to);

		long openSessionsCount = sessions.stream().filter(s -> s.getStatus() == SessionStatus.OPEN).count();
		long closedSessionsCount = sessions.stream().filter(s -> s.getStatus() == SessionStatus.CLOSED).count();

		BigDecimal totalCashDifference = BigDecimal.ZERO;
		BigDecimal totalCardDifference = BigDecimal.ZERO;
		BigDecimal totalTransferDifference = BigDecimal.ZERO;
		BigDecimal totalCashSales = BigDecimal.ZERO;
		BigDecimal totalCardSales = BigDecimal.ZERO;
		BigDecimal totalTransferSales = BigDecimal.ZERO;
		long sessionsWithDifference = 0;

		for (CashRegisterSession session : sessions) {
			CashRegisterSummaryDTO summary = buildSummary(session);
			totalCashSales = totalCashSales.add(summary.cashSales());
			totalCardSales = totalCardSales.add(summary.cardSales());
			totalTransferSales = totalTransferSales.add(summary.transferSales());

			if (session.getStatus() != SessionStatus.CLOSED) {
				continue;
			}

			BigDecimal cashDiff = nz(session.getDifference());
			BigDecimal cardDiff = nz(session.getCardDifference());
			BigDecimal transferDiff = nz(session.getTransferDifference());

			totalCashDifference = totalCashDifference.add(cashDiff);
			totalCardDifference = totalCardDifference.add(cardDiff);
			totalTransferDifference = totalTransferDifference.add(transferDiff);

			if (cashDiff.compareTo(BigDecimal.ZERO) != 0
					|| cardDiff.compareTo(BigDecimal.ZERO) != 0
					|| transferDiff.compareTo(BigDecimal.ZERO) != 0) {
				sessionsWithDifference++;
			}
		}

		BigDecimal totalSalesVolume = totalCashSales.add(totalCardSales).add(totalTransferSales);

		return new CashRegisterReportDTO(
				openSessionsCount,
				closedSessionsCount,
				sessionsWithDifference,
				totalCashDifference,
				totalCardDifference,
				totalTransferDifference,
				totalCashSales,
				totalCardSales,
				totalTransferSales,
				totalSalesVolume);
	}

	@Override
	@Transactional
	public CashRegisterMovementDTO createMovement(CashRegisterMovementRequestDTO request) {
		Long userId = SecurityUtils.currentUserId();
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
		CashRegisterSession session = sessionRepository.findByCashierIdAndStatus(userId, SessionStatus.OPEN)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No open cash register session found"));

		CashRegisterMovement movement = new CashRegisterMovement();
		movement.setSession(session);
		movement.setUser(user);
		movement.setType(request.type());
		movement.setAmount(request.amount());
		movement.setReason(request.reason());
		movement.setCreatedAt(LocalDateTime.now());
		CashRegisterMovement saved = movementRepository.save(movement);
		auditLogService.record(userId, "CASH_MOVEMENT", "cash_register_movements", saved.getId(), null,
				Map.of(
						"sessionId", session.getId(),
						"type", saved.getType().name(),
						"amount", saved.getAmount().toPlainString(),
						"reason", saved.getReason() == null ? "" : saved.getReason()));
		return toMovementDTO(saved);
	}

	@Override
	public CashRegisterSession getActiveSessionEntity(Long userId) {
		return sessionRepository.findByCashierIdAndStatus(userId, SessionStatus.OPEN)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No open cash register session found"));
	}

	private CashRegisterSummaryDTO buildSummary(CashRegisterSession session) {
		BigDecimal cashSales = nz(saleRepository.sumPaymentsBySessionIdAndMethod(session.getId(), PaymentMethod.CASH));
		BigDecimal cardSales = nz(saleRepository.sumPaymentsBySessionIdAndMethod(session.getId(), PaymentMethod.CARD));
		BigDecimal transferSales = nz(saleRepository.sumPaymentsBySessionIdAndMethod(session.getId(), PaymentMethod.TRANSFER));
		BigDecimal changeAmount = nz(saleRepository.sumChangeAmountBySessionId(session.getId()));
		BigDecimal refunds = nz(creditNoteRepository.sumRefundsBySessionId(session.getId()));
		BigDecimal manualCashIn = nz(movementRepository.sumBySessionIdAndType(session.getId(), CashMovementType.CASH_IN));
		BigDecimal manualCashOut = nz(movementRepository.sumBySessionIdAndType(session.getId(), CashMovementType.CASH_OUT));

		BigDecimal expectedCash = session.getOpeningBalance()
				.add(cashSales)
				.subtract(changeAmount)
				.subtract(refunds)
				.add(manualCashIn)
				.subtract(manualCashOut);

		return new CashRegisterSummaryDTO(
				mapper.toResponse(session),
				cashSales,
				cardSales,
				transferSales,
				changeAmount,
				refunds,
				manualCashIn,
				manualCashOut,
				expectedCash,
				cardSales,
				transferSales,
				movementRepository.findBySessionIdOrderByCreatedAtDesc(session.getId()).stream()
						.map(this::toMovementDTO)
						.toList());
	}

	private CashRegisterMovementDTO toMovementDTO(CashRegisterMovement movement) {
		return new CashRegisterMovementDTO(
				movement.getId(),
				movement.getSession().getId(),
				movement.getUser().getId(),
				movement.getUser().getFullName(),
				movement.getType(),
				movement.getAmount(),
				movement.getReason(),
				movement.getCreatedAt());
	}

	private BigDecimal nz(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	private CashRegisterSession findSessionOrThrow(Long sessionId) {
		return sessionRepository.findById(sessionId)
				.orElseThrow(() -> new ResourceNotFoundException("Cash register session not found with ID: " + sessionId));
	}

	private void assertCanViewSession(CashRegisterSession session) {
		Long userId = SecurityUtils.currentUserId();
		if (session.getCashier().getId().equals(userId)) {
			return;
		}
		assertSupervisorAccess();
	}

	private void assertSupervisorAccess() {
		if (!hasSupervisorAccess()) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions to view cash register data");
		}
	}

	private boolean hasSupervisorAccess() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null) {
			return false;
		}
		return auth.getAuthorities().stream().anyMatch(authority -> {
			String role = authority.getAuthority();
			return "ROLE_ADMINISTRADOR".equals(role)
					|| "ROLE_ADMIN_INGENIERO".equals(role)
					|| "ROLE_SUPERVISOR".equals(role);
		});
	}

	@Override
	public List<com.supermarket.cashregister.dto.PhysicalCashRegisterStatusDTO> getAllPhysicalRegistersWithStatus() {
		List<CashRegister> physicalRegisters = cashRegisterRepository.findAll();
		List<CashRegisterSession> openSessions = sessionRepository.findAllByStatusOrderByOpenedAtDesc(SessionStatus.OPEN);

		return physicalRegisters.stream().map(register -> {
			Optional<CashRegisterSession> activeSession = openSessions.stream()
					.filter(s -> s.getCashRegister() != null && s.getCashRegister().getId().equals(register.getId()))
					.findFirst();

			boolean occupied = activeSession.isPresent();
			Long activeSessionId = occupied ? activeSession.get().getId() : null;
			String activeCashierName = occupied ? activeSession.get().getCashier().getFullName() : null;

			return new com.supermarket.cashregister.dto.PhysicalCashRegisterStatusDTO(
					register.getId(),
					register.getName(),
					register.getStatus(),
					register.getDescription(),
					register.getCreatedAt(),
					occupied,
					activeSessionId,
					activeCashierName
			);
		}).toList();
	}

	@Override
	@Transactional
	public CashRegister createPhysicalRegister(CashRegister cashRegister) {
		assertSupervisorAccess();
		if (cashRegister.getName() == null || cashRegister.getName().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la caja física es obligatorio");
		}
		cashRegister.setCreatedAt(LocalDateTime.now());
		if (cashRegister.getStatus() == null || cashRegister.getStatus().isBlank()) {
			cashRegister.setStatus("ACTIVE");
		}
		return cashRegisterRepository.save(cashRegister);
	}

	@Override
	@Transactional
	public CashRegister updatePhysicalRegister(Long id, CashRegister cashRegister) {
		assertSupervisorAccess();
		CashRegister existing = cashRegisterRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cash register not found"));
		if (cashRegister.getName() == null || cashRegister.getName().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la caja física es obligatorio");
		}
		existing.setName(cashRegister.getName());
		existing.setDescription(cashRegister.getDescription());
		if (cashRegister.getStatus() != null && !cashRegister.getStatus().isBlank()) {
			existing.setStatus(cashRegister.getStatus());
		}
		return cashRegisterRepository.save(existing);
	}

	@Override
	@Transactional
	public void deletePhysicalRegister(Long id) {
		assertSupervisorAccess();
		CashRegister existing = cashRegisterRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cash register not found"));
		existing.setStatus("INACTIVE");
		cashRegisterRepository.save(existing);
	}
}
