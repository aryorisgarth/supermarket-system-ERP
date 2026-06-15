package com.supermarket.supplier.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.supplier.entity.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

	List<Supplier> findAllByOrderByCompanyNameAsc();

	@Query("""
			SELECT s FROM Supplier s
			WHERE (:search IS NULL OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(s.contactName) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))
			""")
	Page<Supplier> searchPage(@Param("search") String search, Pageable pageable);

	Optional<Supplier> findByCompanyNameIgnoreCase(String companyName);

	boolean existsByCompanyNameIgnoreCase(String companyName);

	boolean existsByCompanyNameIgnoreCaseAndIdNot(String companyName, Integer id);

	@Query("SELECT s FROM Supplier s WHERE s.companyName LIKE CONCAT('%', :search, '%') OR s.contactName LIKE CONCAT('%', :search, '%') OR s.email LIKE CONCAT('%', :search, '%')")
	List<Supplier> searchSuppliers(@Param("search") String search);

	@Query(value = "SELECT COUNT(*) FROM products WHERE supplier_id = :supplierId", nativeQuery = true)
	long countProductsBySupplierId(@Param("supplierId") Integer supplierId);
}
