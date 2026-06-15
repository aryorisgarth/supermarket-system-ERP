package com.supermarket.category.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.category.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Short> {

	List<Category> findAllByOrderByNameAsc();

	@Query("""
			SELECT c FROM Category c
			WHERE (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))
			""")
	Page<Category> searchPage(@Param("search") String search, Pageable pageable);

	Optional<Category> findByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Short id);

	@Query("SELECT c FROM Category c WHERE c.name LIKE CONCAT('%', :search, '%') OR c.description LIKE CONCAT('%', :search, '%')")
	List<Category> searchCategories(@Param("search") String search);

	@Query(value = "SELECT COUNT(*) FROM products WHERE category_id = :categoryId", nativeQuery = true)
	long countProductsByCategoryId(@Param("categoryId") Short categoryId);
}
