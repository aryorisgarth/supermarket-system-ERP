package com.supermarket.tax.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.supermarket.tax.entity.TaxCategory;

@Repository
public interface TaxCategoryRepository extends JpaRepository<TaxCategory, Integer> {

	List<TaxCategory> findAllByOrderByNameAsc();

	List<TaxCategory> findByIsActiveTrueOrderByNameAsc();

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Integer id);
}
