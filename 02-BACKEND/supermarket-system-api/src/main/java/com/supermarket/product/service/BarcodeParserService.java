package com.supermarket.product.service;

import com.supermarket.scale.entity.ScaleConfig;
import com.supermarket.scale.service.ScaleConfigService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BarcodeParserService {

    private final ScaleConfigService scaleConfigService;

    public record ParsedBarcode(boolean isScaleBarcode, String plu, BigDecimal weight) {}

    public ParsedBarcode parse(String barcode) {
        ScaleConfig config = scaleConfigService.getConfig();
        
        int prefixLen = config.getPrefix().length();
        int expectedLength = prefixLen + config.getPluLength() + config.getWeightLength() + 1; // 1 for checksum

        if (barcode != null && barcode.length() == expectedLength && barcode.startsWith(config.getPrefix())) {
            
            int pluStart = prefixLen;
            int pluEnd = pluStart + config.getPluLength();
            String plu = barcode.substring(pluStart, pluEnd);
            
            int weightStart = pluEnd;
            int weightEnd = weightStart + config.getWeightLength();
            String weightStr = barcode.substring(weightStart, weightEnd);
            
            BigDecimal weight = new BigDecimal(weightStr)
                .divide(config.getDivisor(), 3, RoundingMode.HALF_UP);
                
            return new ParsedBarcode(true, plu, weight);
        }
        
        return new ParsedBarcode(false, null, null);
    }
}
