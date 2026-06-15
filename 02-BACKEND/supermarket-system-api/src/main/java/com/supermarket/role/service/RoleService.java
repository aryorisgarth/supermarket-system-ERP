package com.supermarket.role.service;

import java.util.List;

import com.supermarket.role.dto.RoleRequestDTO;
import com.supermarket.role.dto.RoleResponseDTO;

public interface RoleService {

	List<RoleResponseDTO> findAll();

	RoleResponseDTO findById(Byte id);

	RoleResponseDTO create(RoleRequestDTO request);

	RoleResponseDTO update(Byte id, RoleRequestDTO request);

	void deleteById(Byte id);
}
