package com.deniz.balanced.framework.business.exception;

public abstract class AbstractApplicationException extends Exception {
	public AbstractApplicationException() {
	}

	public AbstractApplicationException(String message) {
		super(message);
	}

	public AbstractApplicationException(String message, Throwable cause) {
		super(message, cause);
	}

	public AbstractApplicationException(Throwable cause) {
		super(cause);
	}
}
