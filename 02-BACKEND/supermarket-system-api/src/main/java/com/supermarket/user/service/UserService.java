package com.supermarket.user.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.user.dto.UserRequestDTO;
import com.supermarket.user.dto.UserResponseDTO;

public interface UserService {

	List<UserResponseDTO> findAll();

	Page<UserResponseDTO> findPage(String search, Pageable pageable);

	List<UserResponseDTO> findActive();

	UserResponseDTO findById(Long id);

	List<UserResponseDTO> findByRole(String roleName);

	List<UserResponseDTO> searchUsers(String search);

	UserResponseDTO create(UserRequestDTO request);

	UserResponseDTO update(Long id, UserRequestDTO request);

	void deleteById(Long id);

	void toggleStatus(Long id);
}
