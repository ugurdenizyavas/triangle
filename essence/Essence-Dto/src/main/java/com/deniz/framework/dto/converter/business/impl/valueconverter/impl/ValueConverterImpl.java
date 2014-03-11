package com.deniz.framework.dto.converter.business.impl.valueconverter.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.deniz.framework.dto.converter.business.impl.valueconverter.ValueConverter;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.NoConverterRegisteredException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter.ConverterTemplate;
import com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter.GenericConverterTemplate;

/**
 * A configurable implementation of the
 * {@link com.celebi.framework.dto.converter.business.impl.valueconverter.ValueConverter}
 * interface.
 * <p/>
 * <p>
 * The actual conversion of a value is delegated to subclasses of the
 * {@link com.celebi.framework.dto.converter.business.impl.valueconverter.impl.converter.ConverterTemplate}.
 * <p/>
 * <p>
 * <b>Default Converters:</b> Converters that are registered under a Java type:
 * 
 * <pre>
 *    String.class -> new StringConverter()
 *    Date.class -> new TestDateConverter()
 * </pre>
 * <p/>
 * <p>
 * <b>Special Converters:</b> Converters that are registered under the
 * properyName that they have in an entity class:
 * 
 * <pre>
 *    "delayCode", new SpecialAviationTimeDurationConverter()
 * </pre>
 * <p/>
 * 
 * @author Deniz Yavas
 */
public class ValueConverterImpl implements ValueConverter {

	private Map<String, ConverterTemplate> specialConverters; // String is the
																// propertyName,
																// e.g.
																// "firstname"
	private Map<String, ConverterTemplate> defaultConverters; // String is the
																// classname,
																// e.g.
																// "java.lang.String"
	private List<GenericConverterTemplate> genericConverters; // Not registered
																// under a
																// String

	public ValueConverterImpl() {
		defaultConverters = new HashMap<String, ConverterTemplate>();
		specialConverters = new HashMap<String, ConverterTemplate>();
	}

	public Object convertToX(String sourceValue, Class targetType, String propertyName) {
		if (specialConverters.containsKey(propertyName) && targetType != String.class) {
			ConverterTemplate specialConverter = specialConverters.get(propertyName);
			return specialConverter.convertToX(sourceValue, targetType);
		} else if (defaultConverters.containsKey(targetType.getName())) {
			ConverterTemplate defaultConverter = defaultConverters.get(targetType.getName());
			if (defaultConverter != null) {
				return defaultConverter.convertToX(sourceValue, targetType);
			}
		} else {
			for (GenericConverterTemplate genericConverter : genericConverters) {
				if (genericConverter.isTypeSupported(targetType)) {
					return genericConverter.convertToX(sourceValue, targetType);
				}
			}
		}
		throw new NoConverterRegisteredException("No converter found for type " + targetType);
	}

	public String convertToString(Object sourceValue, String propertyName) {
		if (sourceValue == null)
			return null;
		if (specialConverters.containsKey(propertyName) && sourceValue.getClass() != String.class) {
			ConverterTemplate specialConverter = specialConverters.get(propertyName);
			return specialConverter.convertToString(sourceValue);
		} else if (defaultConverters.containsKey(sourceValue.getClass().getName())) {
			ConverterTemplate defaultConverter = defaultConverters.get(sourceValue.getClass().getName());
			if (defaultConverter != null) {
				return defaultConverter.convertToString(sourceValue);
			}
		} else {
			for (GenericConverterTemplate genericConverter : genericConverters) {
				if (genericConverter.isTypeSupported(sourceValue.getClass())) {
					return genericConverter.convertToString(sourceValue);
				}
			}
		}
		throw new NoConverterRegisteredException("No converter found for type " + sourceValue.getClass());
	}

	public void setDefaultConverters(Map<String, ConverterTemplate> defaultConverters) {
		this.defaultConverters = defaultConverters;
	}

	public void setSpecialConverters(Map<String, ConverterTemplate> specialConverters) {
		this.specialConverters = specialConverters;
		for (Map.Entry<String, ConverterTemplate> entry : specialConverters.entrySet()) {
			entry.getKey();
			if (entry.getValue().getSupportedClass().equals(String.class)) {
				throw new RuntimeException("Special Converters may not be added for String to String conversions.");
			}
		}
	}

	public void setGenericConverters(List<GenericConverterTemplate> genericConverters) {
		this.genericConverters = genericConverters;
	}
}
