package com.supermarket.tax.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.tax.dto.TaxCategoryRequestDTO;
import com.supermarket.tax.dto.TaxCategoryResponseDTO;
import com.supermarket.tax.entity.TaxCategory;
import com.supermarket.tax.mapper.TaxCategoryMapper;
import com.supermarket.tax.repository.TaxCategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaxCategoryServiceImpl implements TaxCategoryService {

	private final TaxCategoryRepository taxCategoryRepository;
	private final TaxCategoryMapper taxCategoryMapper;

	@Override
	public List<TaxCategoryResponseDTO> findAll() {
		return taxCategoryRepository.findAllByOrderByNameAsc().stream()
				.map(taxCategoryMapper::toResponse)
				.toList();
	}

	@Override
	public List<TaxCategoryResponseDTO> findActive() {
		return taxCategoryRepository.findByIsActiveTrueOrderByNameAsc().stream()
				.map(taxCategoryMapper::toResponse)
				.toList();
	}

	@Override
	public TaxCategoryResponseDTO findById(Integer id) {
		TaxCategory entity = taxCategoryRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tax category not found"));
		return taxCategoryMapper.toResponse(entity);
	}

	@Override
	@Transactional
	public TaxCategoryResponseDTO create(TaxCategoryRequestDTO request) {
		if (taxCategoryRepository.existsByNameIgnoreCase(request.name().trim())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Tax category name already exists");
		}
		TaxCategory entity = new TaxCategory();
		taxCategoryMapper.updateEntity(entity, request);
		return taxCategoryMapper.toResponse(taxCategoryRepository.save(entity));
	}

	@Override
	@Transactional
	public TaxCategoryResponseDTO update(Integer id, TaxCategoryRequestDTO request) {
		TaxCategory entity = taxCategoryRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tax category not found"));

		if (taxCategoryRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Tax category name already exists");
		}

		taxCategoryMapper.updateEntity(entity, request);
		return taxCategoryMapper.toResponse(taxCategoryRepository.save(entity));
	}

	@Override
	@Transactional
	public void delete(Integer id) {
		TaxCategory entity = taxCategoryRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tax category not found"));
		taxCategoryRepository.delete(entity);
	}
}
