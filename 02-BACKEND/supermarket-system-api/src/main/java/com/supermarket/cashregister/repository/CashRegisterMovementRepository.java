package com.supermarket.cashregister.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.supermarket.cashregister.entity.CashRegisterMovement;
import com.supermarket.cashregister.model.CashMovementType;

public interface CashRegisterMovementRepository extends JpaRepository<CashRegisterMovement, Long> {

	List<CashRegisterMovement> findBySessionIdOrderByCreatedAtDesc(Long sessionId);

	@Query("SELECT SUM(m.amount) FROM CashRegisterMovement m WHERE m.session.id = :sessionId AND m.type = :type")
	BigDecimal sumBySessionIdAndType(@Param("sessionId") Long sessionId, @Param("type") CashMovementType type);
}
