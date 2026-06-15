package com.supermarket.customer.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.customer.dto.CustomerRequestDTO;
import com.supermarket.customer.dto.CustomerResponseDTO;
import com.supermarket.customer.entity.Customer;

@Component
public class CustomerMapper {

	public Customer toEntity(CustomerRequestDTO dto) {
		Customer customer = new Customer();
		apply(customer, dto);
		return customer;
	}

	public CustomerResponseDTO toResponse(Customer entity) {
		return toResponse(entity, null);
	}

	public CustomerResponseDTO toResponse(Customer entity, java.time.LocalDateTime lastPurchaseDate) {
		return new CustomerResponseDTO(
			entity.getId(),
			entity.getFullName(),
			entity.getDocumentId(),
			entity.getPhone(),
			entity.getEmail(),
			entity.getAddress(),
			entity.getPoints() != null ? entity.getPoints() : 0,
			entity.getCreatedAt(),
			lastPurchaseDate
		);
	}

	public void apply(Customer entity, CustomerRequestDTO dto) {
		entity.setFullName(dto.getFullName());
		entity.setDocumentId(dto.getDocumentId());
		entity.setPhone(dto.getPhone());
		entity.setEmail(dto.getEmail());
		entity.setAddress(dto.getAddress());
	}
}
