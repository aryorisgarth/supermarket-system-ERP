package com.supermarket.cashregister.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.supermarket.cashregister.dto.CashRegisterCloseDTO;
import com.supermarket.cashregister.dto.CashRegisterMovementDTO;
import com.supermarket.cashregister.dto.CashRegisterMovementRequestDTO;
import com.supermarket.cashregister.dto.CashRegisterOpenDTO;
import com.supermarket.cashregister.dto.CashRegisterReportDTO;
import com.supermarket.cashregister.dto.CashRegisterSessionDTO;
import com.supermarket.cashregister.dto.CashRegisterSummaryDTO;
import com.supermarket.cashregister.entity.CashRegister;
import com.supermarket.cashregister.entity.CashRegisterSession;
import com.supermarket.cashregister.model.SessionStatus;

public interface CashRegisterService {

	List<CashRegister> getActiveCashRegisters();

	CashRegisterSessionDTO openSession(CashRegisterOpenDTO request);

	CashRegisterSessionDTO closeSession(CashRegisterCloseDTO request);

	Optional<CashRegisterSessionDTO> getCurrentSession();

	CashRegisterSummaryDTO getCurrentSummary();

	List<CashRegisterSummaryDTO> getAllActiveSessions();

	List<CashRegisterSessionDTO> searchSessions(SessionStatus status, Long cashierId, LocalDateTime from, LocalDateTime to);

	CashRegisterSessionDTO getSessionById(Long sessionId);

	CashRegisterSummaryDTO getSessionSummary(Long sessionId);

	CashRegisterReportDTO getReport(LocalDateTime from, LocalDateTime to);

	CashRegisterMovementDTO createMovement(CashRegisterMovementRequestDTO request);

	CashRegisterSession getActiveSessionEntity(Long userId);

	List<com.supermarket.cashregister.dto.PhysicalCashRegisterStatusDTO> getAllPhysicalRegistersWithStatus();

	CashRegister createPhysicalRegister(CashRegister cashRegister);

	CashRegister updatePhysicalRegister(Long id, CashRegister cashRegister);

	void deletePhysicalRegister(Long id);
}
