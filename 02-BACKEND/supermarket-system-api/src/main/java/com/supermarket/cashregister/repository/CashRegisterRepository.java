package com.supermarket.cashregister.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.supermarket.cashregister.entity.CashRegister;

@Repository
public interface CashRegisterRepository extends JpaRepository<CashRegister, Long> {
    List<CashRegister> findByStatusIgnoreCase(String status);
}
