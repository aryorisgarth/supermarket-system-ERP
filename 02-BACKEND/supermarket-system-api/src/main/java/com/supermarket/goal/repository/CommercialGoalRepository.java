package com.supermarket.goal.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.goal.entity.CommercialGoal;
import com.supermarket.goal.model.GoalStatus;

@Repository
public interface CommercialGoalRepository extends JpaRepository<CommercialGoal, Long> {

    List<CommercialGoal> findByStatus(GoalStatus status);

    @Query("SELECT COALESCE(SUM(s.subtotal), 0) FROM Sale s " +
           "WHERE s.saleDate >= :startDate AND s.saleDate <= :endDate " +
           "AND s.status = com.supermarket.sale.model.SaleStatus.PAID")
    BigDecimal calculateNetSalesInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
