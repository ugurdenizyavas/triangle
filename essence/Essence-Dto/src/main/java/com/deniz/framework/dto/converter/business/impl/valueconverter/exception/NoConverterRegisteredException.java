package com.deniz.framework.dto.converter.business.impl.valueconverter.exception;

/**
 * This exception should be thrown to signal that for the given type no converter is registered.
 * <p>
 * @author Deniz Yavas
 */
public class NoConverterRegisteredException extends RuntimeException
{
	public NoConverterRegisteredException( String message )
	{
		super( message );
	}
}
