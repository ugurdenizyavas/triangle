package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class AncestorNotExistsException extends AbstractApplicationException {
	public AncestorNotExistsException() {
	}

	public AncestorNotExistsException(String message) {
		super(message);
	}

	public AncestorNotExistsException(String message, Throwable cause) {
		super(message, cause);
	}

	public AncestorNotExistsException(Throwable cause) {
		super(cause);
	}
}
