package com.supermarket.brand.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.supermarket.brand.dto.BrandRequestDTO;
import com.supermarket.brand.dto.BrandResponseDTO;
import com.supermarket.brand.entity.Brand;
import com.supermarket.brand.repository.BrandRepository;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.exception.ConflictException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandServiceImpl implements BrandService {

	private final BrandRepository brandRepository;
	private final ProductRepository productRepository;

	@Override
	public List<BrandResponseDTO> findAll() {
		return brandRepository.findAll().stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public Page<BrandResponseDTO> findPage(String search, Pageable pageable) {
		if (search != null && !search.isBlank()) {
			return brandRepository.findByNameContainingIgnoreCase(search.trim(), pageable)
					.map(this::toResponse);
		}
		return brandRepository.findAll(pageable)
				.map(this::toResponse);
	}

	@Override
	public BrandResponseDTO findById(Long id) {
		return brandRepository.findById(id)
				.map(this::toResponse)
				.orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
	}

	@Override
	@Transactional
	public BrandResponseDTO create(BrandRequestDTO request) {
		String name = request.name().trim();
		if (brandRepository.existsByNameIgnoreCase(name)) {
			throw new ConflictException("Brand name already exists");
		}
		Brand brand = new Brand();
		brand.setName(name);
		brand.setIsActive(request.isActive() != null ? request.isActive() : true);
		brand.setCreatedAt(LocalDateTime.now());
		brand.setUpdatedAt(LocalDateTime.now());
		Brand saved = brandRepository.save(brand);
		return toResponse(saved);
	}

	@Override
	@Transactional
	public BrandResponseDTO update(Long id, BrandRequestDTO request) {
		Brand brand = brandRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
		String name = request.name().trim();
		if (!brand.getName().equalsIgnoreCase(name) && brandRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
			throw new ConflictException("Brand name already exists");
		}
		brand.setName(name);
		if (request.isActive() != null) {
			brand.setIsActive(request.isActive());
		}
		brand.setUpdatedAt(LocalDateTime.now());
		Brand saved = brandRepository.save(brand);
		return toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Long id) {
		if (!brandRepository.existsById(id)) {
			throw new ResourceNotFoundException("Brand not found");
		}
		if (productRepository.existsByBrandId(id)) {
			throw new ConflictException("Brand cannot be deleted because it is assigned to one or more products");
		}
		brandRepository.deleteById(id);
	}

	private BrandResponseDTO toResponse(Brand brand) {
		return new BrandResponseDTO(
				brand.getId(),
				brand.getName(),
				brand.getIsActive(),
				brand.getCreatedAt(),
				brand.getUpdatedAt()
		);
	}
}
