package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.TypeNotSupportedException;

/**
 * Template that should be used for all value converters.
 * 
 * <p>
 * The template takes care of checking if the converter supports the given type
 * and takes care of error handling if not. Furthermore, the template checks for
 * null objects to convert and simply returns null in these cases without
 * calling the concrete converter.
 * <p>
 * 
 * @author Deniz Yavas
 */
public abstract class ConverterTemplate {

	public String convertToString(Object value) {
		if (value == null)
			return null;
		checkIfTypeSupported(value.getClass(), value);
		return doConvertToString(value);
	}

	public Object convertToX(String value, Class targetType) {
		if (value == null)
			return null;
		checkIfTypeSupported(targetType, value);
		try {
			return doConvertToX(value);
		} catch (DataNotExistException e) {
			throw new RuntimeException("Entity with simpleName " + value + " does not exist");
		}
	}

	protected void checkIfTypeSupported(Class type, Object value) {
		// the superclass check is needed for special converters that deal with
		// data and sql.timestamps
		if (type != getSupportedClass() && type != getSupportedClass().getSuperclass()) {
			throw new TypeNotSupportedException("Error during value conversion of value '" + value + "'. " + " to Type '" + type + "'. '"
					+ this.getClass().getSimpleName() + "' only supports '" + getSupportedClass().getSimpleName() + "'.");
		}
	}

	/**
	 * Return the type that is this converter is able to convert. A typical
	 * implementation looks like this:
	 * <p>
	 * <tt>return Integer.class;</tt>
	 * 
	 * @return The type that is supported by this converter
	 */
	public abstract Class getSupportedClass();

	protected abstract String doConvertToString(Object value);

	protected abstract Object doConvertToX(String value) throws DataNotExistException;

}
