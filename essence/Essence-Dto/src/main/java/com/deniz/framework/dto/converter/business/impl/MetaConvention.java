package com.deniz.framework.dto.converter.business.impl;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.List;

import org.apache.commons.lang.StringUtils;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;


/**
 * All knowledge about the structural conventions in an object structure that contains Meta objects is contained
 * in this class.
 * <p>
 * @author Deniz Yavas
 */
public final class MetaConvention
{


	public static boolean isGetter( Method method )
	{
		String methodsName = method.getName();

		return methodsName.startsWith( "get" ) || methodsName.startsWith( "is" );
	}


	public static String getPropertyName( Method method )
	{
		String prefix = Boolean.TYPE.isAssignableFrom( method.getReturnType() ) ? "is" : "get";

		String result;

		result = StringUtils.removeStart( method.getName(), prefix );
		result = StringUtils.removeEnd( result, "Meta" );
		result = StringUtils.uncapitalize( result );

		return result;
	}


	/**
	 * Determines if the given method is returning an object of type {@link Meta}.
	 * @param method the method to check for its return type
	 * @return {@code true} if the method returns Meta, {@code false} otherwise
	 */
	public static boolean isReturnTypeMeta( Method method )
	{

		return method.getReturnType().equals( Meta.class );
	}

	/**
	 * Is the given method returning a {@link java.util.Collection} ?
	 * @param method the method to check for its return type
	 * @return {@code true} if the method returns a {@link java.util.Collection}, {@code false} otherwise
	 */
	public static boolean isReturningCollection( Method method )
	{
		return Collection.class.isAssignableFrom( method.getReturnType() ) && method.getReturnType().isAssignableFrom( AbstractDto.class );
	}

	/**
	 * Is the given method returning a {@link java.util.List} with Type {@link java.lang.String} ?
	 * 
	 * @param method the method to check for its return type
	 * @return {@code true} if the method returns a List<String>, {@code false} otherwise
	 */
	public static boolean isReturningListOfString( Method method )
	{
		final Type returnType = method.getGenericReturnType();
		if ( returnType instanceof ParameterizedType )
		{
			ParameterizedType type = (ParameterizedType) returnType;
			Type[] typeArguments = type.getActualTypeArguments();
			boolean actualTypeString = typeArguments.length == 1 && typeArguments[ 0 ] == String.class;
			boolean rawTypeList = type.getRawType() == List.class;
			return actualTypeString && rawTypeList;
		}
		return false;
	}


	protected static String getMetaPropertyName( String propertyName )
	{
		return propertyName + "Meta";
	}


	public static boolean isJavaLangObjectGetterMethod( Method method )
	{
		String methodsName = method.getName();
		if ( methodsName.equals( "getClass" ) )
		{
			return true;
		}
		return false;
	}
}
