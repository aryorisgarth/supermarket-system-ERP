package com.supermarket.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends SupermarketException {
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
