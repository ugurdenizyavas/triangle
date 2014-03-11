package com.deniz.framework.dto.converter.business;


import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;
import com.deniz.framework.dto.converter.business.impl.MetaConvention;
import com.deniz.framework.dto.converter.business.impl.exception.ConversionFailedException;


/**
 * Utility class to search through the Metas of a given object an summarize information about e.b. how many
 * errors are contained, if value changes are contained, etc.
 * <p/>
 * @author Deniz Yavas
 */
public final class MetaInspectionUtil
{

	/**
	 * Checks if a validatable Entity contains warnings.
	 * All contained Collection typed properties are also taken into account.
	 * @param o the object to check for warnings
	 * @return {@code true} if the object contains a warning , {@code false} if no warnings are contained
	 */
	public static boolean hasWarnings( AbstractDto o )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				if ( meta.getHasWarnings() )
					return true;
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				Collection<AbstractDto> objectsFromCollection = getObjectsFromCollection( method, o );
				if ( objectsFromCollection.isEmpty() )
				{
					continue;
				}
				if ( hasWarnings( objectsFromCollection ) )
				{
					return true;
				}
			}
		}
		return false;
	}

	public static List<String> listErrors( AbstractDto o )
	{
		List<String> propertiesWithErrors = new ArrayList<String>();
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				if ( meta.getHasErrors() )
				{
					propertiesWithErrors.add( MetaConvention.getPropertyName( method ) );
				}
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				if ( hasErrors( getObjectsFromCollection( method, o ) ) )
				{
					propertiesWithErrors.add( MetaConvention.getPropertyName( method ) );
				}
			}
		}
		return propertiesWithErrors;
	}

	public static String getMetasValue( Object sourceObject, Method sourceMethod ) throws IllegalAccessException, InvocationTargetException
	{
		return MetaInspectionUtil.getMeta( sourceMethod, sourceObject ).getValue();
	}

	public static List<String> getMetasValueList( Object sourceObject, Method sourceMethod ) throws IllegalAccessException, InvocationTargetException
	{
		return MetaInspectionUtil.getMeta( sourceMethod, sourceObject ).getValueList();
	}

	public static boolean isMetaLocked( Object sourceObject, Method sourceMethod ) throws IllegalAccessException, InvocationTargetException
	{
		return MetaInspectionUtil.getMeta( sourceMethod, sourceObject ).isLocked();
	}

	static private Meta getMeta( Method method, Object object )
	{
		try
		{
			return (Meta) method.invoke( object );
		}
		catch ( Exception e )
		{
			throw new ConversionFailedException( "Could not get Meta of via method:  " + method.getName(), e );
		}
	}

	/**
	 * Returns the entities for the given method and takes care of error handling.
	 * @param method A getter method that returns a Collection
	 * @param o the object on which the method will be invoked
	 * @return the collection returned via the method invoked on the object
	 */
	@SuppressWarnings( "unchecked" )
	public static Collection<AbstractDto> getObjectsFromCollection( Method method, Object o )
	{
		try
		{
			return (Collection<AbstractDto>) method.invoke( o );
		}
		catch ( Exception e )
		{
			throw new ConversionFailedException( "Could not get property " + method.getName(), e );
		}
	}

	public static boolean hasWarnings( Collection<AbstractDto> collection )
	{
		boolean hasWarnings = false;
		for ( AbstractDto objectFromCollection : collection )
		{
			if ( !hasWarnings( objectFromCollection ) )
			{
				return false;
			}
			else
			{
				hasWarnings = true;
			}
		}
		return hasWarnings;
	}

	/**
	 * Checks for errors in the given object
	 * @param o the object to check for errors
	 * @return {@code true} if the object contains errors, {@code false} otherwise
	 */
	public static boolean hasErrors( AbstractDto o )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				if ( meta.getHasErrors() )
				{
					return true;
				}
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				if ( hasErrors( getObjectsFromCollection( method, o ) ) )
				{
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Checks for errors in the given Collection
	 * @param collection the collection to check for errors
	 * @return {@code true} if any object inside the collection contains an error, {@code false} otherwise
	 */
	public static boolean hasErrors( Collection<AbstractDto> collection )
	{
		for ( AbstractDto o : collection )
		{
			if ( hasErrors( o ) )
			{
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks for value changes in the given object
	 * @param o the object to check for value changes
	 * @return {@code true} if the object contains value changes, {@code false} otherwise
	 */
	public static boolean isValueChanged( AbstractDto o )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				if ( meta.isValueChanged() )
				{
					return true;
				}
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				if ( isValueChanged( getObjectsFromCollection( method, o ) ) )
				{
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Checks for changed values in the given Collection
	 * @param collection the collection to check for value changes
	 * @return {@code true} if any object inside the collection contains an error, {@code false} otherwise
	 */
	public static boolean isValueChanged( Collection<AbstractDto> collection )
	{
		for ( AbstractDto o : collection )
		{
			if ( isValueChanged( o ) )
			{
				return true;
			}
		}
		return false;
	}

	/**
	 * This implementation loops over all {@link Meta} Properties and counts the number of error.
	 * <p/>
	 * All contained Collection properties are also taken into account.
	 * @param o the object whose errors should be counted
	 * @return the number of errors contained in the object
	 */
	public static int getNumberOfErrors( AbstractDto o )
	{
		int numberOfErrors = 0;
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				numberOfErrors += meta.getNumberOfErrors();
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				numberOfErrors += getNumberOfErrors( getObjectsFromCollection( method, o ) );
			}
		}
		return numberOfErrors;
	}

	public static int getNumberOfErrors( Collection<AbstractDto> collection )
	{
		int numberOfErrorsInCollection = 0;
		for ( AbstractDto objectFromCollection : collection )
		{
			numberOfErrorsInCollection += getNumberOfErrors( objectFromCollection );
		}
		return numberOfErrorsInCollection;
	}

	/**
	 * Checks if a given object has warnings or errors.
	 * All contained Collection properties are also taken into account.
	 * @param o the object that is to be checked for warnings or errors
	 * @return true if the object contains warnings or errors
	 */
	public static boolean hasWarningsOrErrors( AbstractDto o )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				if ( meta.hasWarningsOrErrors() )
				{
					return true;
				}
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				if ( hasWarningsOrErrors( getObjectsFromCollection( method, o ) ) )
				{
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Checks if a given object has statuses.
	 * @param o the object that is to be checked for warnings or errors
	 * @return true if the object status has status message
	 */
	public static boolean hasStatuses( AbstractDto o )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				if ( meta.getHasStatuses() )
				{
					return true;
				}
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				if ( hasWarningsOrErrors( getObjectsFromCollection( method, o ) ) )
				{
					return true;
				}
			}
		}
		return false;
	}

	public static boolean hasWarningsOrErrors( Collection<AbstractDto> collection )
	{
		for ( AbstractDto objectInCollection : collection )
		{
			if ( hasWarningsOrErrors( objectInCollection ) )
			{
				return true;
			}
		}
		return false;
	}


	/**
	 * For all Metas contained in the given object recursively: All errors and warnings are removed and valueChanged is set to
	 * false.
	 * @param objectWithMetas the object that should be searched for metas
	 */
	public static void resetMetasErrorsAndWarningsAndValueChanged( AbstractDto objectWithMetas )
	{
		resetMetas( objectWithMetas, false, true, true, true );
	}

	/**
	 * For all Metas contained in the given object recursively: All errors and warnings are removed.
	 * @param objectWithMetas the object that should be searched for metas
	 */
	public static void resetMetasErrorsAndWarnings( AbstractDto objectWithMetas )
	{
		if ( objectWithMetas != null )
		{
			resetMetas( objectWithMetas, false, false, true, true );
		}
	}

	/**
	 * Calls {@link Meta#reset(boolean, boolean, boolean, boolean)} for all Metas contained in
	 * the given object recursively.
	 */
	public static void resetMetas( AbstractDto o, boolean value, boolean valueChanged, boolean errors, boolean warnings )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				meta.reset( value, valueChanged, errors, warnings );
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				resetMetas( getObjectsFromCollection( method, o ), value, valueChanged, errors, warnings );
			}
		}
	}

	private static void resetMetas( Collection<AbstractDto> collection, boolean value, boolean valueChanged, boolean errors, boolean warnings )
	{
		for ( AbstractDto objectInCollection : collection )
		{
			resetMetas( objectInCollection, value, valueChanged, errors, warnings );
		}
	}


	public static void setAllLocked( AbstractDto o, boolean newValue )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				meta.setLocked( newValue );
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				setAllLocked( getObjectsFromCollection( method, o ), newValue );
			}
		}
	}

	private static void setAllLocked( Collection<AbstractDto> collection, boolean newValue )
	{
		for ( AbstractDto objectInCollection : collection )
		{
			setAllLocked( objectInCollection, newValue );
		}
	}

	public static void setLockedChangedTrue( AbstractDto o, LockedChangedTrueMode mode )
	{
		for ( Method method : o.getClass().getMethods() )
		{
			if ( MetaConvention.isReturnTypeMeta( method ) )
			{
				Meta meta = getMeta( method, o );
				if ( mode == LockedChangedTrueMode.ALWAYS )
				{
					meta.setLockedChanged( true );
				}
				else if ( mode == LockedChangedTrueMode.IF_LOCKED_IS_TRUE )
				{
					if ( meta.isLocked() )
						meta.setLockedChanged( true );
				}
			}
			else if ( MetaConvention.isReturningCollection( method ) )
			{
				setLockedChangedTrue( getObjectsFromCollection( method, o ), mode );
			}
		}
	}

	private static void setLockedChangedTrue( Collection<AbstractDto> collection, LockedChangedTrueMode mode )
	{
		for ( AbstractDto objectInCollection : collection )
		{
			setLockedChangedTrue( objectInCollection, mode );
		}
	}

	public enum LockedChangedTrueMode
	{
		ALWAYS,
		IF_LOCKED_IS_TRUE
	}


}