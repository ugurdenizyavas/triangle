package com.deniz.balanced.user.business.exception;

import com.deniz.framework.business.exception.AbstractApplicationException;

public class NotValidIdException extends AbstractApplicationException {
	public NotValidIdException() {
	}

	public NotValidIdException(String message) {
		super(message);
	}

	public NotValidIdException(String message, Throwable cause) {
		super(message, cause);
	}

	public NotValidIdException(Throwable cause) {
		super(cause);
	}
}
