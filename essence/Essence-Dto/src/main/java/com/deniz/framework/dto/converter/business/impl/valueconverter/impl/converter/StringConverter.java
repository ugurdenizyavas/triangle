package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

/**
 * <p/>
 * Streightforward converter for values of type String.class.
 * </p>
 * @author Deniz Yavas
 */
public class StringConverter extends ConverterTemplate
{

	@Override
	public Class getSupportedClass()
	{
		return String.class;
	}

	public String doConvertToString( Object value )
	{
		return (String) value;
	}

	public Object doConvertToX( String value )
	{
		return value;
	}


}