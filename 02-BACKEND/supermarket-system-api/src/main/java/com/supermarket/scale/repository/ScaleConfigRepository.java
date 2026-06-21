package com.supermarket.scale.repository;

import com.supermarket.scale.entity.ScaleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScaleConfigRepository extends JpaRepository<ScaleConfig, Long> {
}
