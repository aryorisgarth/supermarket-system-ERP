package com.supermarket.product.service;

import java.math.BigDecimal;

import com.supermarket.product.entity.Product;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;
import com.supermarket.user.entity.User;

public interface ProductPriceService {

	void updateSalePrice(Product product, BigDecimal previousSalePrice, BigDecimal newSalePrice,
			ProductSalePriceHistoryReason reason, String notes, User actor);
}
