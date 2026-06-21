package com.supermarket.scale.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "scale_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScaleConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String prefix;
    private Integer pluLength;
    private Integer weightLength;
    private BigDecimal divisor;
}
