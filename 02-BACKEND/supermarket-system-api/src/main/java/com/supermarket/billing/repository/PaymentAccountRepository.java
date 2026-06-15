package com.supermarket.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.supermarket.billing.entity.PaymentAccount;

public interface PaymentAccountRepository extends JpaRepository<PaymentAccount, Long> {

	List<PaymentAccount> findAllByOrderByIsDefaultDescNameAsc();

	Optional<PaymentAccount> findFirstByIsActiveTrueAndIsDefaultTrueOrderByIdAsc();

	Optional<PaymentAccount> findFirstByIsActiveTrueOrderByIdAsc();
}
