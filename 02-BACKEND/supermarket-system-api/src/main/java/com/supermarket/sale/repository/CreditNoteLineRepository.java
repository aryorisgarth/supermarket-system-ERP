package com.supermarket.sale.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.sale.entity.CreditNoteLine;

@Repository
public interface CreditNoteLineRepository extends JpaRepository<CreditNoteLine, Long> {

	@Query("SELECT COALESCE(SUM(l.quantity), 0) FROM CreditNoteLine l WHERE l.saleDetail.id = :saleDetailId")
	BigDecimal sumReturnedQuantityBySaleDetailId(@Param("saleDetailId") Long saleDetailId);

	@Query("SELECT l.saleDetail.id AS saleDetailId, COALESCE(SUM(l.quantity), 0) AS returned "
			+ "FROM CreditNoteLine l WHERE l.saleDetail.sale.id = :saleId GROUP BY l.saleDetail.id")
	List<ReturnedBySaleDetail> sumReturnedQuantityBySaleId(@Param("saleId") Long saleId);

	interface ReturnedBySaleDetail {
		Long getSaleDetailId();
		BigDecimal getReturned();
	}
}
