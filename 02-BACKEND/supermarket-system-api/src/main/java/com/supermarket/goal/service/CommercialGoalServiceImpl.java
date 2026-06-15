package com.supermarket.goal.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.goal.dto.GoalPerformanceDTO;
import com.supermarket.goal.entity.CommercialGoal;
import com.supermarket.goal.model.GoalStatus;
import com.supermarket.goal.repository.CommercialGoalRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommercialGoalServiceImpl implements CommercialGoalService {

    private final CommercialGoalRepository goalRepository;

    @Override
    @Transactional
    public CommercialGoal createGoal(CommercialGoal goal) {
        if (goal.getCreatedAt() == null) {
            goal.setCreatedAt(LocalDateTime.now());
        }
        return goalRepository.save(goal);
    }

    @Override
    public GoalPerformanceDTO getGoalPerformance(Long goalId) {
        CommercialGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Commercial Goal not found with ID: " + goalId));
        return buildPerformanceDTO(goal);
    }

    @Override
    public List<GoalPerformanceDTO> getAllGoalsPerformance() {
        return goalRepository.findAll().stream()
                .map(this::buildPerformanceDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void evaluateGoalStatus(Long goalId) {
        CommercialGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        
        if (goal.getStatus() != GoalStatus.ACTIVE) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(goal.getEndDate())) {
            BigDecimal actualSales = goalRepository.calculateNetSalesInRange(goal.getStartDate(), goal.getEndDate());
            if (actualSales.compareTo(goal.getTargetAmount()) >= 0) {
                goal.setStatus(GoalStatus.COMPLETED);
            } else {
                goal.setStatus(GoalStatus.FAILED);
            }
            goalRepository.save(goal);
        }
    }

    private GoalPerformanceDTO buildPerformanceDTO(CommercialGoal goal) {
        BigDecimal actualAmount = goalRepository.calculateNetSalesInRange(goal.getStartDate(), goal.getEndDate());
        
        BigDecimal progressPercent = BigDecimal.ZERO;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPercent = actualAmount
                    .multiply(BigDecimal.valueOf(100))
                    .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP);
        }

        LocalDateTime now = LocalDateTime.now();
        long daysRemaining = 0;
        if (now.isBefore(goal.getEndDate())) {
            daysRemaining = Duration.between(now, goal.getEndDate()).toDays();
        }

        boolean isAchieved = actualAmount.compareTo(goal.getTargetAmount()) >= 0;

        return new GoalPerformanceDTO(
                goal.getId(),
                goal.getName(),
                goal.getGoalType(),
                goal.getStatus(),
                goal.getStartDate(),
                goal.getEndDate(),
                goal.getTargetAmount(),
                actualAmount,
                progressPercent,
                daysRemaining,
                isAchieved
        );
    }
}
