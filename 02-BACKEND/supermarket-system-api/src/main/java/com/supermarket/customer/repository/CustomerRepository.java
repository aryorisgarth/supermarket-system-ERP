package com.supermarket.customer.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.customer.entity.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

	List<Customer> findAllByOrderByFullNameAsc();

	Optional<Customer> findByDocumentId(String documentId);

	boolean existsByDocumentId(String documentId);

	boolean existsByDocumentIdAndIdNot(String documentId, Long id);

	@Query("SELECT c FROM Customer c WHERE LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR c.phone LIKE CONCAT('%', :search, '%') OR c.documentId LIKE CONCAT('%', :search, '%') OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY c.fullName")
	List<Customer> searchCustomers(@Param("search") String search, Pageable pageable);

	@Query("SELECT c FROM Customer c WHERE :search IS NULL OR :search = '' OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR c.phone LIKE CONCAT('%', :search, '%') OR c.documentId LIKE CONCAT('%', :search, '%') OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))")
	org.springframework.data.domain.Page<Customer> searchCustomersPaged(@Param("search") String search, Pageable pageable);

	@Query(value = "SELECT COUNT(*) FROM sales WHERE customer_id = :customerId", nativeQuery = true)
	long countSalesByCustomerId(@Param("customerId") Long customerId);
}
