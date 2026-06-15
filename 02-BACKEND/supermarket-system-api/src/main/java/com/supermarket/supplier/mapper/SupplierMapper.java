package com.supermarket.supplier.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.supplier.dto.SupplierRequestDTO;
import com.supermarket.supplier.dto.SupplierResponseDTO;
import com.supermarket.supplier.entity.Supplier;

@Component
public class SupplierMapper {

	public Supplier toEntity(SupplierRequestDTO dto) {
		Supplier supplier = new Supplier();
		apply(supplier, dto);
		return supplier;
	}

	public SupplierResponseDTO toResponse(Supplier entity) {
		return new SupplierResponseDTO(
			entity.getId(),
			entity.getCompanyName(),
			entity.getContactName(),
			entity.getPhone(),
			entity.getEmail(),
			entity.getAddress(),
			entity.getCreatedAt()
		);
	}

	public void apply(Supplier entity, SupplierRequestDTO dto) {
		entity.setCompanyName(dto.getCompanyName());
		entity.setContactName(dto.getContactName());
		entity.setPhone(dto.getPhone());
		entity.setEmail(dto.getEmail());
		entity.setAddress(dto.getAddress());
	}
}
