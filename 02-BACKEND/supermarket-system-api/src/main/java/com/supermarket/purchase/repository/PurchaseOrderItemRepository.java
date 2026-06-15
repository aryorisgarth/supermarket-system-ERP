package com.supermarket.purchase.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.supermarket.purchase.entity.PurchaseOrderItem;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
}
