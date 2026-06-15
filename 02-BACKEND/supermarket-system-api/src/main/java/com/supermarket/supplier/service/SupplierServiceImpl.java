package com.supermarket.supplier.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.supplier.dto.SupplierRequestDTO;
import com.supermarket.supplier.dto.SupplierResponseDTO;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.supplier.mapper.SupplierMapper;
import com.supermarket.supplier.repository.SupplierRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierServiceImpl implements SupplierService {

	private final SupplierRepository supplierRepository;
	private final SupplierMapper supplierMapper;

	@Override
	public List<SupplierResponseDTO> findAll() {
		return supplierRepository.findAllByOrderByCompanyNameAsc().stream()
				.map(supplierMapper::toResponse)
				.toList();
	}

	@Override
	public Page<SupplierResponseDTO> findPage(String search, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		return supplierRepository.searchPage(normalized, pageable).map(supplierMapper::toResponse);
	}

	@Override
	public SupplierResponseDTO findById(Integer id) {
		Supplier supplier = supplierRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));
		return supplierMapper.toResponse(supplier);
	}

	@Override
	public List<SupplierResponseDTO> searchSuppliers(String search) {
		return supplierRepository.searchSuppliers(search).stream()
				.map(supplierMapper::toResponse)
				.toList();
	}

	@Override
	@Transactional
	public SupplierResponseDTO create(SupplierRequestDTO request) {
		normalize(request);
		String companyName = request.getCompanyName();
		
		if (supplierRepository.existsByCompanyNameIgnoreCase(companyName)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Supplier company name already exists");
		}

		Supplier supplier = supplierMapper.toEntity(request);
		Supplier saved = supplierRepository.save(supplier);
		return supplierMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public SupplierResponseDTO update(Integer id, SupplierRequestDTO request) {
		normalize(request);
		Supplier supplier = supplierRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));

		String companyName = request.getCompanyName();
		if (!supplier.getCompanyName().equals(companyName) && supplierRepository.existsByCompanyNameIgnoreCaseAndIdNot(companyName, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Supplier company name already exists");
		}

		supplierMapper.apply(supplier, request);
		Supplier saved = supplierRepository.save(supplier);
		return supplierMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Integer id) {
		if (!supplierRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found");
		}
		
		if (supplierRepository.countProductsBySupplierId(id) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Supplier cannot be deleted because it is assigned to one or more products");
		}
		
		try {
			supplierRepository.deleteById(id);
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Supplier cannot be deleted due to related data in database", ex);
		}
	}

	private static void normalize(SupplierRequestDTO request) {
		request.setCompanyName(request.getCompanyName().trim());
		if (request.getContactName() != null) {
			String cn = request.getContactName().trim();
			request.setContactName(cn.isEmpty() ? null : cn);
		}
		if (request.getPhone() != null) {
			String p = request.getPhone().trim();
			request.setPhone(p.isEmpty() ? null : p);
		}
		if (request.getEmail() != null) {
			String e = request.getEmail().trim().toLowerCase();
			request.setEmail(e.isEmpty() ? null : e);
		}
		if (request.getAddress() != null) {
			String a = request.getAddress().trim();
			request.setAddress(a.isEmpty() ? null : a);
		}
	}
}
