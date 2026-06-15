package com.supermarket.cashregister.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.cashregister.dto.CashRegisterSessionDTO;
import com.supermarket.cashregister.entity.CashRegisterSession;

@Component
public class CashRegisterMapper {

	public CashRegisterSessionDTO toResponse(CashRegisterSession session) {
		if (session == null) return null;
		
		return new CashRegisterSessionDTO(
				session.getId(),
				session.getCashier().getId(),
				session.getCashier().getFullName(),
				session.getOpenedAt(),
				session.getClosedAt(),
				session.getOpeningBalance(),
				session.getSystemCalculatedBalance(),
				session.getActualClosingBalance(),
				session.getDifference(),
				session.getExpectedCash(),
				session.getExpectedCard(),
				session.getExpectedTransfer(),
				session.getCountedCash(),
				session.getCountedCard(),
				session.getCountedTransfer(),
				session.getCardDifference(),
				session.getTransferDifference(),
				session.getStatus(),
				session.getNotes()
		);
	}
}
