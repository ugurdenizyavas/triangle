package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import com.deniz.framework.dto.converter.business.impl.exception.ConversionFailedException;


/**
 * A converter that can convert all Enums by using the Enums' field names as Strings.
 * 
 * @author Deniz Yavas
 */
public class GenericEnumConverter extends GenericConverterTemplate
{

	@Override
	public boolean isTypeSupported( Class type )
	{
		return type.isEnum();
	}


	@Override
	protected String doConvertToString( Object value )
	{
		return value.toString();
	}

	@Override
	protected Object doConvertToX( String value, Class targetType )
	{

		Object[] enumConstants = targetType.getEnumConstants();
		for ( Object enumConstant : enumConstants )
		{
			if ( enumConstant.toString().equals( value ) )
				return enumConstant;
		}
		throw new ConversionFailedException( "Enum value " + value + "could not be found in Enum " + targetType );
	}
}
