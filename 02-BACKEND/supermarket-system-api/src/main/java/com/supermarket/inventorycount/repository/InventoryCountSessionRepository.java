package com.supermarket.inventorycount.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.inventorycount.entity.InventoryCountSession;
import com.supermarket.inventorycount.model.InventoryCountStatus;

@Repository
public interface InventoryCountSessionRepository extends JpaRepository<InventoryCountSession, Long> {

	Optional<InventoryCountSession> findBySessionCode(String sessionCode);

	long countByStatus(InventoryCountStatus status);

	List<InventoryCountSession> findByStatusOrderBySubmittedAtDesc(InventoryCountStatus status);

	@EntityGraph(attributePaths = { "lines", "lines.product", "createdBy", "approvedBy" })
	@Query("SELECT s FROM InventoryCountSession s WHERE s.id = :id")
	Optional<InventoryCountSession> findByIdWithDetails(@Param("id") Long id);

	@EntityGraph(attributePaths = { "createdBy", "approvedBy" })
	@Query("""
			SELECT s FROM InventoryCountSession s
			WHERE (:status IS NULL OR s.status = :status)
			ORDER BY s.createdAt DESC
			""")
	Page<InventoryCountSession> findPage(@Param("status") InventoryCountStatus status, Pageable pageable);
}
