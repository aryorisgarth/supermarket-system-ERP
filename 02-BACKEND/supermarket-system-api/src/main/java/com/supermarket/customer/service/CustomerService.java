package com.supermarket.customer.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

import com.supermarket.customer.dto.CustomerRequestDTO;
import com.supermarket.customer.dto.CustomerResponseDTO;
import com.supermarket.customer.dto.CustomerDetailResponseDTO;

public interface CustomerService {

	Page<CustomerResponseDTO> findAll(String search, Pageable pageable);

	CustomerDetailResponseDTO findById(Long id);

	List<CustomerResponseDTO> searchCustomers(String search);

	CustomerResponseDTO create(CustomerRequestDTO request);

	CustomerResponseDTO update(Long id, CustomerRequestDTO request);

	CustomerResponseDTO updatePoints(Long id, Integer points);

	void deleteById(Long id);
}
