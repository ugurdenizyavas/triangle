package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

/**
 * Streightforward converter for values of type Long.class.
 * <p>
 * @author Deniz Yavas
 */
public class FloatConverter extends ConverterTemplate
{
	@Override
	public Class getSupportedClass()
	{
		return Float.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		return Float.toString( (Float) value );
	}

	@Override
	protected Object doConvertToX( String value )
	{
		return new Float( value );
	}
}
