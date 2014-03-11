package com.deniz.framework.dto.converter.business.impl.valueconverter;

/**
 * A value converter is an interface for String -> some simple type -> String conversions.
 * 
 * <p>
 * The conversions are intended for simple types, e.g. to convert a String representation of a date back to date and vice versa.
 * <p>
 * @author Deniz Yavas
 */
public interface ValueConverter
{

	Object convertToX( String sourceValue, Class targetType, String propertyName );

	String convertToString( Object sourceValue, String propertyName );

}
