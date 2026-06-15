package com.supermarket.supplier.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.supplier.dto.SupplierRequestDTO;
import com.supermarket.supplier.dto.SupplierResponseDTO;

public interface SupplierService {

	List<SupplierResponseDTO> findAll();

	Page<SupplierResponseDTO> findPage(String search, Pageable pageable);

	SupplierResponseDTO findById(Integer id);

	List<SupplierResponseDTO> searchSuppliers(String search);

	SupplierResponseDTO create(SupplierRequestDTO request);

	SupplierResponseDTO update(Integer id, SupplierRequestDTO request);

	void deleteById(Integer id);
}
