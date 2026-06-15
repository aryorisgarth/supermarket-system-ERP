package com.supermarket.sale.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.sale.entity.CreditNote;

@Repository
public interface CreditNoteRepository extends JpaRepository<CreditNote, Long> {

	@Query("SELECT SUM(c.amount) FROM CreditNote c WHERE c.session.id = :sessionId")
	BigDecimal sumRefundsBySessionId(@Param("sessionId") Long sessionId);

	Page<CreditNote> findAllByOrderByCreatedAtDesc(Pageable pageable);

	List<CreditNote> findBySaleIdOrderByCreatedAtDesc(Long saleId);
}
