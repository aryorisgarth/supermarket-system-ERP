package com.supermarket.audit.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.audit.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

	@EntityGraph(attributePaths = {"user"})
	Page<AuditLog> findAllByOrderByLogDateDesc(Pageable pageable);

	@EntityGraph(attributePaths = {"user"})
	@Query("""
			SELECT a FROM AuditLog a
			LEFT JOIN a.user u
			WHERE (:search IS NULL OR :search = ''
				OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(a.affectedTable) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(COALESCE(u.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(COALESCE(a.ipAddress, '')) LIKE LOWER(CONCAT('%', :search, '%')))
			AND (:action IS NULL OR :action = '' OR a.action = :action)
			AND (:affectedTable IS NULL OR :affectedTable = '' OR a.affectedTable = :affectedTable)
			AND (:fromDate IS NULL OR a.logDate >= :fromDate)
			AND (:toDate IS NULL OR a.logDate <= :toDate)
			ORDER BY a.logDate DESC
			""")
	Page<AuditLog> search(
			@Param("search") String search,
			@Param("action") String action,
			@Param("affectedTable") String affectedTable,
			@Param("fromDate") LocalDateTime fromDate,
			@Param("toDate") LocalDateTime toDate,
			Pageable pageable);

	long countByLogDateBetween(LocalDateTime fromDate, LocalDateTime toDate);

	long countByActionIn(List<String> actions);

	@Query("""
			SELECT COUNT(a) FROM AuditLog a
			WHERE a.action IN ('DELETE', 'REMOVE', 'SALE_CANCEL', 'ACCESS_DENIED', 'CASH_CLOSE', 'CASH_MOVEMENT', 'INVENTORY_ADJUSTMENT')
				OR LOWER(a.affectedTable) IN ('users', 'user', 'roles', 'permissions', 'payment_accounts', 'cash_register_sessions', 'cash_register_movements')
			""")
	long countHighRiskEvents();

	@Query("SELECT COUNT(DISTINCT a.user.id) FROM AuditLog a WHERE a.user IS NOT NULL")
	long countDistinctUsers();

	@Query("SELECT a.affectedTable, COUNT(a) FROM AuditLog a GROUP BY a.affectedTable ORDER BY COUNT(a) DESC")
	List<Object[]> findMostAffectedTables(Pageable pageable);
}
