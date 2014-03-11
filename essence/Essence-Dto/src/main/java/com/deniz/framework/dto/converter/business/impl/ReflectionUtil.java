package com.deniz.framework.dto.converter.business.impl;

import java.lang.reflect.Method;

import org.apache.commons.lang.StringUtils;


/**
 * Utility class that deals with Java Reflection logic that is used in the
 * {@link com.celebi.framework.dto.converter.business.impl.ObjectConverterServiceImpl} or it's subcomponents.
 * <p>
 * 
 * @author Deniz Yavas
 */
final class ReflectionUtil
{

	static Class getFieldType( Object object, String propertyName ) throws NoSuchMethodException
	{
		try
		{
			String getterName = getGetter( propertyName );
			Method method = object.getClass().getMethod( getterName );
			return method.getReturnType();
		}
		catch ( NoSuchMethodException e )
		{
			String isMethodName = getIsMethodName( propertyName );
			Method method = object.getClass().getMethod( isMethodName );
			return method.getReturnType();
		}
	}


	static String getGetter( String propertyName )
	{
		return "get" + StringUtils.capitalise( propertyName ); // Javadoc did not give hints which method to use instead.
	}

	static String getIsMethodName( String propertyName )
	{
		return "is" + StringUtils.capitalise( propertyName ); // Javadoc did not give hints which method to use instead.
	}


	static boolean hasGetterFor( Object object, String propertyName )
	{
		String getterName = getGetter( propertyName );
		return hasMethod( object, getterName );
	}


	static boolean hasMethod( Object object, String methodName )
	{
		// Implemented by iterating instead of calling getMethod(methodName) to avoid the cost of throwing/catching
		// NoSuchMethodException
		Method[] methods = object.getClass().getMethods();
		for ( Method method : methods )
		{
			if ( method.getName().equals( methodName ) )
				return true;
		}
		return false;
	}

}