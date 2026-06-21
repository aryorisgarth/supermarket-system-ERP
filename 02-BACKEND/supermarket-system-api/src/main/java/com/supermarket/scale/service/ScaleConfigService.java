package com.supermarket.scale.service;

import com.supermarket.scale.dto.ScaleConfigDTO;
import com.supermarket.scale.entity.ScaleConfig;
import com.supermarket.scale.repository.ScaleConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScaleConfigService {

    private final ScaleConfigRepository scaleConfigRepository;

    @PostConstruct
    @Transactional
    public void init() {
        if (scaleConfigRepository.count() == 0) {
            ScaleConfig defaultConfig = ScaleConfig.builder()
                .prefix("20")
                .pluLength(5)
                .weightLength(5)
                .divisor(new BigDecimal("1000"))
                .build();
            scaleConfigRepository.save(defaultConfig);
        }
    }

    @Transactional(readOnly = true)
    public ScaleConfig getConfig() {
        List<ScaleConfig> configs = scaleConfigRepository.findAll();
        if (configs.isEmpty()) {
            ScaleConfig defaultConfig = ScaleConfig.builder()
                .prefix("20")
                .pluLength(5)
                .weightLength(5)
                .divisor(new BigDecimal("1000"))
                .build();
            return scaleConfigRepository.save(defaultConfig);
        }
        return configs.get(0);
    }

    @Transactional(readOnly = true)
    public ScaleConfigDTO getConfigDTO() {
        ScaleConfig config = getConfig();
        return toDTO(config);
    }

    @Transactional
    public ScaleConfigDTO updateConfig(ScaleConfigDTO dto) {
        ScaleConfig config = getConfig();
        config.setPrefix(dto.prefix());
        config.setPluLength(dto.pluLength());
        config.setWeightLength(dto.weightLength());
        config.setDivisor(dto.divisor());
        
        ScaleConfig saved = scaleConfigRepository.save(config);
        return toDTO(saved);
    }

    private ScaleConfigDTO toDTO(ScaleConfig entity) {
        return new ScaleConfigDTO(
            entity.getId(),
            entity.getPrefix(),
            entity.getPluLength(),
            entity.getWeightLength(),
            entity.getDivisor()
        );
    }
}
