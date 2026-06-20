package com.supermarket.product.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;

@Service
public class BarcodeParserService {

    private static final String SCALE_PREFIX = "20";

    public record ParsedBarcode(boolean isScaleBarcode, String plu, BigDecimal weight) {}

    public ParsedBarcode parse(String barcode) {
        if (barcode != null && barcode.length() == 13 && barcode.startsWith(SCALE_PREFIX)) {
            // Format: PP CCCCC PPPPP V
            // PP = prefix (20)
            // CCCCC = PLU
            // PPPPP = Weight
            // V = Checksum
            String plu = barcode.substring(2, 7);
            String weightStr = barcode.substring(7, 12);
            
            // Weight has 3 decimal places logic (e.g. 02500 -> 2.500)
            BigDecimal weight = new BigDecimal(weightStr)
                .divide(new BigDecimal("1000"), 3, RoundingMode.HALF_UP);
                
            return new ParsedBarcode(true, plu, weight);
        }
        
        return new ParsedBarcode(false, null, null);
    }
}
