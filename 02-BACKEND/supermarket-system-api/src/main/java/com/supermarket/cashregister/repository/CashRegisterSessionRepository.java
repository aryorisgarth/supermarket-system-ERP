package com.supermarket.cashregister.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.cashregister.entity.CashRegisterSession;
import com.supermarket.cashregister.model.SessionStatus;

@Repository
public interface CashRegisterSessionRepository extends JpaRepository<CashRegisterSession, Long> {

	Optional<CashRegisterSession> findByCashierIdAndStatus(Long cashierId, SessionStatus status);

	boolean existsByCashierIdAndStatus(Long cashierId, SessionStatus status);

	boolean existsByCashRegisterIdAndStatus(Long cashRegisterId, SessionStatus status);

	List<CashRegisterSession> findAllByStatusOrderByOpenedAtDesc(SessionStatus status);

	@Query("""
			SELECT s FROM CashRegisterSession s
			WHERE (:status IS NULL OR s.status = :status)
			  AND (:cashierId IS NULL OR s.cashier.id = :cashierId)
			  AND (:from IS NULL OR s.openedAt >= :from)
			  AND (:to IS NULL OR s.openedAt <= :to)
			ORDER BY s.openedAt DESC
			""")
	List<CashRegisterSession> search(
			@Param("status") SessionStatus status,
			@Param("cashierId") Long cashierId,
			@Param("from") LocalDateTime from,
			@Param("to") LocalDateTime to);

	long countByStatus(SessionStatus status);

	long countByStatusAndClosedAtBetween(SessionStatus status, LocalDateTime from, LocalDateTime to);

	@Query("SELECT COALESCE(SUM(s.difference), 0) FROM CashRegisterSession s WHERE s.closedAt >= :from AND s.closedAt < :to AND s.status = com.supermarket.cashregister.model.SessionStatus.CLOSED")
	java.math.BigDecimal sumDifferenceByClosedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query("SELECT COALESCE(SUM(s.cardDifference), 0) FROM CashRegisterSession s WHERE s.closedAt >= :from AND s.closedAt < :to AND s.status = com.supermarket.cashregister.model.SessionStatus.CLOSED")
	java.math.BigDecimal sumCardDifferenceByClosedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	@Query("SELECT COALESCE(SUM(s.transferDifference), 0) FROM CashRegisterSession s WHERE s.closedAt >= :from AND s.closedAt < :to AND s.status = com.supermarket.cashregister.model.SessionStatus.CLOSED")
	java.math.BigDecimal sumTransferDifferenceByClosedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
