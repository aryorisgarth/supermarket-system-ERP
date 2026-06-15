package com.supermarket.tax.service;

import java.util.List;

import com.supermarket.tax.dto.TaxCategoryRequestDTO;
import com.supermarket.tax.dto.TaxCategoryResponseDTO;

public interface TaxCategoryService {

	List<TaxCategoryResponseDTO> findAll();

	List<TaxCategoryResponseDTO> findActive();

	TaxCategoryResponseDTO findById(Integer id);

	TaxCategoryResponseDTO create(TaxCategoryRequestDTO request);

	TaxCategoryResponseDTO update(Integer id, TaxCategoryRequestDTO request);

	void delete(Integer id);
}
