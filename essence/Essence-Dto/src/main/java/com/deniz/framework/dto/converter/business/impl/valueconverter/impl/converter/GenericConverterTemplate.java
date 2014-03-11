package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.TypeNotSupportedException;


/**
 * Template that should be used for all converters that can convert more than one type.
 * 
 * <p>
 * The template takes care of checking if the converter supports the given type and takes care of error handling if not.
 * Furthermore, the template checks for null objects to convert and simply returns null in these cases without calling the
 * concrete converter.
 * <p>
 * @author Deniz Yavas
 */
public abstract class GenericConverterTemplate
{

	public String convertToString( Object value )
	{
		if ( value == null )
			return null;
		checkIfTypeSupported( value.getClass(), value );
		return doConvertToString( value );
	}

	public Object convertToX( String value, Class targetType )
	{
		if ( value == null )
			return null;
		checkIfTypeSupported( targetType, value );
		return doConvertToX( value, targetType );
	}

	private void checkIfTypeSupported( Class type, Object value )
	{
		if ( !isTypeSupported( type ) )
		{
			throw new TypeNotSupportedException( "Error during value conversion of value '" + value + "'. " + "Type " + type
													+ " is not supported by converter '" + this.getClass().getSimpleName() + "'." );
		}
	}

	/**
	 * Return the type that is this converter is able to convert. A typical implementation looks like this:
	 * <p>
	 * <tt>return Integer.class;</tt>
	 * @return true if thi
	 */
	public abstract boolean isTypeSupported( Class type );

	protected abstract String doConvertToString( Object value );

	protected abstract Object doConvertToX( String value, Class targetType );

}