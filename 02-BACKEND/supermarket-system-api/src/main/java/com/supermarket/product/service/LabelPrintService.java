package com.supermarket.product.service;

import java.util.List;

import com.supermarket.product.dto.LabelProductDTO;

public interface LabelPrintService {

	List<LabelProductDTO> findProductsWithPriceChangesToday();

	List<LabelProductDTO> buildShelfLabelData(List<Long> productIds);
}
