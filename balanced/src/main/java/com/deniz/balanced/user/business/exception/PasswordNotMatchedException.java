package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class PasswordNotMatchedException extends AbstractApplicationException {
	public PasswordNotMatchedException() {
	}

	public PasswordNotMatchedException(String message) {
		super(message);
	}

	public PasswordNotMatchedException(String message, Throwable cause) {
		super(message, cause);
	}

	public PasswordNotMatchedException(Throwable cause) {
		super(cause);
	}
}
