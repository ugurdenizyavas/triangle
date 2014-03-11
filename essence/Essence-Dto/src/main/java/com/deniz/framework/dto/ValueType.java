package com.deniz.framework.dto;

/**
 * This is the type of the value that is contained in a Meta object.
 * 
 * <p>
 * The type corresponds to the json.org conventions for json packages. We need to know this type in order to decide if the value
 * should be added with "" or not. E.g. type string always has surrounding quotation marks where boolean types do not have
 * surrounding quotation marks.
 * 
 * @author Deniz Yavas
 */
public enum ValueType
{
	STRING,
	NUMBER,
	BOOLEAN,
}
