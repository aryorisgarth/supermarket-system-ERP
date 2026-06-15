package com.supermarket.customer.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.customer.dto.CustomerRequestDTO;
import com.supermarket.customer.dto.CustomerResponseDTO;
import com.supermarket.customer.dto.CustomerDetailResponseDTO;
import com.supermarket.customer.entity.Customer;
import com.supermarket.customer.mapper.CustomerMapper;
import com.supermarket.customer.repository.CustomerRepository;
import com.supermarket.sale.repository.SaleRepository;
import com.supermarket.sale.mapper.SaleMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	private final CustomerMapper customerMapper;
	private final SaleRepository saleRepository;
	private final SaleMapper saleMapper;

	@Override
	public org.springframework.data.domain.Page<CustomerResponseDTO> findAll(String search, org.springframework.data.domain.Pageable pageable) {
		org.springframework.data.domain.Page<Customer> page;
		if (search != null && !search.trim().isEmpty()) {
			page = customerRepository.searchCustomersPaged(search.trim(), pageable);
		} else {
			page = customerRepository.findAll(pageable);
		}
		return page.map(c -> {
			var lastDate = saleRepository.findLastPurchaseDateByCustomerId(c.getId());
			return customerMapper.toResponse(c, lastDate);
		});
	}

	@Override
	public CustomerDetailResponseDTO findById(Long id) {
		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
		
		var sales = saleRepository.findByCustomerIdOrderBySaleDateDesc(id).stream()
				.map(saleMapper::toSummary)
				.toList();
				
		return new CustomerDetailResponseDTO(
				customer.getId(),
				customer.getFullName(),
				customer.getDocumentId(),
				customer.getPhone(),
				customer.getEmail(),
				customer.getAddress(),
				customer.getPoints() != null ? customer.getPoints() : 0,
				customer.getCreatedAt(),
				sales
		);
	}

	@Override
	public List<CustomerResponseDTO> searchCustomers(String search) {
		return customerRepository.searchCustomers(search, PageRequest.of(0, 15)).stream()
				.map(c -> {
					var lastDate = saleRepository.findLastPurchaseDateByCustomerId(c.getId());
					return customerMapper.toResponse(c, lastDate);
				})
				.toList();
	}

	@Override
	@Transactional
	public CustomerResponseDTO create(CustomerRequestDTO request) {
		normalize(request);
		
		if (request.getDocumentId() != null && customerRepository.existsByDocumentId(request.getDocumentId())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Customer document ID already exists");
		}

		Customer customer = customerMapper.toEntity(request);
		customer.setCreatedAt(LocalDateTime.now());
		
		Customer saved = customerRepository.save(customer);
		return customerMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public CustomerResponseDTO update(Long id, CustomerRequestDTO request) {
		normalize(request);
		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

		String documentId = request.getDocumentId();
		if (documentId != null && !documentId.equals(customer.getDocumentId()) 
				&& customerRepository.existsByDocumentIdAndIdNot(documentId, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Customer document ID already exists");
		}

		customerMapper.apply(customer, request);
		Customer saved = customerRepository.save(customer);
		return customerMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Long id) {
		if (!customerRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
		}

		if (customerRepository.countSalesByCustomerId(id) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Customer cannot be deleted because it has associated sales");
		}

		try {
			customerRepository.deleteById(id);
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Customer cannot be deleted due to related data in database", ex);
		}
	}

	@Override
	@Transactional
	public CustomerResponseDTO updatePoints(Long id, Integer points) {
		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
		customer.setPoints(points);
		Customer saved = customerRepository.save(customer);
		return customerMapper.toResponse(saved);
	}

	private static void normalize(CustomerRequestDTO request) {
		request.setFullName(request.getFullName().trim());
		if (request.getDocumentId() != null) {
			String doc = request.getDocumentId().trim();
			request.setDocumentId(doc.isEmpty() ? null : doc);
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
