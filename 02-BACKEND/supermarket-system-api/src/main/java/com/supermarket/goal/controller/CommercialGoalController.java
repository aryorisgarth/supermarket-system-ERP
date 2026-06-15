package com.supermarket.goal.controller;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.supermarket.goal.dto.GoalPerformanceDTO;
import com.supermarket.goal.entity.CommercialGoal;
import com.supermarket.goal.service.CommercialGoalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/commercial-goals")
@RequiredArgsConstructor
public class CommercialGoalController {

    private final CommercialGoalService goalService;

    @PostMapping
    public ResponseEntity<CommercialGoal> createGoal(@Valid @RequestBody CommercialGoal goal) {
        CommercialGoal created = goalService.createGoal(goal);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/performance")
    public ResponseEntity<GoalPerformanceDTO> getGoalPerformance(@PathVariable Long id) {
        goalService.evaluateGoalStatus(id);
        return ResponseEntity.ok(goalService.getGoalPerformance(id));
    }

    @GetMapping("/performance")
    public ResponseEntity<List<GoalPerformanceDTO>> getAllGoalsPerformance() {
        return ResponseEntity.ok(goalService.getAllGoalsPerformance());
    }
}
