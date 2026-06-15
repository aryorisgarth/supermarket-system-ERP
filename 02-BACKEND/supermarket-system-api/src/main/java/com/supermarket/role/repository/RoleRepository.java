package com.supermarket.role.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.supermarket.role.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Byte> {

	List<Role> findAllByOrderByNameAsc();

	Optional<Role> findByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Byte id);

	@Query(value = "SELECT COUNT(*) FROM users WHERE role_id = :roleId", nativeQuery = true)
	long countUsersByRoleId(@Param("roleId") Byte roleId);
}
