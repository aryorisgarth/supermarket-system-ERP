package com.supermarket.dailyclosure.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.dailyclosure.dto.DailyClosureRequestDTO;
import com.supermarket.dailyclosure.dto.DailyClosureResponseDTO;
import com.supermarket.dailyclosure.service.DailyClosureService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/daily-closures")
@RequiredArgsConstructor
public class DailyClosureController {

	private final DailyClosureService dailyClosureService;

	@GetMapping
	public ResponseEntity<List<DailyClosureResponseDTO>> list() {
		return ResponseEntity.ok(dailyClosureService.findAll());
	}

	@GetMapping("/date/{date}")
	public ResponseEntity<DailyClosureResponseDTO> findByDate(
			@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return dailyClosureService.findByDate(date)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.noContent().build());
	}

	@PostMapping
	public ResponseEntity<DailyClosureResponseDTO> create(@Valid @RequestBody DailyClosureRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(dailyClosureService.create(request));
	}
}
