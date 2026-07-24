package com.supermarket.product.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.product.dto.LabelLocationDTO;
import com.supermarket.product.dto.LabelProductDTO;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductLocation;
import com.supermarket.product.repository.ProductLocationRepository;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.producthistory.entity.ProductSalePriceHistory;
import com.supermarket.producthistory.repository.ProductSalePriceHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LabelPrintServiceImpl implements LabelPrintService {

	private final ProductSalePriceHistoryRepository productSalePriceHistoryRepository;
	private final ProductRepository productRepository;
	private final ProductLocationRepository productLocationRepository;

	@Override
	public List<LabelProductDTO> findProductsWithPriceChangesToday() {
		LocalDate today = LocalDate.now();
		LocalDateTime from = today.atStartOfDay();
		LocalDateTime to = today.plusDays(1).atStartOfDay();

		List<ProductSalePriceHistory> history = productSalePriceHistoryRepository
				.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to);

		Set<Long> productIds = new LinkedHashSet<>();
		for (ProductSalePriceHistory entry : history) {
			productIds.add(entry.getProduct().getId());
		}

		return buildShelfLabelData(new ArrayList<>(productIds));
	}

	@Override
	public List<LabelProductDTO> buildShelfLabelData(List<Long> productIds) {
		if (productIds == null || productIds.isEmpty()) {
			return List.of();
		}

		List<Long> normalizedIds = productIds.stream()
				.filter(id -> id != null && id > 0)
				.distinct()
				.collect(Collectors.toCollection(ArrayList::new));

		if (normalizedIds.isEmpty()) {
			return List.of();
		}

		List<Product> products = productRepository.findAllById(normalizedIds);
		if (products.isEmpty()) {
			return List.of();
		}

		Map<Long, Product> productById = products.stream()
				.collect(Collectors.toMap(Product::getId, product -> product, (a, b) -> a, LinkedHashMap::new));

		Map<Long, List<ProductLocation>> locationsByProductId = productLocationRepository
				.findByProductIdIn(normalizedIds).stream()
				.collect(Collectors.groupingBy(pl -> pl.getProduct().getId()));

		List<LabelProductDTO> result = new ArrayList<>();
		for (Long productId : normalizedIds) {
			Product product = productById.get(productId);
			if (product == null) {
				continue;
			}
			List<ProductLocation> productLocations = locationsByProductId.getOrDefault(productId, List.of());
			result.add(toLabelProductDto(product, productLocations));
		}
		return result;
	}

	private LabelProductDTO toLabelProductDto(Product product, List<ProductLocation> productLocations) {
		List<LabelLocationDTO> locations = productLocations.stream()
				.sorted(Comparator
						.comparing((ProductLocation pl) -> !Boolean.TRUE.equals(pl.getLocation().getIsPisoVenta()))
						.thenComparing(pl -> pl.getLocation().getLocationCode()))
				.map(pl -> new LabelLocationDTO(
						pl.getLocation().getLocationCode(),
						pl.getLocation().getAisle(),
						pl.getLocation().getShelf(),
						pl.getLocation().getLevel(),
						pl.getLocation().getWarehouse(),
						pl.getLocation().getIsPisoVenta()))
				.toList();

		return new LabelProductDTO(
				product.getId(),
				product.getName(),
				product.getBarcode(),
				product.getSalePrice(),
				product.getUomBase(),
				product.getCategory() != null ? product.getCategory().getName() : null,
				product.getBrand() != null ? product.getBrand().getName() : null,
				product.getMinStockExhibicion(),
				locations);
	}
}
