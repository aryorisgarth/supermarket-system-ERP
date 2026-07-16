package com.supermarket.sale.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.sale.dto.CouponLookupResponseDTO;
import com.supermarket.sale.entity.Coupon;
import com.supermarket.sale.model.CouponStatus;
import com.supermarket.sale.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

	private final CouponRepository couponRepository;

	@GetMapping("/code/{code}")
	public CouponLookupResponseDTO findByCode(@PathVariable String code) {
		Coupon coupon = couponRepository.findByCode(code.trim())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupón no encontrado"));
		if (coupon.getStatus() != CouponStatus.ACTIVE || coupon.isExpired()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cupón no disponible");
		}
		if (coupon.getRemainingBalance() == null || coupon.getRemainingBalance().signum() <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cupón sin saldo disponible");
		}
		return new CouponLookupResponseDTO(
				coupon.getId(),
				coupon.getCode(),
				coupon.getRemainingBalance(),
				coupon.getStatus(),
				coupon.getExpirationDate());
	}
}
