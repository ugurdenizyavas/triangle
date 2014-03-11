package com.deniz.framework.dto.converter.business.impl;


import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.deniz.framework.dto.Meta;


/**
 * Implements the copy logic for the copy direction
 * 
 * <pre>
 * Property -> Meta
 * </pre>
 * <p/>
 * @author Deniz Yavas
 */
public class CopyPropertyToMeta extends Copier
{
	protected final Logger logger = LoggerFactory.getLogger( getClass() );


	public void copyObject( Object source, Object target, List<String> blackList )
	{
		if ( source == null )
		{
			logger.warn( "CopyObject was called on empty source" );
			return;
		}

		if ( target == null )
		{
			logger.warn( "CopyObject was called on empty target" );
			return;
		}
		for ( Method method : source.getClass().getMethods() )
		{
			String propertyName = MetaConvention.getPropertyName( method );
			if ( MetaConvention.isGetter( method ) && isNotInBlacklist( blackList, propertyName ) )
			{
				copyId( method, source, target );
				if ( isCopyableMethod( method ) )
				{
					copyProperty( source, target, method );
				}
				else if ( MetaConvention.isReturningCollection( method ) )
				{
					copyCollection( source, target, method, null ); // blackList set to null so that we only use it in first
																	// recursion.
				}
			}
		}
	}

	/**
	 * If source and target have both a property "id" the value is copied.
	 */
	private void copyId( Method sourceMethod, Object source, Object target )
	{
		if ( source == target )
			return;
		if ( sourceMethod.getName().equals( "getId" ) )
		{
			try
			{
				Object value = sourceMethod.invoke( source );
				String convertedValue = null;

				if ( value != null )
				{
					convertedValue = valueConverter.convertToString( value, "id" );
				}
				boolean hasSetId = ReflectionUtil.hasMethod( target, "setId" );
				if ( convertedValue != null && hasSetId )
					PropertyUtils.setProperty( target, "id", convertedValue );
			}
			catch ( IllegalAccessException e )
			{
				e.printStackTrace(); // To change body of catch statement use File | Settings | File Templates.
			}
			catch ( InvocationTargetException e )
			{
				e.printStackTrace(); // To change body of catch statement use File | Settings | File Templates.
			}
			catch ( NoSuchMethodException e )
			{
				e.printStackTrace(); // To change body of catch statement use File | Settings | File Templates.
			}
		}
	}

	private boolean isNotInBlacklist( List<String> blackList, String propertyName )
	{
		return blackList == null || !blackList.contains( propertyName );
	}


	private void copyCollection( Object source, Object target, Method methodToCopy, List<String> blackList )
	{
		try
		{
			logCopyCollection( source, methodToCopy );
			Collection<?> collection = new ArrayList();
			collection = (Collection) methodToCopy.invoke( source );
			if ( collection == null )
				return;
			for ( Object sourceObject : collection )
			{
				if ( source.equals( target ) )
				{
					copyObject( sourceObject, sourceObject, blackList );
				}
				else
				{
					String collectionFieldName = MetaConvention.getPropertyName( methodToCopy );
					Object targetEntityInCollection = getTargetEntityInCollection( collectionFieldName, target );
					copyObject( sourceObject, targetEntityInCollection, blackList );
					addToCollection( collectionFieldName, target, targetEntityInCollection );
				}
			}
		}
		catch ( IllegalAccessException e )
		{
			throwConversionFailedException( source, methodToCopy.getName(), e );
		}
		catch ( InvocationTargetException e )
		{
			throwConversionFailedException( source, methodToCopy.getName(), e );
		}
		catch ( NoSuchFieldException e )
		{
			throwConversionFailedException( source, methodToCopy.getName(), e );
		}
		catch ( InstantiationException e )
		{
			throwConversionFailedException( source, methodToCopy.getName(), e );
		}
		catch ( NoSuchMethodException e )
		{
			throwConversionFailedException( source, methodToCopy.getName(), e );
		}
	}


	private void logCopyCollection( Object entity, Method methodToCopy )
	{
		if ( logger.isDebugEnabled() )
		{
			String propertyName = MetaConvention.getPropertyName( methodToCopy );
			logger.debug( "copyCollection: {}.{}", entity.getClass().getSimpleName(), propertyName );
		}
	}

	/**
	 * Maps one property (identified by it getter method) of the given Entity to its respective Meta property.
	 * If the target object does not have a Meta getter for a given property than this property is ignored.
	 * @param source the object from which properties will be copied
	 * @param target the object on which the meta value will be set
	 * @param sourceMethod the method used to access the sources property
	 */
	private void copyProperty( Object source, Object target, Method sourceMethod )
	{
		String propertyName = null;
		try
		{
			propertyName = MetaConvention.getPropertyName( sourceMethod );
			String metaPropertyName = MetaConvention.getMetaPropertyName( propertyName );
			if ( ReflectionUtil.hasGetterFor( target, metaPropertyName ) )
			{

				Object value = sourceMethod.invoke( source );

				if ( value != null )
				{
					if ( value instanceof List )
					{
						List<String> valueList = (List<String>) value;
						List<String> convertedValues = new ArrayList();
						for ( String oneValue : valueList )
						{
							String oneConvertedValue = valueConverter.convertToString( oneValue, propertyName );
							convertedValues.add( oneConvertedValue );
						}
						Meta meta = (Meta) PropertyUtils.getProperty( target, metaPropertyName );
						meta.setValueList( convertedValues );
						logCopyPropertyList( source, target, propertyName, valueList, convertedValues );
					}
					else
					{
						String convertedValue = valueConverter.convertToString( value, propertyName );
						Meta meta = (Meta) PropertyUtils.getProperty( target, metaPropertyName );
						meta.setValue( convertedValue );
						logCopyProperty( source, target, propertyName, value, convertedValue );
					}
				}
			}
			else
			{
				logNoMetaNoCopyProperty( source, target, propertyName, metaPropertyName );
			}
		}
		catch ( Exception e )
		{
			throwConversionFailedException( target, propertyName, e );
		}
	}


	private void logCopyProperty( Object source, Object target, String propertyName, Object value, String convertedValue )
	{
		if ( logger.isDebugEnabled() )
		{
			String classNameSource = source.getClass().getSimpleName();
			String classNameTarget = target.getClass().getSimpleName();
			logger.debug(
					"copyProperty: {}.{}['{}'] --> {}.{}['{}']",
					new String[] { classNameSource, propertyName, ObjectUtils.toString( value ), classNameTarget,
									MetaConvention.getMetaPropertyName( propertyName ), convertedValue } );
		}
	}

	private void logCopyPropertyList( Object source, Object target, String propertyName, List<String> values, List<String> convertedValues )
	{
		if ( logger.isDebugEnabled() )
		{
			String classNameSource = source.getClass().getSimpleName();
			String classNameTarget = target.getClass().getSimpleName();
			logger.debug(
					"copyProperty: {}.{}['{}'] --> {}.{}['{}']",
					new String[] { classNameSource, propertyName, ObjectUtils.toString( values ), classNameTarget,
									MetaConvention.getMetaPropertyName( propertyName ), convertedValues.toString() } );
		}
	}

	private void logNoMetaNoCopyProperty( Object source, Object target, String propertyName, String metaPropertyName )
	{
		if ( logger.isDebugEnabled() )
		{
			String classNameSource = source.getClass().getSimpleName();
			logger.debug( "copyProperty: {}.{} --> not copied as no {} exists. ", new String[] { classNameSource, propertyName, metaPropertyName } );
		}
	}


	private boolean isCopyableMethod( Method method )
	{
		boolean isSimpleGetter = MetaConvention.isGetter( method ) && !MetaConvention.isJavaLangObjectGetterMethod( method )
									&& !MetaConvention.isReturningCollection( method ) && !MetaConvention.isReturnTypeMeta( method );
		boolean isListOfStringGetter = MetaConvention.isGetter( method ) && MetaConvention.isReturningListOfString( method )
										&& !MetaConvention.isJavaLangObjectGetterMethod( method ) && !MetaConvention.isReturnTypeMeta( method );
		return (isSimpleGetter || isListOfStringGetter);

	}


}
