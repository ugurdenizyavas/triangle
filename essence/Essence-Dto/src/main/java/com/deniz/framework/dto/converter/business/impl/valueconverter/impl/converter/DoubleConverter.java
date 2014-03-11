package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

public class DoubleConverter extends ConverterTemplate
{
	@Override
	public Class getSupportedClass()
	{
		return Double.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		return Double.toString( (Double) value );
	}

	@Override
	protected Object doConvertToX( String value )
	{
		return new Double( value );
	}
}
