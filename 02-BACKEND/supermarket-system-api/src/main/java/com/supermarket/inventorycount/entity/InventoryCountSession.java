package com.supermarket.inventorycount.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.supermarket.inventorycount.model.InventoryCountStatus;
import com.supermarket.user.entity.User;

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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_count_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "session_code", nullable = false, unique = true, length = 30)
	private String sessionCode;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private InventoryCountStatus status;

	@Column(length = 255)
	private String notes;

	@Column(name = "warehouse_zone", length = 80)
	private String warehouseZone;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "created_by", nullable = false)
	private User createdBy;

	@Column(name = "submitted_at")
	private LocalDateTime submittedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "approved_by")
	private User approvedBy;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "counted_by_id")
	private User countedBy;

	@Column(name = "approved_at")
	private LocalDateTime approvedAt;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<InventoryCountLine> lines = new ArrayList<>();
}
