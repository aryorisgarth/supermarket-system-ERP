package com.supermarket.billing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.supermarket.billing.entity.PaymentGatewayTransaction;

public interface PaymentGatewayTransactionRepository extends JpaRepository<PaymentGatewayTransaction, Long> {

	List<PaymentGatewayTransaction> findBySaleIdOrderByCreatedAtDesc(Long saleId);

	List<PaymentGatewayTransaction> findAllByOrderByCreatedAtDesc();

	long countBySettlementStatus(com.supermarket.billing.model.SettlementStatus status);

	@org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0) FROM PaymentGatewayTransaction t WHERE t.settlementStatus = :status")
	java.math.BigDecimal sumAmountBySettlementStatus(@org.springframework.data.repository.query.Param("status") com.supermarket.billing.model.SettlementStatus status);

	@org.springframework.data.jpa.repository.Query("""
			SELECT COUNT(t) FROM PaymentGatewayTransaction t
			WHERE t.settlementStatus = :status
			AND t.createdAt >= :start AND t.createdAt < :end
			""")
	long countBySettlementStatusAndCreatedAtBetween(
			@org.springframework.data.repository.query.Param("status") com.supermarket.billing.model.SettlementStatus status,
			@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
			@org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

	@org.springframework.data.jpa.repository.Query("""
			SELECT COALESCE(SUM(t.amount), 0) FROM PaymentGatewayTransaction t
			WHERE t.settlementStatus = :status
			AND t.createdAt >= :start AND t.createdAt < :end
			""")
	java.math.BigDecimal sumAmountBySettlementStatusAndCreatedAtBetween(
			@org.springframework.data.repository.query.Param("status") com.supermarket.billing.model.SettlementStatus status,
			@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
			@org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
