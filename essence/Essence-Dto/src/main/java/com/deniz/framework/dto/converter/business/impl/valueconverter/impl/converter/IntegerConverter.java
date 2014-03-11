package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

/**
 * Streightforward converter for values of type Integer.class.
 * <p>
 * @author Deniz Yavas
 */
public class IntegerConverter extends ConverterTemplate
{

	@Override
	public Class getSupportedClass()
	{
		return Integer.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		return ((Integer) value).toString();
	}

	@Override
	protected Object doConvertToX( String value )
	{
		return Integer.parseInt( value );
	}

}
