package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class AncestorInviteLimitReachedException extends AbstractApplicationException {
	public AncestorInviteLimitReachedException() {
	}

	public AncestorInviteLimitReachedException(String message) {
		super(message);
	}

	public AncestorInviteLimitReachedException(String message, Throwable cause) {
		super(message, cause);
	}

	public AncestorInviteLimitReachedException(Throwable cause) {
		super(cause);
	}
}
