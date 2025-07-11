package com.example.movie.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public class ShowDoesNotExistException extends RuntimeException {
        private static final long serialVersionUID = 1L;

    public ShowDoesNotExistException(String message) {
        super(message);
    }
}
