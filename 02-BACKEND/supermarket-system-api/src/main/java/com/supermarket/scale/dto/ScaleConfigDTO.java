package com.supermarket.scale.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ScaleConfigDTO(
    Long id,
    
    @NotBlank(message = "El prefijo es requerido")
    String prefix,
    
    @NotNull(message = "El largo del PLU es requerido")
    @Min(value = 1, message = "El largo del PLU debe ser mayor a 0")
    Integer pluLength,
    
    @NotNull(message = "El largo del peso es requerido")
    @Min(value = 1, message = "El largo del peso debe ser mayor a 0")
    Integer weightLength,
    
    @NotNull(message = "El divisor es requerido")
    @Min(value = 1, message = "El divisor debe ser mayor a 0")
    BigDecimal divisor
) {}
