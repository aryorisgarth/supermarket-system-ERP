package com.supermarket.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends SupermarketException {
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
