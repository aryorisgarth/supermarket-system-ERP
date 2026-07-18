package com.supermarket.product.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.supermarket.scale.entity.ScaleConfig;
import com.supermarket.scale.service.ScaleConfigService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BarcodeParserServiceTest {

	@Mock
	private ScaleConfigService scaleConfigService;

	@InjectMocks
	private BarcodeParserService barcodeParserService;

	@Test
	void parseScaleBarcode_extractsNormalizedPluAndWeight() {
		ScaleConfig config = ScaleConfig.builder()
				.prefix("20")
				.pluLength(5)
				.weightLength(5)
				.divisor(new BigDecimal("1000"))
				.build();
		when(scaleConfigService.getConfig()).thenReturn(config);

		var parsed = barcodeParserService.parse("2000085020007");

		assertThat(parsed.isScaleBarcode()).isTrue();
		assertThat(parsed.plu()).isEqualTo("85");
		assertThat(parsed.weight()).isEqualByComparingTo("2.000");
	}

  @Test
  void parseScaleBarcode_cebollaAmarilla_extractsPluAndWeight() {
    ScaleConfig config = ScaleConfig.builder()
        .prefix("20")
        .pluLength(5)
        .weightLength(5)
        .divisor(new BigDecimal("1000"))
        .build();
    when(scaleConfigService.getConfig()).thenReturn(config);

    var parsed = barcodeParserService.parse("2001234020008");

    assertThat(parsed.isScaleBarcode()).isTrue();
    assertThat(parsed.plu()).isEqualTo("1234");
    assertThat(parsed.weight()).isEqualByComparingTo("2.000");
  }

  @Test
  void normalizePlu_stripsLeadingZeros() {
		assertThat(BarcodeParserService.normalizePlu("00085")).isEqualTo("85");
		assertThat(BarcodeParserService.normalizePlu("04011")).isEqualTo("4011");
	}
}
