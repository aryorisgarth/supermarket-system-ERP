package com.supermarket.brand.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.supermarket.brand.dto.BrandRequestDTO;
import com.supermarket.brand.dto.BrandResponseDTO;

public interface BrandService {
	List<BrandResponseDTO> findAll();
	Page<BrandResponseDTO> findPage(String search, Pageable pageable);
	BrandResponseDTO findById(Long id);
	BrandResponseDTO create(BrandRequestDTO request);
	BrandResponseDTO update(Long id, BrandRequestDTO request);
	void deleteById(Long id);
}
