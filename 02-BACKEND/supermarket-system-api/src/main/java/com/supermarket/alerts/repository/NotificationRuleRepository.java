package com.supermarket.alerts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.supermarket.alerts.entity.NotificationRule;

@Repository
public interface NotificationRuleRepository extends JpaRepository<NotificationRule, Long> {

	List<NotificationRule> findByAlertTypeAndSeverityAndIsActiveTrue(String alertType, String severity);
}
