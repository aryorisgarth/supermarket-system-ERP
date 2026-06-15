package com.supermarket.billing.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.supermarket.billing.entity.ElectronicInvoice;

public interface ElectronicInvoiceRepository extends JpaRepository<ElectronicInvoice, Long> {

	Optional<ElectronicInvoice> findBySaleId(Long saleId);

	Optional<ElectronicInvoice> findByFiscalUuid(String fiscalUuid);

	Page<ElectronicInvoice> findAllByOrderByCreatedAtDesc(Pageable pageable);

	@Query("""
			SELECT e FROM ElectronicInvoice e
			JOIN e.sale s
			WHERE (:search IS NULL OR LOWER(s.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(e.authorizationNumber) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(e.fiscalUuid) LIKE LOWER(CONCAT('%', :search, '%')))
			""")
	Page<ElectronicInvoice> searchPage(@Param("search") String search, Pageable pageable);
}
