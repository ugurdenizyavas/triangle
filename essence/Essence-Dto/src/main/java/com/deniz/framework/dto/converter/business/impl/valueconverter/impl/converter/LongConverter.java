package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

/**
 * Streightforward converter for values of type Long.class.
 * <p>
 * @author Deniz Yavas
 */
public class LongConverter extends ConverterTemplate
{
	@Override
	public Class getSupportedClass()
	{
		return Long.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		return Long.toString( (Long) value );
	}

	@Override
	protected Object doConvertToX( String value )
	{
		return new Long( value );
	}
}
