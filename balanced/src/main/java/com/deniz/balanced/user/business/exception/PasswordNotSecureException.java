package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class PasswordNotSecureException extends AbstractApplicationException {
	public PasswordNotSecureException() {
	}

	public PasswordNotSecureException(String message) {
		super(message);
	}

	public PasswordNotSecureException(String message, Throwable cause) {
		super(message, cause);
	}

	public PasswordNotSecureException(Throwable cause) {
		super(cause);
	}
}
