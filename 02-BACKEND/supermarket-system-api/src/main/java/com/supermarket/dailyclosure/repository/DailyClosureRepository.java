package com.supermarket.dailyclosure.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.supermarket.dailyclosure.entity.DailyClosure;

public interface DailyClosureRepository extends JpaRepository<DailyClosure, Long> {

	boolean existsByClosureDate(LocalDate closureDate);

	@EntityGraph(attributePaths = {"closedBy"})
	Optional<DailyClosure> findByClosureDate(LocalDate closureDate);

	@EntityGraph(attributePaths = {"closedBy"})
	List<DailyClosure> findAllByOrderByClosureDateDesc();
}
