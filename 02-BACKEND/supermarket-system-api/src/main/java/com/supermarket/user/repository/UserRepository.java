package com.supermarket.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	Optional<User> findByEmailIgnoreCase(String email);

	@Query("SELECT DISTINCT u FROM User u JOIN FETCH u.role LEFT JOIN FETCH u.directPermissions WHERE LOWER(u.email) = LOWER(:email)")
	Optional<User> findByEmailWithRole(@Param("email") String email);

	@Query("SELECT DISTINCT u FROM User u JOIN FETCH u.role LEFT JOIN FETCH u.directPermissions WHERE u.id = :id")
	Optional<User> findByIdWithRoleAndPermissions(@Param("id") Long id);

	boolean existsByEmail(String email);

	boolean existsByEmailAndIdNot(String email, Long id);

	List<User> findByRole_NameOrderByFullNameAsc(String roleName);

	List<User> findByIsActiveTrueOrderByFullNameAsc();

	List<User> findAllByIsSystemFalseOrderByFullNameAsc();

	@EntityGraph(attributePaths = {"role", "directPermissions"})
	@Query("""
			SELECT u FROM User u
			WHERE u.isSystem = false
			  AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
			""")
	Page<User> searchPage(@Param("search") String search, Pageable pageable);

	@Query("SELECT u FROM User u WHERE u.isSystem = false AND (u.fullName LIKE CONCAT('%', :search, '%') OR u.email LIKE CONCAT('%', :search, '%'))")
	List<User> searchUsers(@Param("search") String search);

	@Query("SELECT u FROM User u WHERE u.role.id = :roleId AND u.isActive = :isActive ORDER BY u.fullName ASC")
	List<User> findByRoleIdAndIsActive(@Param("roleId") Byte roleId, @Param("isActive") Boolean isActive);
}
