package com.deniz.framework.dto.converter.business.impl;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.apache.commons.beanutils.PropertyUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.deniz.framework.dto.converter.business.MetaInspectionUtil;


/**
 * Implements the copy logic for the copy direction
 * 
 * <pre>
 * Meta -> Property
 * </pre>
 * <p/>
 * @author Deniz Yavas
 */
public class CopyMetaToProperty extends Copier
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
				if ( MetaConvention.isReturnTypeMeta( method ) )
				{
					copyProperty( source, target, method );
				}
				else
				{
					if ( MetaConvention.isReturningCollection( method ) )
					{
						copyCollection( source, target, method, null ); // blackList set to null so that we only use it in first
																		// recursion.
					}
				}
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
			collection = (Collection<?>) methodToCopy.invoke( source );
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
	 * Copy one Meta property, identified by its getter method, of the given object, to the regular property.
	 * @param target the object on which the method is invoked
	 * @param metaGetter the accessor of the meta property
	 */
	private void copyProperty( Object source, Object target, Method metaGetter )
	{
		String propertyName = MetaConvention.getPropertyName( metaGetter );
		try
		{
			if ( MetaInspectionUtil.isMetaLocked( source, metaGetter ) )
			{
				logSkipLockedProperty( source, target, propertyName );
			}
			else
			{
				Class targetType = ReflectionUtil.getFieldType( target, propertyName );

				if ( targetType == List.class )
				{
					List<String> sourceValueList = MetaInspectionUtil.getMetasValueList( source, metaGetter );
					List<String> targetValueList = null;

					if ( sourceValueList != null )
					{
						targetValueList = new ArrayList<String>();
						for ( String sourceValue : sourceValueList )
						{
							String targetValue = (String) valueConverter.convertToX( sourceValue, String.class, propertyName );
							targetValueList.add( targetValue );
						}
					}
					PropertyUtils.setProperty( target, propertyName, targetValueList );
					logCopyProperty( source, target, propertyName, sourceValueList );
				}
				else
				{
					String sourceValue = MetaInspectionUtil.getMetasValue( source, metaGetter );
					Object targetValue = valueConverter.convertToX( sourceValue, targetType, propertyName );

					PropertyUtils.setProperty( target, propertyName, targetValue );

					logCopyProperty( source, target, propertyName, sourceValue );
				}

			}
		}
		catch ( Exception e )
		{
			throwConversionFailedException( target, propertyName, e );
		}
	}

	private void logCopyProperty( Object source, Object target, String propertyName, Object metasValue )
	{
		if ( logger.isDebugEnabled() )
		{
			String classNameSource = source.getClass().getSimpleName();
			String classNameTarget = target.getClass().getSimpleName();

			logger.debug( "copyProperty: {}.{}['{}'] --> {}.{}['{}']",
					new Object[] { classNameSource, MetaConvention.getMetaPropertyName( propertyName ), metasValue, classNameTarget, propertyName,
									metasValue } );
		}
	}

	private void logSkipLockedProperty( Object source, Object target, String propertyName )
	{
		if ( logger.isDebugEnabled() )
		{
			String classNameSource = source.getClass().getSimpleName();
			String classNameTarget = target.getClass().getSimpleName();

			logger.debug( "copyProperty: {}.{} --> skipped as Meta was locked=true",
					new Object[] { classNameSource, MetaConvention.getMetaPropertyName( propertyName ) } );
		}
	}

}
