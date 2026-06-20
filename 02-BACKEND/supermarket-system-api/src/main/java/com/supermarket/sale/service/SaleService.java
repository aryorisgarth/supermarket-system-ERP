package com.supermarket.sale.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.sale.dto.CreditNoteResponseDTO;
import com.supermarket.sale.dto.RefundRequestDTO;
import com.supermarket.sale.dto.RefundableSaleDTO;
import com.supermarket.sale.dto.SaleRequestDTO;
import com.supermarket.sale.dto.SaleResponseDTO;
import com.supermarket.sale.dto.SaleSummaryResponseDTO;

public interface SaleService {

	Page<SaleSummaryResponseDTO> findAll(String search, Long userId, com.supermarket.sale.model.SaleStatus status, java.time.LocalDateTime fromDate, java.time.LocalDateTime toDate, Pageable pageable);

	SaleResponseDTO findById(Long id);

	SaleResponseDTO findByInvoiceNumber(String invoiceNumber);

	SaleResponseDTO create(SaleRequestDTO request);

	void cancel(Long id);

	RefundableSaleDTO getRefundable(Long saleId);

	CreditNoteResponseDTO refund(Long saleId, RefundRequestDTO request);

	Page<CreditNoteResponseDTO> findCreditNotes(Pageable pageable);

	List<CreditNoteResponseDTO> findCreditNotesBySale(Long saleId);
}
