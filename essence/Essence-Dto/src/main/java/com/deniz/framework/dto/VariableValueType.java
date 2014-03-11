package com.deniz.framework.dto;

import java.io.Serializable;


/**
 * The types that are known by the centralservices multi language layer. These types are used for variable values within
 * localization messages.
 * 
 * <p>
 * Example of a localization message as it is returned by an application:
 * 
 * <pre class="code">
 * fandango.report.common.validation.mandatory-field-is-empty|fieldId:authorName
 * </pre>
 * @author Deniz Yavas
 */
public enum VariableValueType implements Serializable
{
	STRING( "string" ),
	INT( "int" ),
	FLOAT( "float" ),
	FIELD_ID( "fieldId" );

	private final String name;

	VariableValueType( String name )
	{
		this.name = name;
	}

	public String getName()
	{
		return name;
	}
}
