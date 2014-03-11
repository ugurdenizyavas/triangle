package com.deniz.framework.dto.converter.business.impl;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.deniz.framework.dto.converter.business.ObjectConverterService;


/**
 * The service implementation delegates to {@link com.celebi.framework.dto.converter.business.impl.Copier} instances
 * for the actual conversion.
 * <p/>
 * <p/>
 * 
 * @author Deniz Yavas
 */
public class ObjectConverterServiceImpl implements ObjectConverterService
{
	protected final Logger logger = LoggerFactory.getLogger( getClass() );

	private CopyMetaToProperty copyMetaToProperty;
	private CopyPropertyToMeta copyPropertyToMeta;


	public void setCopyMetaToProperty( CopyMetaToProperty copyMetaToProperty )
	{
		this.copyMetaToProperty = copyMetaToProperty;
	}

	public void setCopyPropertyToMeta( CopyPropertyToMeta copyPropertyToMeta )
	{
		this.copyPropertyToMeta = copyPropertyToMeta;
	}

	public void copyPropertiesToMetas( Object source, Object target )
	{
		copyPropertiesToMetas( source, target, (String[]) null );
	}

	public void copyPropertiesToMetas( Object sourceAndTarget )
	{
		copyPropertiesToMetas( sourceAndTarget, (String[]) null );
	}

	public void copyPropertiesToMetas( Object source, Object target, String... blackListArray )
	{
		if ( source == null || target == null )
		{
			logger.warn( "Copy was called with null arguments" );
			return;
		}

		List<String> blackList;
		if ( blackListArray == null )
		{
			blackList = Collections.emptyList();
		}
		else
		{
			blackList = Arrays.asList( blackListArray );
		}

		logPropertiesToMetas( source, target, blackList );

		copyPropertyToMeta.copyObject( source, target, blackList );
	}

	private void logPropertiesToMetas( Object source, Object target, List<String> blackList )
	{
		if ( logger.isDebugEnabled() )
		{
			String[] parameters = new String[] { source.getClass().getSimpleName(), target.getClass().getSimpleName(), blackList.toString() };
			logger.debug( "copyPropertiesToMetas: Source={}, Target={}, BlackList={}", parameters );
		}
	}

	public void copyPropertiesToMetas( Object sourceAndTarget, String... blackListArray )
	{
		if ( sourceAndTarget == null )
		{
			logger.warn( "CopyProperties was called with null instead of an entity" );
			return;
		}

		this.copyPropertiesToMetas( sourceAndTarget, sourceAndTarget, blackListArray );
	}

	public void copyMetasToProperties( Object sourceAndTarget )
	{
		copyMetasToProperties( sourceAndTarget, sourceAndTarget );
	}

	public void copyMetasToProperties( Object source, Object target )
	{
		copyMetasToProperties( source, target, (String[]) null );
	}

	public void copyMetasToProperties( Object source, Object target, String... blackListArray )
	{
		if ( source == null || target == null )
		{
			logger.warn( "Copy was called with null arguments" );
			return;
		}

		List<String> blackList;
		if ( blackListArray == null )
		{
			blackList = Collections.emptyList();
		}
		else
		{
			blackList = Arrays.asList( blackListArray );
		}

		logMetasToProperties( source, target, blackList );
		copyMetaToProperty.copyObject( source, target, blackList );
	}

	private void logMetasToProperties( Object source, Object target, List<String> blackList )
	{
		if ( logger.isDebugEnabled() )
		{
			String[] parameters = new String[] { source.getClass().getSimpleName(), target.getClass().getSimpleName(), blackList.toString() };
			logger.debug( "copyMetasToProperties: Source={}, Target={}, BlackList={}", parameters );
		}
	}

}
