package com.supermarket.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public abstract class SupermarketException extends RuntimeException {
    private final HttpStatus status;

    protected SupermarketException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
