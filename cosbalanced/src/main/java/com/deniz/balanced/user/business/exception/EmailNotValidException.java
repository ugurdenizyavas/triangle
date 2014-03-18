package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class EmailNotValidException extends AbstractApplicationException {
	public EmailNotValidException() {
	}

	public EmailNotValidException(String message) {
		super(message);
	}

	public EmailNotValidException(String message, Throwable cause) {
		super(message, cause);
	}

	public EmailNotValidException(Throwable cause) {
		super(cause);
	}
}
