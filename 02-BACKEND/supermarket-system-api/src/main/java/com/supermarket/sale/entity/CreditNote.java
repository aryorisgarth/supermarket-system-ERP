package com.supermarket.sale.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.supermarket.cashregister.entity.CashRegisterSession;
import com.supermarket.sale.model.CreditNoteType;
import com.supermarket.user.entity.User;

@Entity
@Table(name = "credit_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditNote {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sale_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_credit_notes_sales"))
	private Sale sale;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_credit_notes_session"))
	private CashRegisterSession session;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_credit_notes_users"))
	private User user;

	@Size(max = 50)
	@Column(name = "credit_note_number", length = 50)
	private String creditNoteNumber;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private CreditNoteType type = CreditNoteType.FULL;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal amount;

	@NotNull
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal subtotal = BigDecimal.ZERO;

	@NotNull
	@Column(name = "total_tax", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalTax = BigDecimal.ZERO;

	@NotBlank
	@Size(max = 255)
	@Column(nullable = false)
	private String reason;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@OneToMany(mappedBy = "creditNote", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CreditNoteLine> lines = new ArrayList<>();
}
