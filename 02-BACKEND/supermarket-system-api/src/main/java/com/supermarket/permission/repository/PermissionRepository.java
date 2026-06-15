package com.supermarket.permission.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.supermarket.permission.entity.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {

	@Query("SELECT p.code FROM Role r JOIN r.permissions p WHERE r.id = :roleId ORDER BY p.code")
	List<String> findCodesByRoleId(@Param("roleId") Byte roleId);

	List<Permission> findByCodeIn(List<String> codes);
}
