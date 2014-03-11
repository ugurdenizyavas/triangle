package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

/**
 * Straightforward converter for values of type Boolean.class.
 * <p>
 * @author Deniz Yavas
 */
public class BooleanConverter extends ConverterTemplate
{

	@Override
	public Class getSupportedClass()
	{
		return Boolean.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		return ((Boolean) value).toString();
	}

	@Override
	protected Object doConvertToX( String value )
	{
		return new Boolean( value );
	}
}
