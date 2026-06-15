package com.supermarket.category.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.supermarket.category.dto.CategoryRequestDTO;
import com.supermarket.category.dto.CategoryResponseDTO;
import com.supermarket.category.entity.Category;
import com.supermarket.category.mapper.CategoryMapper;
import com.supermarket.category.repository.CategoryRepository;
import com.supermarket.exception.ConflictException;
import com.supermarket.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

	private final CategoryRepository categoryRepository;
	private final CategoryMapper categoryMapper;

	@Override
	public List<CategoryResponseDTO> findAll() {
		return categoryRepository.findAllByOrderByNameAsc().stream()
				.map(categoryMapper::toResponse)
				.toList();
	}

	@Override
	public Page<CategoryResponseDTO> findPage(String search, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		return categoryRepository.searchPage(normalized, pageable).map(categoryMapper::toResponse);
	}

	@Override
	public CategoryResponseDTO findById(Short id) {
		Category category = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found"));
		return categoryMapper.toResponse(category);
	}

	@Override
	public List<CategoryResponseDTO> searchCategories(String search) {
		return categoryRepository.searchCategories(search).stream()
				.map(categoryMapper::toResponse)
				.toList();
	}

	@Override
	@Transactional
	public CategoryResponseDTO create(CategoryRequestDTO request) {
		normalize(request);
		String name = request.getName();
		
		if (categoryRepository.existsByNameIgnoreCase(name)) {
			throw new ConflictException("Category name already exists");
		}

		Category category = categoryMapper.toEntity(request);
		Category saved = categoryRepository.save(category);
		return categoryMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public CategoryResponseDTO update(Short id, CategoryRequestDTO request) {
		normalize(request);
		Category category = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found"));

		String name = request.getName();
		if (!category.getName().equals(name) && categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
			throw new ConflictException("Category name already exists");
		}

		categoryMapper.apply(category, request);
		Category saved = categoryRepository.save(category);
		return categoryMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Short id) {
		if (!categoryRepository.existsById(id)) {
			throw new ResourceNotFoundException("Category not found");
		}
		
		if (categoryRepository.countProductsByCategoryId(id) > 0) {
			throw new ConflictException(
					"Category cannot be deleted because it is assigned to one or more products");
		}
		
		try {
			categoryRepository.deleteById(id);
		} catch (DataIntegrityViolationException ex) {
			throw new ConflictException(
					"Category cannot be deleted due to related data in the database");
		}
	}

	private static void normalize(CategoryRequestDTO request) {
		request.setName(request.getName().trim());
		if (request.getDescription() != null) {
			String d = request.getDescription().trim();
			request.setDescription(d.isEmpty() ? null : d);
		}
	}
}
