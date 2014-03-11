package com.deniz.framework.logging;

import org.apache.commons.lang.ObjectUtils;

import com.deniz.framework.dto.AbstractDto;


/**
 * This helper is intended for usage in all *Template classes. It should not be used elsewhere because all logging
 * helper functionality is already part of the *Template classes.
 * 
 * @author Deniz Yavas
 */
public class LoggingHelper
{

	public static String getTypeAndPk( AbstractDto abstractDto )
	{
		return abstractDto.getClass().getName() + ":" + ObjectUtils.toString( abstractDto.getId(), null );
	}

	public static String getTypeAndPk( String className, Long id )
	{
		return className + ":" + ObjectUtils.toString( id, null );
	}

}
