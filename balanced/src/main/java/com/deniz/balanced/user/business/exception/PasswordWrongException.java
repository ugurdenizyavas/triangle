package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class PasswordWrongException extends AbstractApplicationException {
	public PasswordWrongException() {
	}

	public PasswordWrongException(String message) {
		super(message);
	}

	public PasswordWrongException(String message, Throwable cause) {
		super(message, cause);
	}

	public PasswordWrongException(Throwable cause) {
		super(cause);
	}
}
