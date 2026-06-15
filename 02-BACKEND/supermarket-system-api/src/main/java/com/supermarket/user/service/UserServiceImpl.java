package com.supermarket.user.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.role.entity.Role;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.user.dto.UserRequestDTO;
import com.supermarket.user.dto.UserResponseDTO;
import com.supermarket.user.entity.User;
import com.supermarket.user.mapper.UserMapper;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.user.util.PasswordGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final UserMapper userMapper;
	private final PasswordEncoder passwordEncoder;
	private final KeycloakAdminService keycloakAdminService;
	private final EmailService emailService;

	@Override
	public List<UserResponseDTO> findAll() {
		return userRepository.findAllByOrderByFullNameAsc().stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	public Page<UserResponseDTO> findPage(String search, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		return userRepository.searchPage(normalized, pageable).map(userMapper::toResponse);
	}

	@Override
	public List<UserResponseDTO> findActive() {
		return userRepository.findByIsActiveTrueOrderByFullNameAsc().stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	public UserResponseDTO findById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return userMapper.toResponse(user);
	}

	@Override
	public List<UserResponseDTO> findByRole(String roleName) {
		return userRepository.findByRole_NameOrderByFullNameAsc(roleName).stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	public List<UserResponseDTO> searchUsers(String search) {
		return userRepository.searchUsers(search).stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	@Transactional
	public UserResponseDTO create(UserRequestDTO request) {
		normalize(request);
		String email = request.getEmail();
		
		if (userRepository.existsByEmail(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
		}

		Role role = roleRepository.findByNameIgnoreCase(request.getRoleName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + request.getRoleName()));

		String tempPassword = PasswordGenerator.generate(12);

		String keycloakId = keycloakAdminService.createUser(email, request.getFullName(), request.getLastName(), tempPassword);
		keycloakAdminService.assignRole(keycloakId, request.getRoleName());

		User user = userMapper.toEntity(request);
		user.setPassword(passwordEncoder.encode("KEYCLOAK_MANAGED_USER"));
		user.setRole(role);
		user.setCreatedAt(LocalDateTime.now());
		
		User saved = userRepository.save(user);

		emailService.sendTemporaryPasswordEmail(email, request.getFullName(), tempPassword);

		return userMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public UserResponseDTO update(Long id, UserRequestDTO request) {
		normalize(request);
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		String email = request.getEmail();
		if (!user.getEmail().equals(email) && userRepository.existsByEmailAndIdNot(email, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
		}

		Role role = roleRepository.findByNameIgnoreCase(request.getRoleName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + request.getRoleName()));

		userMapper.apply(user, request);
		if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
			user.setPassword(passwordEncoder.encode(request.getPassword()));
		}
		user.setRole(role);

		User saved = userRepository.save(user);
		return userMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Long id) {
		if (!userRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		
		try {
			userRepository.deleteById(id);
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"User cannot be deleted due to related data in the database", ex);
		}
	}

	@Override
	@Transactional
	public void toggleStatus(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		
		user.setIsActive(!user.getIsActive());
		userRepository.save(user);
	}

	private static void normalize(UserRequestDTO request) {
		request.setFullName(request.getFullName().trim());
		if (request.getLastName() != null) {
			request.setLastName(request.getLastName().trim());
		}
		request.setEmail(request.getEmail().trim().toLowerCase());
		request.setRoleName(request.getRoleName().trim());
	}
}
