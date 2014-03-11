package com.deniz.balanced.user.business.exception;

import com.deniz.balanced.framework.business.exception.AbstractApplicationException;

public class MissionAlreadyCompletedException extends AbstractApplicationException {
	public MissionAlreadyCompletedException() {
	}

	public MissionAlreadyCompletedException(String message) {
		super(message);
	}

	public MissionAlreadyCompletedException(String message, Throwable cause) {
		super(message, cause);
	}

	public MissionAlreadyCompletedException(Throwable cause) {
		super(cause);
	}
}
