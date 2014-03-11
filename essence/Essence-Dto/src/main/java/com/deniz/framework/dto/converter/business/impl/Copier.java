package com.deniz.framework.dto.converter.business.impl;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collection;

import org.apache.commons.beanutils.PropertyUtils;

import com.deniz.framework.dto.converter.business.ObjectConverterService;
import com.deniz.framework.dto.converter.business.impl.exception.ConversionFailedException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.ValueConverter;


/**
 * Abstract base class for all copiers.
 * 
 * <p>
 * A copier is copies properties and Meta objects as specified by the {@link ObjectConverterService} interface. Common
 * functionality like the dependency to a {@link com.celebi.framework.dto.converter.business.impl.valueconverter.ValueConverter}
 * or common error handling methods are contained in this base class.
 * <p>
 * 
 * @author Deniz Yavas
 */
public abstract class Copier
{
	protected ValueConverter valueConverter;


	protected void throwConversionFailedException( Object target, String propertyName, Exception e )
	{
		throw new ConversionFailedException( "Could not convert " + target.getClass().getSimpleName() + "." + propertyName, e );
	}

	/**
	 * For a given entity object and a field name of a collection(that is contained in the given entity),
	 * an object is instantiated that is of the same type as the entities contained in the collection.
	 * @param collectionFieldName The name of a collection field in the targetEntity
	 * @param targetEntity The entity that contains the collectionFieldName.
	 */
	protected Object getTargetEntityInCollection( String collectionFieldName, Object targetEntity ) throws NoSuchFieldException, IllegalAccessException, InstantiationException
	{
		Field collectionField = targetEntity.getClass().getDeclaredField( collectionFieldName );
		ParameterizedType collectionFieldType = (ParameterizedType) collectionField.getGenericType();

		Type[] collectionGenericTypes = collectionFieldType.getActualTypeArguments();
		Class targetEntityInCollectionClass = (Class) collectionGenericTypes[ 0 ];
		return targetEntityInCollectionClass.newInstance();
	}

	protected void addToCollection( String collectionFieldName, Object targetEntity, Object targetEntityInCollection ) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException
	{
		Collection targetCollection = (Collection) PropertyUtils.getProperty( targetEntity, collectionFieldName );

		Method addToCollectionMethod = targetCollection.getClass().getMethod( "add", Object.class );
		addToCollectionMethod.invoke( targetCollection, targetEntityInCollection );
	}


	public void setValueConverter( ValueConverter valueConverter )
	{
		this.valueConverter = valueConverter;
	}

}
