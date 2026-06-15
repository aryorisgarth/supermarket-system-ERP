package com.supermarket.goal.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import com.supermarket.goal.model.GoalStatus;
import com.supermarket.goal.model.GoalType;

@Entity
@Table(name = "commercial_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommercialGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(name = "target_amount", nullable = false, precision = 12, scale = 4)
    private BigDecimal targetAmount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false, length = 20)
    private GoalType goalType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GoalStatus status = GoalStatus.ACTIVE;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Version
    @Column(nullable = false)
    private Long version;
}
