package com.supermarket.productbatch.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.productbatch.dto.BatchExpirySummaryDTO;
import com.supermarket.productbatch.dto.ProductBatchRequestDTO;
import com.supermarket.productbatch.dto.ProductBatchResponseDTO;

public interface ProductBatchService {

	List<ProductBatchResponseDTO> findAll();

	Page<ProductBatchResponseDTO> findPage(String search, String expiryState, Pageable pageable);

	List<ProductBatchResponseDTO> findByProductId(Long productId);

	List<ProductBatchResponseDTO> searchByProduct(Long productId, String q);

	List<ProductBatchResponseDTO> findExpiringSoon(Long productId, int withinDays);

	List<ProductBatchResponseDTO> findAllExpiring(int withinDays);

	List<ProductBatchResponseDTO> findAllExpired();

	BatchExpirySummaryDTO getExpirySummary();

	ProductBatchResponseDTO findById(Long id);

	ProductBatchResponseDTO create(ProductBatchRequestDTO request);

	ProductBatchResponseDTO update(Long id, ProductBatchRequestDTO request);

	void deleteById(Long id);
}
