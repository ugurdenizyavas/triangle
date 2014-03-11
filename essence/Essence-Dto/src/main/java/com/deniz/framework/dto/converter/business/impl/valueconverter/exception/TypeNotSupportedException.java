package com.deniz.framework.dto.converter.business.impl.valueconverter.exception;

/**
 * This exception signals that a subclass of ConverterTemplate does not
 * support the type it was called with.
 * <p>
 * @author Deniz Yavas
 */
public class TypeNotSupportedException extends RuntimeException
{

	public TypeNotSupportedException( String message )
	{
		super( message );
	}

}
