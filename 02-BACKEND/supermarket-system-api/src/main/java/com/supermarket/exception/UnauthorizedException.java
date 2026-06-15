package com.supermarket.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends SupermarketException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
