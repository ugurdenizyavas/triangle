package com.deniz.framework.dto.converter.business.impl.exception;

/**
 * Unchecked exception that is thrown when severe errors occur during the conversion.
 * <p>
 * @author Deniz Yavas
 */
public class ConversionFailedException extends RuntimeException
{

	public ConversionFailedException( String message )
	{
		super( message );
	}

	public ConversionFailedException( String message, Throwable cause )
	{
		super( message, cause );
	}
}
