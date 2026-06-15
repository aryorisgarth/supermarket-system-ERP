package com.supermarket.alerts.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.supermarket.alerts.entity.SystemAlert;

public interface SystemAlertRepository extends JpaRepository<SystemAlert, Long> {

	Optional<SystemAlert> findByAlertKey(String alertKey);

	@EntityGraph(attributePaths = {"resolvedBy"})
	List<SystemAlert> findAllByOrderByCreatedAtDesc();

	@EntityGraph(attributePaths = {"resolvedBy"})
	List<SystemAlert> findByStatusOrderByCreatedAtDesc(String status);

	@EntityGraph(attributePaths = {"resolvedBy"})
	@Query("""
			SELECT a FROM SystemAlert a
			WHERE (:status IS NULL OR a.status = :status)
			AND (:type IS NULL OR a.type = :type)
			AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(a.message) LIKE LOWER(CONCAT('%', :search, '%')))
			""")
	Page<SystemAlert> searchPage(
			@Param("status") String status,
			@Param("type") String type,
			@Param("search") String search,
			Pageable pageable);

	long countByStatus(String status);
}
