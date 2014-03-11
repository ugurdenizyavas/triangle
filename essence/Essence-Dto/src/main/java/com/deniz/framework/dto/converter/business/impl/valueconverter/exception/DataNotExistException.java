package com.deniz.framework.dto.converter.business.impl.valueconverter.exception;

public class DataNotExistException extends Exception {
	public DataNotExistException() {
	}

	public DataNotExistException(String message) {
		super(message);
	}

	public DataNotExistException(String message, Throwable cause) {
		super(message, cause);
	}

	public DataNotExistException(Throwable cause) {
		super(cause);
	}
}
