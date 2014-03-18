package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class DataAlreadyExistException extends AbstractApplicationException {
	public DataAlreadyExistException() {
	}

	public DataAlreadyExistException(String message) {
		super(message);
	}

	public DataAlreadyExistException(String message, Throwable cause) {
		super(message, cause);
	}

	public DataAlreadyExistException(Throwable cause) {
		super(cause);
	}
}
