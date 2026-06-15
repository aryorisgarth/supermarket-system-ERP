package com.supermarket.sale.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.supermarket.customer.dto.CustomerSummaryDTO;
import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.sale.dto.SaleLineResponseDTO;
import com.supermarket.sale.dto.SalePaymentResponseDTO;
import com.supermarket.sale.dto.SaleResponseDTO;
import com.supermarket.sale.dto.SaleSummaryResponseDTO;
import com.supermarket.sale.entity.Sale;
import com.supermarket.sale.entity.SaleDetail;
import com.supermarket.sale.entity.SalePayment;
import com.supermarket.user.dto.UserSummaryDTO;

@Component
public class SaleMapper {

	public SaleSummaryResponseDTO toSummary(Sale entity) {
		CustomerSummaryDTO customerDto = null;
		if (entity.getCustomer() != null) {
			var c = entity.getCustomer();
			customerDto = new CustomerSummaryDTO(c.getId(), c.getFullName());
		}
		var u = entity.getUser();
		var seller = new UserSummaryDTO(u.getId(), u.getFullName(), u.getEmail());
		return new SaleSummaryResponseDTO(
				entity.getId(),
				entity.getSession() != null ? entity.getSession().getId() : null,
				entity.getInvoiceNumber(),
				entity.getStatus(),
				entity.getTotalAmount(),
				entity.getSaleDate(),
				customerDto,
				seller);
	}

	public SaleResponseDTO toResponse(Sale entity) {
		List<SaleLineResponseDTO> lines = entity.getDetails().stream().map(this::toLineResponse).toList();
		List<SalePaymentResponseDTO> payments = entity.getPayments().stream().map(this::toPaymentResponse).toList();
		CustomerSummaryDTO customerDto = null;
		if (entity.getCustomer() != null) {
			var c = entity.getCustomer();
			customerDto = new CustomerSummaryDTO(c.getId(), c.getFullName());
		}
		var u = entity.getUser();
		var seller = new UserSummaryDTO(u.getId(), u.getFullName(), u.getEmail());
		return new SaleResponseDTO(
				entity.getId(),
				entity.getSession() != null ? entity.getSession().getId() : null,
				entity.getInvoiceNumber(),
				entity.getStatus(),
				entity.getSubtotal(),
				entity.getTotalTax(),
				entity.getTotalAmount(),
				entity.getSaleDate(),
				customerDto,
				seller,
				entity.getChangeAmount(),
				payments,
				lines,
				entity.getPointsEarned() != null ? entity.getPointsEarned() : 0,
				entity.getPointsRedeemed() != null ? entity.getPointsRedeemed() : 0,
				entity.getCustomer() != null ? (entity.getCustomer().getPoints() != null ? entity.getCustomer().getPoints() : 0) : 0);
	}

	private SaleLineResponseDTO toLineResponse(SaleDetail d) {
		var p = d.getProduct();
		var productDto = new ProductSummaryDTO(p.getId(), p.getBarcode(), p.getName());
		Long batchId = null;
		String batchCode = null;
		if (d.getBatch() != null) {
			batchId = d.getBatch().getId();
			batchCode = d.getBatch().getBatchCode();
		}
		Long uomConversionId = d.getUomConversion() != null ? d.getUomConversion().getId() : null;
		String uomLabel = d.getUomConversion() != null ? d.getUomConversion().getLabel() : "UN";
		return new SaleLineResponseDTO(
				d.getId(),
				productDto,
				batchId,
				batchCode,
				d.getQuantity(),
				d.getUnitPrice(),
				d.getTaxApplied(),
				d.getDiscountAmount(),
				d.getSubtotal(),
				uomConversionId,
				uomLabel);
	}

	private SalePaymentResponseDTO toPaymentResponse(SalePayment p) {
		return new SalePaymentResponseDTO(
				p.getId(),
				p.getPaymentMethod(),
				p.getAmount());
	}
}
