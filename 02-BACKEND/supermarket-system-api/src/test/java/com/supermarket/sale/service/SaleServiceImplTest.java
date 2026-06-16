package com.supermarket.sale.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.audit.service.AuditLogService;
import com.supermarket.billing.service.ElectronicInvoiceService;
import com.supermarket.billing.service.PaymentGatewayService;
import com.supermarket.cashregister.entity.CashRegisterSession;
import com.supermarket.cashregister.service.CashRegisterService;
import com.supermarket.customer.repository.CustomerRepository;
import com.supermarket.exception.BadRequestException;
import com.supermarket.exception.ConflictException;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.product.entity.Product;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.sale.dto.SaleLineRequestDTO;
import com.supermarket.sale.dto.SalePaymentRequestDTO;
import com.supermarket.sale.dto.SaleRequestDTO;
import com.supermarket.sale.entity.Sale;
import com.supermarket.sale.mapper.CreditNoteMapper;
import com.supermarket.sale.mapper.SaleMapper;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.sale.repository.CreditNoteLineRepository;
import com.supermarket.sale.repository.CreditNoteRepository;
import com.supermarket.sale.repository.SaleRepository;
import com.supermarket.product.repository.ProductUomConversionRepository;
import com.supermarket.security.LoggedUser;
import com.supermarket.tax.entity.TaxCategory;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.promotion.service.PromotionService;

@ExtendWith(MockitoExtension.class)
@DisplayName("SaleServiceImpl Unit Tests")
class SaleServiceImplTest {

	@Mock private SaleRepository saleRepository;
	@Mock private CustomerRepository customerRepository;
	@Mock private ProductRepository productRepository;
	@Mock private ProductBatchRepository productBatchRepository;
	@Mock private UserRepository userRepository;
	@Mock private SaleMapper saleMapper;
	@Mock private InventoryLedger inventoryLedger;
	@Mock private AuditLogService auditLogService;
	@Mock private CashRegisterService cashRegisterService;
	@Mock private CreditNoteRepository creditNoteRepository;
	@Mock private CreditNoteLineRepository creditNoteLineRepository;
	@Mock private CreditNoteMapper creditNoteMapper;
	@Mock private PaymentGatewayService paymentGatewayService;
	@Mock private ElectronicInvoiceService electronicInvoiceService;
	@Mock private SaleInvoiceNumberGenerator saleInvoiceNumberGenerator;
	@Mock private ProductUomConversionRepository productUomConversionRepository;
	@Mock private TransactionTemplate transactionTemplate;
	@Mock private PromotionService promotionService;
	@Mock private SaleBatchAllocator saleBatchAllocator;

	@InjectMocks
	private SaleServiceImpl saleService;

	private Product product;
	private User seller;
	private CashRegisterSession session;

	@BeforeEach
	void setUp() {
		TaxCategory tax = new TaxCategory();
		tax.setId(1);
		tax.setName("IVA General");
		tax.setPercentage(new BigDecimal("15.00"));
		tax.setIsActive(true);

		product = new Product();
		product.setId(1L);
		product.setBarcode("TEST001");
		product.setName("Producto Test");
		product.setIsActive(true);
		product.setSalePrice(new BigDecimal("10.0000"));
		product.setCurrentStock(new BigDecimal("100.0000"));
		product.setTaxCategory(tax);

		seller = new User();
		seller.setId(1L);
		seller.setFullName("Cajero Test");
		seller.setEmail("cajero@test.com");

		session = new CashRegisterSession();
		session.setId(1L);
		session.setOpeningBalance(new BigDecimal("50.0000"));

		LoggedUser loggedUser = new LoggedUser(1L, seller.getEmail(), "", true, List.of());
		SecurityContextHolder.getContext().setAuthentication(
				new UsernamePasswordAuthenticationToken(loggedUser, null, loggedUser.getAuthorities()));

		lenient().when(transactionTemplate.execute(any())).thenAnswer(invocation -> {
			org.springframework.transaction.support.TransactionCallback<?> callback = invocation.getArgument(0);
			return callback.doInTransaction(null);
		});

		lenient().when(promotionService.bestPromotion(any(), any(), any())).thenReturn(Optional.empty());
		lenient().when(saleBatchAllocator.allocatePortions(any(), any(), any(), any()))
				.thenAnswer(inv -> List.of(new SaleBatchAllocator.Portion(null, inv.getArgument(2), inv.getArgument(2))));
	}

	@Test
	@DisplayName("create(): lanza CONFLICT si el número de factura ya existe")
	void create_duplicateInvoice_throwsConflict() {
		SaleRequestDTO req = new SaleRequestDTO(
				null,
				"FAC-001",
				List.of(
						new SalePaymentRequestDTO(
								PaymentMethod.CASH,
								new BigDecimal("15.00"),
								null
						)
				),
				List.of()
		);

		when(saleRepository.existsByInvoiceNumberIgnoreCase("FAC-001")).thenReturn(true);

		ConflictException ex = assertThrows(ConflictException.class,
				() -> saleService.create(req));
		assertEquals(HttpStatus.CONFLICT, ex.getStatus());
	}

	@Test
	@DisplayName("create(): lanza BAD_REQUEST si total pagado es menor al total de la factura")
	void create_underpayment_throwsBadRequest() {
		SaleLineRequestDTO line = new SaleLineRequestDTO(
				1L, null, new BigDecimal("1.0000"),
				new BigDecimal("10.0000"), null, null, null);

		SalePaymentRequestDTO payment = new SalePaymentRequestDTO(
				PaymentMethod.CASH,
				new BigDecimal("5.00"),
				null);

		SaleRequestDTO req = new SaleRequestDTO(null, "FAC-002", List.of(payment), List.of(line));

		when(saleRepository.existsByInvoiceNumberIgnoreCase(anyString())).thenReturn(false);
		when(userRepository.findById(anyLong())).thenReturn(Optional.of(seller));
		when(cashRegisterService.getActiveSessionEntity(anyLong())).thenReturn(session);
		when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));

		BadRequestException ex = assertThrows(BadRequestException.class,
				() -> saleService.create(req));
		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
		assertTrue(ex.getMessage().contains("Total paid is less than"));
	}

	@Test
	@DisplayName("create(): lanza CONFLICT si stock insuficiente")
	void create_insufficientStock_throwsConflict() {
		product.setCurrentStock(new BigDecimal("0.5000"));

		SaleLineRequestDTO line = new SaleLineRequestDTO(
				1L, null, new BigDecimal("2.0000"),
				new BigDecimal("10.0000"), null, null, null);

		SalePaymentRequestDTO payment = new SalePaymentRequestDTO(
				PaymentMethod.CASH,
				new BigDecimal("100.00"),
				null);

		SaleRequestDTO req = new SaleRequestDTO(null, "FAC-003", List.of(payment), List.of(line));

		when(saleRepository.existsByInvoiceNumberIgnoreCase(anyString())).thenReturn(false);
		when(userRepository.findById(anyLong())).thenReturn(Optional.of(seller));
		when(cashRegisterService.getActiveSessionEntity(anyLong())).thenReturn(session);
		when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));

		ConflictException ex = assertThrows(ConflictException.class,
				() -> saleService.create(req));
		assertEquals(HttpStatus.CONFLICT, ex.getStatus());
	}

	@Test
	@DisplayName("create(): lanza BAD_REQUEST si hay vuelto pero sin pago en efectivo")
	void create_changeWithoutCash_throwsBadRequest() {
		SaleLineRequestDTO line = new SaleLineRequestDTO(
				1L, null, new BigDecimal("1.0000"),
				new BigDecimal("10.0000"), null, null, null);

		SalePaymentRequestDTO payment = new SalePaymentRequestDTO(
				PaymentMethod.CARD,
				new BigDecimal("50.00"),
				null);

		SaleRequestDTO req = new SaleRequestDTO(null, "FAC-004", List.of(payment), List.of(line));

		when(saleRepository.existsByInvoiceNumberIgnoreCase(anyString())).thenReturn(false);
		when(userRepository.findById(anyLong())).thenReturn(Optional.of(seller));
		when(cashRegisterService.getActiveSessionEntity(anyLong())).thenReturn(session);
		when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));

		BadRequestException ex = assertThrows(BadRequestException.class,
				() -> saleService.create(req));
		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
		assertTrue(ex.getMessage().contains("Change can only be given for CASH"));
	}

	@Test
	@DisplayName("cancel(): lanza BAD_REQUEST si el usuario no tiene caja abierta")
	void cancel_noOpenSession_throwsBadRequest() {
		Sale sale = new Sale();
		sale.setId(99L);
		sale.setStatus(com.supermarket.sale.model.SaleStatus.PAID);
		sale.setTotalAmount(new BigDecimal("50.0000"));

		when(userRepository.findById(anyLong())).thenReturn(Optional.of(seller));
		when(saleRepository.findById(99L)).thenReturn(Optional.of(sale));
		when(cashRegisterService.getActiveSessionEntity(anyLong()))
				.thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "No open cash register session found"));

		ResponseStatusException ex = assertThrows(ResponseStatusException.class,
				() -> saleService.cancel(99L));
		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
	}
}