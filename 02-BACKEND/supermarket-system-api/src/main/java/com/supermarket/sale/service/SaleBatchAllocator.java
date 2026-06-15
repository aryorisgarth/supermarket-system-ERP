package com.supermarket.sale.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.supermarket.exception.BadRequestException;
import com.supermarket.exception.ConflictException;
import com.supermarket.product.entity.Product;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.sale.dto.SaleLineRequestDTO;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SaleBatchAllocator {

    private static final int MONEY_SCALE = 4;
    private final ProductBatchRepository productBatchRepository;

    public List<Portion> allocatePortions(Product product, SaleLineRequestDTO line, BigDecimal quantityBase, BigDecimal factor) {
        List<Portion> portions = new ArrayList<>();
        if (Boolean.TRUE.equals(product.getRequiresBatch())) {
            if (line.batchId() != null) {
                ProductBatch b = productBatchRepository.findByIdAndProductIdForUpdate(line.batchId(), product.getId())
                        .orElseThrow(() -> new BadRequestException("Batch not found for product"));
                if (b.getExpirationDate() != null && b.getExpirationDate().isBefore(LocalDate.now())) {
                    throw new BadRequestException("Batch is expired: " + b.getBatchCode());
                }
                if (b.getCurrentQuantity().compareTo(quantityBase) < 0) {
                    throw new ConflictException("Insufficient quantity in batch " + b.getBatchCode());
                }
                portions.add(new Portion(b, quantityBase, line.quantity()));
            } else {
                List<ProductBatch> availableBatches = productBatchRepository
                        .findByProductIdOrderByExpirationDateAsc(product.getId());

                List<ProductBatch> sellableBatches = availableBatches.stream()
                        .filter(b -> b.getCurrentQuantity().compareTo(BigDecimal.ZERO) > 0)
                        .filter(b -> b.getExpirationDate() == null || !b.getExpirationDate().isBefore(LocalDate.now()))
                        .toList();

                BigDecimal totalAvailable = sellableBatches.stream()
                        .map(ProductBatch::getCurrentQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (totalAvailable.compareTo(quantityBase) < 0) {
                    throw new ConflictException("Stock de lotes insuficiente para el producto " + product.getBarcode()
                            + ". Requerido: " + quantityBase + ", Disponible en lotes: " + totalAvailable);
                }

                BigDecimal remainingToAlloc = quantityBase;
                BigDecimal remainingComm = line.quantity();
                for (int i = 0; i < sellableBatches.size(); i++) {
                    if (remainingToAlloc.compareTo(BigDecimal.ZERO) <= 0) {
                        break;
                    }
                    ProductBatch b = sellableBatches.get(i);
                    BigDecimal alloc;
                    BigDecimal allocComm;

                    if (b.getCurrentQuantity().compareTo(remainingToAlloc) >= 0) {
                        alloc = remainingToAlloc;
                        allocComm = remainingComm;
                        remainingToAlloc = BigDecimal.ZERO;
                        remainingComm = BigDecimal.ZERO;
                    } else {
                        alloc = b.getCurrentQuantity();
                        allocComm = alloc.divide(factor, MONEY_SCALE, RoundingMode.HALF_UP);
                        remainingToAlloc = remainingToAlloc.subtract(alloc);
                        remainingComm = remainingComm.subtract(allocComm);
                    }

                    ProductBatch lockedBatch = productBatchRepository.findByIdAndProductIdForUpdate(b.getId(), product.getId())
                            .orElseThrow(() -> new BadRequestException("Batch not found for product"));
                    portions.add(new Portion(lockedBatch, alloc, allocComm));
                }
            }
        } else {
            portions.add(new Portion(null, quantityBase, line.quantity()));
        }
        return portions;
    }

    public static class Portion {
        public final ProductBatch batch;
        public final BigDecimal quantityBase;
        public final BigDecimal quantityCommercial;

        public Portion(ProductBatch batch, BigDecimal quantityBase, BigDecimal quantityCommercial) {
            this.batch = batch;
            this.quantityBase = quantityBase;
            this.quantityCommercial = quantityCommercial;
        }
    }
}
