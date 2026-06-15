package com.supermarket.promotion.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.promotion.dto.AppliedPromotionDTO;
import com.supermarket.promotion.dto.PromotionRequestDTO;
import com.supermarket.promotion.dto.PromotionResponseDTO;

public interface PromotionService {

	Page<PromotionResponseDTO> findAll(String search, Boolean activeOnly, Boolean inactiveOnly, Pageable pageable);

	PromotionResponseDTO findById(Long id);

	PromotionResponseDTO create(PromotionRequestDTO request);

	PromotionResponseDTO update(Long id, PromotionRequestDTO request);

	void toggleActive(Long id);

	void delete(Long id);

	
	Optional<AppliedPromotionDTO> bestPromotion(Long productId, BigDecimal quantity, Long uomConversionId);

	
	List<PromotionResponseDTO> findActive();
}
