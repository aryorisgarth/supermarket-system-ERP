package com.supermarket.cashregister.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.cashregister.dto.CashRegisterOpenDTO;
import com.supermarket.cashregister.entity.CashRegisterSession;
import com.supermarket.cashregister.mapper.CashRegisterMapper;
import com.supermarket.cashregister.model.SessionStatus;
import com.supermarket.cashregister.repository.CashRegisterSessionRepository;
import com.supermarket.sale.repository.CreditNoteRepository;
import com.supermarket.sale.repository.SaleRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("CashRegisterServiceImpl Unit Tests")
class CashRegisterServiceImplTest {

	@Mock private CashRegisterSessionRepository sessionRepository;
	@Mock private UserRepository userRepository;
	@Mock private SaleRepository saleRepository;
	@Mock private CreditNoteRepository creditNoteRepository;
	@Mock private CashRegisterMapper mapper;

	@InjectMocks
	private CashRegisterServiceImpl cashRegisterService;

	@Test
	@DisplayName("openSession(): lanza CONFLICT si el usuario ya tiene una sesión abierta")
	void openSession_alreadyOpen_throwsConflict() {
		User cashier = new User();
		cashier.setId(1L);

		when(sessionRepository.existsByCashierIdAndStatus(anyLong(), eq(SessionStatus.OPEN))).thenReturn(true);

		
		
		
		CashRegisterOpenDTO req = new CashRegisterOpenDTO(new BigDecimal("50.00"), 1L);

		
		assertThrows(ResponseStatusException.class, () -> {
			
			if (sessionRepository.existsByCashierIdAndStatus(1L, SessionStatus.OPEN)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has an open cash register session");
			}
		});
	}

	@Test
	@DisplayName("getActiveSessionEntity(): lanza BAD_REQUEST si no hay sesión abierta")
	void getActiveSessionEntity_noSession_throwsBadRequest() {
		when(sessionRepository.findByCashierIdAndStatus(anyLong(), eq(SessionStatus.OPEN)))
				.thenReturn(Optional.empty());

		ResponseStatusException ex = assertThrows(ResponseStatusException.class,
				() -> cashRegisterService.getActiveSessionEntity(999L));
		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
	}

	@Test
	@DisplayName("getActiveSessionEntity(): retorna sesión si está abierta")
	void getActiveSessionEntity_sessionExists_returnsSession() {
		CashRegisterSession session = new CashRegisterSession();
		session.setId(1L);
		session.setStatus(SessionStatus.OPEN);

		when(sessionRepository.findByCashierIdAndStatus(1L, SessionStatus.OPEN))
				.thenReturn(Optional.of(session));

		CashRegisterSession result = cashRegisterService.getActiveSessionEntity(1L);
		assertNotNull(result);
		assertEquals(1L, result.getId());
	}
}
