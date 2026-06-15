package com.supermarket.goal.service;

import java.util.List;
import com.supermarket.goal.dto.GoalPerformanceDTO;
import com.supermarket.goal.entity.CommercialGoal;

public interface CommercialGoalService {
    CommercialGoal createGoal(CommercialGoal goal);
    GoalPerformanceDTO getGoalPerformance(Long goalId);
    List<GoalPerformanceDTO> getAllGoalsPerformance();
    void evaluateGoalStatus(Long goalId);
}
