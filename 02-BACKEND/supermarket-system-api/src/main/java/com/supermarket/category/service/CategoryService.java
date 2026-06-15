package com.supermarket.category.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.category.dto.CategoryRequestDTO;
import com.supermarket.category.dto.CategoryResponseDTO;

public interface CategoryService {

	List<CategoryResponseDTO> findAll();

	Page<CategoryResponseDTO> findPage(String search, Pageable pageable);

	CategoryResponseDTO findById(Short id);

	List<CategoryResponseDTO> searchCategories(String search);

	CategoryResponseDTO create(CategoryRequestDTO request);

	CategoryResponseDTO update(Short id, CategoryRequestDTO request);

	void deleteById(Short id);
}
