package com.supermarket.goal.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.supermarket.goal.model.GoalStatus;
import com.supermarket.goal.model.GoalType;

public record GoalPerformanceDTO(
        Long goalId,
        String name,
        GoalType goalType,
        GoalStatus status,
        LocalDateTime startDate,
        LocalDateTime endDate,
        BigDecimal targetAmount,
        BigDecimal actualAmount,
        BigDecimal progressPercent,
        Long daysRemaining,
        boolean isAchieved
) {}
