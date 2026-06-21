package com.supermarket.scale.controller;

import com.supermarket.scale.dto.ScaleConfigDTO;
import com.supermarket.scale.service.ScaleConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scale-config")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN_INGENIERO')")
public class ScaleConfigController {

    private final ScaleConfigService scaleConfigService;

    @GetMapping
    public ResponseEntity<ScaleConfigDTO> getConfig() {
        return ResponseEntity.ok(scaleConfigService.getConfigDTO());
    }

    @PutMapping
    public ResponseEntity<ScaleConfigDTO> updateConfig(@Valid @RequestBody ScaleConfigDTO dto) {
        return ResponseEntity.ok(scaleConfigService.updateConfig(dto));
    }
}
